import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 1_000_000;
const stripe = new Stripe('', {
  apiVersion: '2026-06-24.dahlia',
  typescript: true,
  telemetry: false,
  authenticator: async () => {
    throw new Error('Stripe API calls are disabled in the webhook verifier');
  },
});

function convexWebhookUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL('/stripe/webhook', raw);
    const allowed =
      (url.protocol === 'https:' && url.hostname.endsWith('.convex.site')) ||
      (process.env.NODE_ENV !== 'production' && url.hostname === '127.0.0.1');
    return allowed ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const target = convexWebhookUrl();
  if (!signature || !secret || !target) {
    return Response.json({ error: 'Webhook unavailable' }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 });
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return Response.json({ error: 'Payload too large' }, { status: 413 });
  }

  try {
    stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': signature,
      },
      body: rawBody,
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return Response.json({ error: 'Processing failed' }, { status: 502 });
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: 'Processing unavailable' }, { status: 503 });
  }
}
