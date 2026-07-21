import { httpRouter } from 'convex/server';
import { auth } from './auth';
import { internal } from './_generated/api';
import { httpAction } from './_generated/server';
import { normalizeStripeEvent } from './stripeWebhookModel';
import { verifyStripeWebhookSignature } from './stripeSignature';

const http = httpRouter();

const PILOT_REQUEST_MAX_BYTES = 16 * 1024;

function constantTimeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return difference === 0;
}

function pilotRequestPayload(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const stringKeys = [
    'name',
    'email',
    'company',
    'role',
    'industry',
    'currentTool',
    'monthlyFiles',
    'convention',
    'message',
    'ipHash',
  ] as const;
  if (stringKeys.some((key) => typeof source[key] !== 'string')) return null;
  if (!['pilot', 'team', 'cabinet'].includes(String(source.offer))) return null;
  if (source.consent !== true || source.website !== '') return null;
  return {
    name: source.name as string,
    email: source.email as string,
    company: source.company as string,
    role: source.role as string,
    industry: source.industry as string,
    currentTool: source.currentTool as string,
    monthlyFiles: source.monthlyFiles as string,
    convention: source.convention as string,
    message: source.message as string,
    offer: source.offer as 'pilot' | 'team' | 'cabinet',
    ipHash: source.ipHash as string,
  };
}

// Mount Convex Auth HTTP actions under /api/auth/*
auth.addHttpRoutes(http);

http.route({
  path: '/stripe/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get('stripe-signature');
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    const mode = process.env.STRIPE_MODE?.trim();
    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (!signature || !secret || (mode !== 'test' && mode !== 'live')) {
      return new Response('Webhook unavailable', { status: 503 });
    }
    if (Number.isFinite(contentLength) && contentLength > 1_000_000) {
      return new Response('Payload too large', { status: 413 });
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 1_000_000) {
      return new Response('Payload too large', { status: 413 });
    }
    if (!(await verifyStripeWebhookSignature(rawBody, signature, secret))) {
      return new Response('Invalid signature', { status: 400 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const event = normalizeStripeEvent(parsed);
    if (!event) return Response.json({ received: true, ignored: true });

    const result = await ctx.runMutation(internal.billing.processStripeEvent, event);
    return Response.json({ received: true, duplicate: result.duplicate });
  }),
});

http.route({
  path: '/pilot-requests',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const configuredSecret = process.env.PILOT_REQUEST_INGEST_SECRET?.trim();
    const authorization = request.headers.get('authorization');
    const suppliedSecret = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : '';
    if (
      !configuredSecret ||
      configuredSecret.length < 32 ||
      !constantTimeEqual(suppliedSecret, configuredSecret)
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    const contentLength = Number(request.headers.get('content-length') ?? '0');
    if (Number.isFinite(contentLength) && contentLength > PILOT_REQUEST_MAX_BYTES) {
      return new Response('Payload too large', { status: 413 });
    }
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > PILOT_REQUEST_MAX_BYTES) {
      return new Response('Payload too large', { status: 413 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const payload = pilotRequestPayload(parsed);
    if (!payload) return new Response('Invalid payload', { status: 400 });

    try {
      const result = await ctx.runMutation(internal.pilotRequests.create, payload);
      if (!result.accepted) return new Response('Too many requests', { status: 429 });
      return Response.json(
        { accepted: true, reference: result.reference },
        { status: 201, headers: { 'cache-control': 'no-store' } },
      );
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
  }),
});

export default http;
