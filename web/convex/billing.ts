import { v } from 'convex/values';
import { auth } from './auth';
import { internalMutation, internalQuery, mutation, type MutationCtx } from './_generated/server';
import {
  isActiveSubscriptionStatus,
  isStripeEventModeAllowed,
  planForPaymentLink,
  type NormalizedStripeEvent,
  type PaidPlan,
} from './stripeWebhookModel';
import { isPaidSaasEnabled, isStripeBillingEnabled, requireStripeBillingEnabled } from './paidFeature';

const PILOT_DURATION_MS = 14 * 24 * 60 * 60 * 1_000;

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
  sessionId: v.optional(v.string()),
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

function generateLicenseKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `bcr_${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

function isLicenseActive(
  status: string,
  expiresAt: number | undefined,
  now = Date.now(),
): boolean {
  if (expiresAt !== undefined && expiresAt <= now) return false;
  return status === 'active' || status === 'trialing' || status === 'paid';
}

async function findUserForBilling(ctx: MutationCtx, event: NormalizedStripeEvent) {
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

async function upsertLicenseFromCheckout(
  ctx: MutationCtx,
  event: NormalizedStripeEvent,
  plan: PaidPlan | 'pilot',
): Promise<'created' | 'updated'> {
  if (!event.sessionId || !event.email) {
    throw new Error('missing_session_or_email');
  }
  const now = Date.now();
  const existing = await ctx.db
    .query('licenses')
    .withIndex('by_session', (q) => q.eq('sessionId', event.sessionId as string))
    .unique();

  const expiresAt = plan === 'pilot' ? now + PILOT_DURATION_MS : undefined;
  const payload = {
    sessionId: event.sessionId,
    email: event.email,
    plan,
    stripeCustomerId: event.customerId,
    stripeSubscriptionId: event.subscriptionId,
    status: 'active' as const,
    expiresAt,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return 'updated';
  }

  await ctx.db.insert('licenses', {
    ...payload,
    licenseKey: generateLicenseKey(),
    createdAt: now,
  });
  return 'created';
}

async function deactivateLicenses(
  ctx: MutationCtx,
  event: NormalizedStripeEvent,
  status: string,
) {
  const now = Date.now();
  if (event.subscriptionId) {
    const bySub = await ctx.db
      .query('licenses')
      .withIndex('by_subscription', (q) => q.eq('stripeSubscriptionId', event.subscriptionId))
      .collect();
    for (const license of bySub) {
      await ctx.db.patch(license._id, { status, updatedAt: now });
    }
  }
  if (event.email) {
    const byEmail = await ctx.db
      .query('licenses')
      .withIndex('by_email', (q) => q.eq('email', event.email as string))
      .collect();
    for (const license of byEmail) {
      if (license.plan === 'pilot') continue;
      if (event.subscriptionId && license.stripeSubscriptionId !== event.subscriptionId) continue;
      await ctx.db.patch(license._id, { status, updatedAt: now });
    }
  }
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

    if (!isStripeBillingEnabled()) {
      outcome = 'ignored_billing_disabled';
    } else if (!isStripeEventModeAllowed(event.livemode, process.env.STRIPE_MODE?.trim())) {
      outcome = 'ignored_wrong_or_disabled_mode';
    } else if (event.eventType === 'checkout.session.completed') {
      const mappedPlan = planForPaymentLink(event.paymentLinkId, configuredLinks());
      if (!mappedPlan) {
        outcome = 'ignored_unknown_payment_link';
      } else if (event.paymentStatus !== 'paid' && event.paymentStatus !== 'no_payment_required') {
        outcome = 'ignored_unpaid_checkout';
      } else if (!event.sessionId || !event.email) {
        outcome = 'ignored_missing_identity';
      } else {
        const licenseOutcome = await upsertLicenseFromCheckout(ctx, event, mappedPlan);
        outcome =
          mappedPlan === 'pilot'
            ? `pilot_license_${licenseOutcome}`
            : `${mappedPlan}_license_${licenseOutcome}`;

        // Optional cloud user plan sync (OAuth) — best effort, not required for browser unlock.
        if (mappedPlan !== 'pilot' && event.subscriptionId) {
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
            outcome = `${mappedPlan}_license_pending_account`;
          }
        }
      }
    } else {
      const user = await findUserForBilling(ctx, event);
      const pending = event.subscriptionId
        ? await ctx.db
            .query('pendingEntitlements')
            .withIndex('by_subscription', (q) =>
              q.eq('stripeSubscriptionId', event.subscriptionId as string),
            )
            .unique()
        : null;
      const shouldDeactivate =
        event.eventType === 'invoice.payment_failed' ||
        event.eventType === 'customer.subscription.deleted' ||
        (event.eventType === 'customer.subscription.updated' &&
          !isActiveSubscriptionStatus(event.subscriptionStatus));

      if (shouldDeactivate) {
        await deactivateLicenses(ctx, event, event.subscriptionStatus ?? 'canceled');
      } else if (event.subscriptionId) {
        const licenses = await ctx.db
          .query('licenses')
          .withIndex('by_subscription', (q) =>
            q.eq('stripeSubscriptionId', event.subscriptionId as string),
          )
          .collect();
        for (const license of licenses) {
          await ctx.db.patch(license._id, {
            status: event.subscriptionStatus ?? 'active',
            updatedAt: Date.now(),
          });
        }
      }

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
        outcome = shouldDeactivate ? 'license_deactivated' : 'license_confirmed';
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
    if (!isStripeBillingEnabled() && !isPaidSaasEnabled()) {
      return { claimed: false };
    }
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

export const getLicenseBySession = internalQuery({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const license = await ctx.db
      .query('licenses')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .unique();
    if (!license) return null;
    const active = isLicenseActive(license.status, license.expiresAt);
    return {
      email: license.email,
      plan: license.plan,
      licenseKey: license.licenseKey,
      status: license.status,
      expiresAt: license.expiresAt ?? null,
      active,
    };
  },
});

export const getLicenseByKey = internalQuery({
  args: { licenseKey: v.string() },
  handler: async (ctx, { licenseKey }) => {
    const license = await ctx.db
      .query('licenses')
      .withIndex('by_license_key', (q) => q.eq('licenseKey', licenseKey))
      .unique();
    if (!license) return null;
    const active = isLicenseActive(license.status, license.expiresAt);
    return {
      email: license.email,
      plan: license.plan,
      status: license.status,
      expiresAt: license.expiresAt ?? null,
      active,
    };
  },
});

/**
 * Create a license from a server-verified Stripe Checkout Session
 * (covers the race where /merci loads before the webhook).
 */
export const upsertLicenseFromVerifiedSession = internalMutation({
  args: {
    sessionId: v.string(),
    email: v.string(),
    plan: v.union(v.literal('team'), v.literal('cabinet'), v.literal('pilot')),
    customerId: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requireStripeBillingEnabled();
    const email = args.email.trim().toLowerCase();
    if (!email.includes('@') || !args.sessionId.startsWith('cs_')) {
      throw new Error('INVALID_SESSION');
    }
    const now = Date.now();
    const existing = await ctx.db
      .query('licenses')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .unique();
    const expiresAt = args.plan === 'pilot' ? now + PILOT_DURATION_MS : undefined;
    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        plan: args.plan,
        stripeCustomerId: args.customerId,
        stripeSubscriptionId: args.subscriptionId,
        status: 'active',
        expiresAt,
        updatedAt: now,
      });
      return {
        licenseKey: existing.licenseKey,
        plan: args.plan,
        email,
        expiresAt: expiresAt ?? null,
        active: true,
      };
    }
    const licenseKey = generateLicenseKey();
    await ctx.db.insert('licenses', {
      sessionId: args.sessionId,
      email,
      plan: args.plan,
      licenseKey,
      stripeCustomerId: args.customerId,
      stripeSubscriptionId: args.subscriptionId,
      status: 'active',
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });
    return { licenseKey, plan: args.plan, email, expiresAt: expiresAt ?? null, active: true };
  },
});
