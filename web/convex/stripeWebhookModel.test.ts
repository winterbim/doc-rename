import { describe, expect, it } from 'vitest';
import {
  isActiveSubscriptionStatus,
  isStripeEventModeAllowed,
  normalizeStripeEvent,
  planForPaymentLink,
} from './stripeWebhookModel';
import { verifyStripeWebhookSignature } from './stripeSignature';

const webhookSecret = ['whsec', 'unit_test_only'].join('_');

async function signature(payload: string, timestamp: number): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestamp}.${payload}`),
  );
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `t=${timestamp},v1=${hex}`;
}

describe('Stripe webhook boundary', () => {
  it('accepts the exact signed body and rejects tampering or stale signatures', async () => {
    const now = 1_800_000_000;
    const payload = '{"id":"evt_test"}';
    const header = await signature(payload, now);

    await expect(verifyStripeWebhookSignature(payload, header, webhookSecret, now)).resolves.toBe(true);
    await expect(verifyStripeWebhookSignature(`${payload} `, header, webhookSecret, now)).resolves.toBe(false);
    await expect(verifyStripeWebhookSignature(payload, header, webhookSecret, now + 301)).resolves.toBe(false);
    await expect(verifyStripeWebhookSignature(payload, 't=bad,v1=nope', webhookSecret, now)).resolves.toBe(false);
  });

  it('normalizes checkout identity without retaining billing or card data', () => {
    const normalized = normalizeStripeEvent({
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      created: 1_800_000_000,
      livemode: false,
      data: {
        object: {
          customer: 'cus_test',
          subscription: 'sub_test',
          payment_link: 'plink_team',
          payment_status: 'paid',
          customer_details: { email: ' User@Example.com ', address: { line1: 'discarded' } },
          payment_method_details: { card: { last4: '4242' } },
        },
      },
    });

    expect(normalized).toEqual({
      eventId: 'evt_checkout',
      eventType: 'checkout.session.completed',
      created: 1_800_000_000,
      livemode: false,
      customerId: 'cus_test',
      subscriptionId: 'sub_test',
      paymentLinkId: 'plink_team',
      email: 'user@example.com',
      paymentStatus: 'paid',
    });
    expect(JSON.stringify(normalized)).not.toContain('4242');
    expect(JSON.stringify(normalized)).not.toContain('discarded');
  });

  it('maps only server-allowlisted links to Team, Cabinet or Pilot', () => {
    const configured = { team: 'plink_team', cabinet: 'plink_cabinet', pilot: 'plink_pilot' };
    expect(planForPaymentLink('plink_team', configured)).toBe('team');
    expect(planForPaymentLink('plink_cabinet', configured)).toBe('cabinet');
    expect(planForPaymentLink('plink_pilot', configured)).toBe('pilot');
    expect(planForPaymentLink('plink_unknown', configured)).toBeNull();
    expect(planForPaymentLink(undefined, configured)).toBeNull();
  });

  it('deactivates non-active subscription states', () => {
    expect(isActiveSubscriptionStatus('active')).toBe(true);
    expect(isActiveSubscriptionStatus('trialing')).toBe(true);
    expect(isActiveSubscriptionStatus('past_due')).toBe(false);
    expect(isActiveSubscriptionStatus('canceled')).toBe(false);
  });

  it('accepts only the Stripe mode explicitly selected for the deployment', () => {
    expect(isStripeEventModeAllowed(false, 'test')).toBe(true);
    expect(isStripeEventModeAllowed(true, 'live')).toBe(true);
    expect(isStripeEventModeAllowed(true, 'test')).toBe(false);
    expect(isStripeEventModeAllowed(false, 'live')).toBe(false);
    expect(isStripeEventModeAllowed(false, undefined)).toBe(false);
    expect(isStripeEventModeAllowed(false, 'anything-else')).toBe(false);
  });

  it('rejects unsupported and malformed events', () => {
    expect(normalizeStripeEvent({ id: 'evt_x', type: 'charge.succeeded' })).toBeNull();
    expect(normalizeStripeEvent({ id: 'not_an_event', type: 'invoice.paid' })).toBeNull();
  });
});
