export type PaidPlan = 'team' | 'cabinet';

export const SUPPORTED_STRIPE_EVENT_TYPES = [
  'checkout.session.completed',
  'invoice.paid',
  'invoice.payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
] as const;

export type SupportedStripeEventType = (typeof SUPPORTED_STRIPE_EVENT_TYPES)[number];

export interface NormalizedStripeEvent {
  eventId: string;
  eventType: SupportedStripeEventType;
  created: number;
  livemode: boolean;
  customerId?: string;
  subscriptionId?: string;
  sessionId?: string;
  paymentLinkId?: string;
  email?: string;
  paymentStatus?: string;
  subscriptionStatus?: string;
}

export type StripeProcessingMode = 'test' | 'live';

/** A deployment must opt into exactly one Stripe mode; missing/invalid is disabled. */
export function isStripeEventModeAllowed(
  livemode: boolean,
  configuredMode: string | undefined,
): boolean {
  return (
    (configuredMode === 'live' && livemode) ||
    (configuredMode === 'test' && !livemode)
  );
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function expandableId(value: unknown): string | undefined {
  const direct = asString(value);
  if (direct) return direct;
  return asString(asRecord(value)?.id);
}

function normalizeEmail(value: unknown): string | undefined {
  const email = asString(value)?.trim().toLowerCase();
  if (!email || email.length > 320 || !email.includes('@')) return undefined;
  return email;
}

export function isSupportedStripeEventType(value: string): value is SupportedStripeEventType {
  return (SUPPORTED_STRIPE_EVENT_TYPES as readonly string[]).includes(value);
}

/**
 * Reduce a verified Stripe event to the minimum data required for entitlement
 * processing. Card, address and invoice payloads are deliberately discarded.
 */
export function normalizeStripeEvent(value: unknown): NormalizedStripeEvent | null {
  const event = asRecord(value);
  const eventId = asString(event?.id);
  const eventType = asString(event?.type);
  const created = event?.created;
  const livemode = event?.livemode;
  const data = asRecord(event?.data);
  const object = asRecord(data?.object);

  if (
    !eventId?.startsWith('evt_') ||
    !eventType ||
    !isSupportedStripeEventType(eventType) ||
    typeof created !== 'number' ||
    !Number.isSafeInteger(created) ||
    typeof livemode !== 'boolean' ||
    !object
  ) {
    return null;
  }

  const normalized: NormalizedStripeEvent = {
    eventId,
    eventType,
    created,
    livemode,
  };

  if (eventType === 'checkout.session.completed') {
    const customerDetails = asRecord(object.customer_details);
    normalized.sessionId = asString(object.id);
    normalized.customerId = expandableId(object.customer);
    normalized.subscriptionId = expandableId(object.subscription);
    normalized.paymentLinkId = expandableId(object.payment_link);
    normalized.email = normalizeEmail(customerDetails?.email ?? object.customer_email);
    normalized.paymentStatus = asString(object.payment_status);
  } else if (eventType.startsWith('customer.subscription.')) {
    normalized.customerId = expandableId(object.customer);
    normalized.subscriptionId = asString(object.id);
    normalized.subscriptionStatus = asString(object.status);
  } else {
    const parent = asRecord(object.parent);
    const subscriptionDetails = asRecord(parent?.subscription_details);
    normalized.customerId = expandableId(object.customer);
    normalized.subscriptionId =
      expandableId(subscriptionDetails?.subscription) ?? expandableId(object.subscription);
  }

  return normalized;
}

export function planForPaymentLink(
  paymentLinkId: string | undefined,
  configured: { team?: string; cabinet?: string; pilot?: string },
): PaidPlan | 'pilot' | null {
  if (!paymentLinkId) return null;
  if (configured.team && paymentLinkId === configured.team) return 'team';
  if (configured.cabinet && paymentLinkId === configured.cabinet) return 'cabinet';
  if (configured.pilot && paymentLinkId === configured.pilot) return 'pilot';
  return null;
}

export function isActiveSubscriptionStatus(status: string | undefined): boolean {
  return status === 'active' || status === 'trialing';
}
