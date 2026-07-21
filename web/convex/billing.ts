import { v } from 'convex/values';
import { auth } from './auth';
import { internalMutation, mutation, type MutationCtx } from './_generated/server';
import {
  isActiveSubscriptionStatus,
  isStripeEventModeAllowed,
  planForPaymentLink,
  type NormalizedStripeEvent,
  type PaidPlan,
} from './stripeWebhookModel';
import { isPaidSaasEnabled, requirePaidSaasEnabled } from './paidFeature';

const normalizedEventArgs = {
  eventId: v.string(),
  eventType: v.union(
    v.literal('checkout.session.completed'),
    v.literal('invoice.paid'),
    v.literal('invoice.payment_failed'),
    v.literal('customer.subscription.updated'),
    v.literal('customer.subscription.deleted'),
  ),
  created: v.number(),
  livemode: v.boolean(),
  customerId: v.optional(v.string()),
  subscriptionId: v.optional(v.string()),
  paymentLinkId: v.optional(v.string()),
  email: v.optional(v.string()),
  paymentStatus: v.optional(v.string()),
  subscriptionStatus: v.optional(v.string()),
};

function configuredLinks() {
  return {
    team: process.env.STRIPE_PAYMENT_LINK_TEAM_ID?.trim(),
    cabinet: process.env.STRIPE_PAYMENT_LINK_CABINET_ID?.trim(),
    pilot: process.env.STRIPE_PAYMENT_LINK_PILOT_ID?.trim(),
  };
}

async function findUserForBilling(
  ctx: MutationCtx,
  event: NormalizedStripeEvent,
) {
  if (event.subscriptionId) {
    const bySubscription = await ctx.db
      .query('users')
      .withIndex('by_stripe_subscription', (q) => q.eq('stripeSubscriptionId', event.subscriptionId))
      .unique();
    if (bySubscription) return bySubscription;
  }
  if (event.customerId) {
    const byCustomer = await ctx.db
      .query('users')
      .withIndex('by_stripe_customer', (q) => q.eq('stripeCustomerId', event.customerId))
      .unique();
    if (byCustomer) return byCustomer;
  }
  if (event.email) {
    const byEmail = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', event.email))
      .unique();
    return byEmail?.emailVerificationTime ? byEmail : null;
  }
  return null;
}

async function upsertPendingEntitlement(
  ctx: MutationCtx,
  event: NormalizedStripeEvent,
  plan: PaidPlan,
  status: string,
) {
  if (!event.email || !event.subscriptionId) return;
  const existing = await ctx.db
    .query('pendingEntitlements')
    .withIndex('by_email', (q) => q.eq('email', event.email as string))
    .unique();
  const value = {
    email: event.email,
    plan,
    stripeCustomerId: event.customerId,
    stripeSubscriptionId: event.subscriptionId,
    status,
    updatedAt: Date.now(),
  };
  if (existing) await ctx.db.patch(existing._id, value);
  else await ctx.db.insert('pendingEntitlements', value);
}

/** Atomic, internal-only Stripe event application. */
export const processStripeEvent = internalMutation({
  args: normalizedEventArgs,
  handler: async (ctx, event): Promise<{ duplicate: boolean; outcome: string }> => {
    const duplicate = await ctx.db
      .query('stripeEvents')
      .withIndex('by_event_id', (q) => q.eq('eventId', event.eventId))
      .unique();
    if (duplicate) return { duplicate: true, outcome: duplicate.outcome };

    let outcome = 'ignored';

    if (!isPaidSaasEnabled()) {
      outcome = 'ignored_paid_saas_disabled';
    } else if (!isStripeEventModeAllowed(event.livemode, process.env.STRIPE_MODE?.trim())) {
      outcome = 'ignored_wrong_or_disabled_mode';
    } else if (event.eventType === 'checkout.session.completed') {
      const mappedPlan = planForPaymentLink(event.paymentLinkId, configuredLinks());
      if (!mappedPlan) {
        outcome = 'ignored_unknown_payment_link';
      } else if (event.paymentStatus !== 'paid' && event.paymentStatus !== 'no_payment_required') {
        outcome = 'ignored_unpaid_checkout';
      } else if (mappedPlan === 'pilot') {
        outcome = 'pilot_payment_recorded';
      } else if (!event.subscriptionId || !event.email) {
        outcome = 'ignored_missing_identity';
      } else {
        const user = await findUserForBilling(ctx, event);
        if (user) {
          await ctx.db.patch(user._id, {
            plan: mappedPlan,
            stripeCustomerId: event.customerId,
            stripeSubscriptionId: event.subscriptionId,
            stripeSubscriptionStatus: 'active',
          });
          outcome = `${mappedPlan}_activated`;
        } else {
          await upsertPendingEntitlement(ctx, event, mappedPlan, 'active');
          outcome = `${mappedPlan}_pending_account`;
        }
      }
    } else {
      const user = await findUserForBilling(ctx, event);
      const pending = event.subscriptionId
        ? await ctx.db
            .query('pendingEntitlements')
            .withIndex('by_subscription', (q) => q.eq('stripeSubscriptionId', event.subscriptionId as string))
            .unique()
        : null;
      const shouldDeactivate =
        event.eventType === 'invoice.payment_failed' ||
        event.eventType === 'customer.subscription.deleted' ||
        (event.eventType === 'customer.subscription.updated' &&
          !isActiveSubscriptionStatus(event.subscriptionStatus));

      if (user) {
        await ctx.db.patch(user._id, {
          ...(shouldDeactivate ? { plan: 'free' as const } : {}),
          stripeSubscriptionStatus: shouldDeactivate
            ? (event.subscriptionStatus ?? 'payment_failed')
            : (event.subscriptionStatus ?? 'active'),
        });
        outcome = shouldDeactivate ? 'user_deactivated' : 'subscription_confirmed';
      } else if (pending) {
        await ctx.db.patch(pending._id, {
          status: shouldDeactivate
            ? (event.subscriptionStatus ?? 'payment_failed')
            : (event.subscriptionStatus ?? 'active'),
          updatedAt: Date.now(),
        });
        outcome = shouldDeactivate ? 'pending_deactivated' : 'pending_confirmed';
      } else {
        outcome = 'ignored_unknown_subscription';
      }
    }

    await ctx.db.insert('stripeEvents', {
      eventId: event.eventId,
      eventType: event.eventType,
      eventCreated: event.created,
      livemode: event.livemode,
      processedAt: Date.now(),
      outcome,
    });

    return { duplicate: false, outcome };
  },
});

/** Claim a pending paid entitlement only for the authenticated account email. */
export const claimPendingEntitlement = mutation({
  args: {},
  handler: async (ctx) => {
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Authentication required');
    const user = await ctx.db.get(userId);
    const email = user?.email?.trim().toLowerCase();
    if (!user || !email || !user.emailVerificationTime) return { claimed: false };

    if (user.email !== email) await ctx.db.patch(userId, { email });
    const pending = await ctx.db
      .query('pendingEntitlements')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
    if (!pending || !isActiveSubscriptionStatus(pending.status)) return { claimed: false };

    await ctx.db.patch(userId, {
      plan: pending.plan,
      stripeCustomerId: pending.stripeCustomerId,
      stripeSubscriptionId: pending.stripeSubscriptionId,
      stripeSubscriptionStatus: pending.status,
    });
    await ctx.db.delete(pending._id);
    return { claimed: true, plan: pending.plan };
  },
});
