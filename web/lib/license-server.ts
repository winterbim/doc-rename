import {
  planForPaymentLink,
  type PaidPlan,
} from '@/convex/stripeWebhookModel';

export type LicensePlan = PaidPlan | 'pilot';

function convexSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const allowed =
      (url.protocol === 'https:' && url.hostname.endsWith('.convex.site')) ||
      (process.env.NODE_ENV !== 'production' &&
        (url.hostname === '127.0.0.1' || url.hostname === 'localhost'));
    return allowed ? url : null;
  } catch {
    return null;
  }
}

export function licenseApiSecret(): string | null {
  const dedicated = process.env.LICENSE_API_SECRET?.trim();
  if (dedicated && dedicated.length >= 32) return dedicated;
  const fallback = process.env.PILOT_REQUEST_INGEST_SECRET?.trim();
  if (fallback && fallback.length >= 32) return fallback;
  return null;
}

export function configuredPaymentLinks() {
  return {
    team: process.env.STRIPE_PAYMENT_LINK_TEAM_ID?.trim(),
    cabinet: process.env.STRIPE_PAYMENT_LINK_CABINET_ID?.trim(),
    pilot: process.env.STRIPE_PAYMENT_LINK_PILOT_ID?.trim(),
  };
}

export function mapPaymentLinkToPlan(paymentLinkId: string | undefined): LicensePlan | null {
  return planForPaymentLink(paymentLinkId, configuredPaymentLinks());
}

async function convexLicenseFetch(
  path: string,
  body: Record<string, unknown>,
): Promise<Response | null> {
  const base = convexSiteUrl();
  const secret = licenseApiSecret();
  if (!base || !secret) return null;
  const url = new URL(path, base);
  return fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
}

export type LicensePayload = {
  licenseKey: string;
  plan: LicensePlan;
  email: string;
  expiresAt: number | null;
  active: boolean;
};

export async function fetchLicenseBySession(
  sessionId: string,
): Promise<LicensePayload | null> {
  const response = await convexLicenseFetch('/license/by-session', { sessionId });
  if (!response || response.status === 404) return null;
  if (!response.ok) return null;
  const data = (await response.json()) as Partial<LicensePayload> & { found?: boolean };
  if (!data.found || !data.licenseKey || !data.plan || !data.email) return null;
  return {
    licenseKey: data.licenseKey,
    plan: data.plan as LicensePlan,
    email: data.email,
    expiresAt: data.expiresAt ?? null,
    active: data.active !== false,
  };
}

export async function fetchLicenseByKey(licenseKey: string): Promise<LicensePayload | null> {
  const response = await convexLicenseFetch('/license/by-key', { licenseKey });
  if (!response || response.status === 404) return null;
  if (!response.ok) return null;
  const data = (await response.json()) as Partial<LicensePayload> & { found?: boolean };
  if (!data.found || !data.plan || !data.email) return null;
  return {
    licenseKey,
    plan: data.plan as LicensePlan,
    email: data.email,
    expiresAt: data.expiresAt ?? null,
    active: data.active !== false,
  };
}

export async function upsertVerifiedLicense(input: {
  sessionId: string;
  email: string;
  plan: LicensePlan;
  customerId?: string;
  subscriptionId?: string;
}): Promise<LicensePayload | null> {
  const response = await convexLicenseFetch('/license/upsert-verified', input);
  if (!response || !response.ok) return null;
  const data = (await response.json()) as Partial<LicensePayload>;
  if (!data.licenseKey || !data.plan || !data.email) return null;
  return {
    licenseKey: data.licenseKey,
    plan: data.plan as LicensePlan,
    email: data.email,
    expiresAt: data.expiresAt ?? null,
    active: true,
  };
}

/**
 * Prefer Stripe API session retrieval when STRIPE_SECRET_KEY is set,
 * so /merci works even if the webhook is a few seconds late.
 */
export async function activateFromStripeSession(
  sessionId: string,
): Promise<LicensePayload | null> {
  if (!sessionId.startsWith('cs_')) return null;

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  // sk_live_ / sk_test_ (full) or rk_live_ / rk_test_ (restricted with Checkout read).
  if (secretKey && /^(sk|rk)_(live|test)_/.test(secretKey)) {
    try {
      const stripeRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        {
          headers: { authorization: `Bearer ${secretKey}` },
          cache: 'no-store',
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (stripeRes.ok) {
        const session = (await stripeRes.json()) as {
          id?: string;
          payment_status?: string;
          payment_link?: string | { id?: string };
          customer_email?: string | null;
          customer_details?: { email?: string | null };
          customer?: string | { id?: string } | null;
          subscription?: string | { id?: string } | null;
        };
        const paymentStatus = session.payment_status;
        if (paymentStatus !== 'paid' && paymentStatus !== 'no_payment_required') {
          return null;
        }
        const paymentLinkId =
          typeof session.payment_link === 'string'
            ? session.payment_link
            : session.payment_link?.id;
        const plan = mapPaymentLinkToPlan(paymentLinkId);
        const email = (
          session.customer_details?.email ||
          session.customer_email ||
          ''
        )
          .trim()
          .toLowerCase();
        if (!plan || !email.includes('@')) return null;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        const upserted = await upsertVerifiedLicense({
          sessionId,
          email,
          plan,
          customerId,
          subscriptionId,
        });
        if (upserted) return upserted;
      }
    } catch {
      /* fall through to Convex webhook path */
    }
  }

  // Webhook already wrote the license
  return fetchLicenseBySession(sessionId);
}
