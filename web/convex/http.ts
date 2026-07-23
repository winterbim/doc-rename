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

function licenseApiSecret(): string | null {
  const dedicated = process.env.LICENSE_API_SECRET?.trim();
  if (dedicated && dedicated.length >= 32) return dedicated;
  const fallback = process.env.PILOT_REQUEST_INGEST_SECRET?.trim();
  if (fallback && fallback.length >= 32) return fallback;
  return null;
}

function authorizeLicenseApi(request: Request): boolean {
  const secret = licenseApiSecret();
  if (!secret) return false;
  const authorization = request.headers.get('authorization');
  const supplied = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';
  return constantTimeEqual(supplied, secret);
}

http.route({
  path: '/license/by-session',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    if (!authorizeLicenseApi(request)) return new Response('Unauthorized', { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const sessionId =
      body && typeof body === 'object' && typeof (body as { sessionId?: unknown }).sessionId === 'string'
        ? (body as { sessionId: string }).sessionId.trim()
        : '';
    if (!sessionId.startsWith('cs_')) return new Response('Invalid session', { status: 400 });
    const license = await ctx.runQuery(internal.billing.getLicenseBySession, { sessionId });
    if (!license || !license.active) {
      return Response.json({ found: false }, { status: 404, headers: { 'cache-control': 'no-store' } });
    }
    return Response.json(
      {
        found: true,
        licenseKey: license.licenseKey,
        plan: license.plan,
        email: license.email,
        expiresAt: license.expiresAt,
        active: true,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  }),
});

http.route({
  path: '/license/by-key',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    if (!authorizeLicenseApi(request)) return new Response('Unauthorized', { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const licenseKey =
      body && typeof body === 'object' && typeof (body as { licenseKey?: unknown }).licenseKey === 'string'
        ? (body as { licenseKey: string }).licenseKey.trim()
        : '';
    if (!licenseKey.startsWith('bcr_') || licenseKey.length < 20) {
      return new Response('Invalid key', { status: 400 });
    }
    const license = await ctx.runQuery(internal.billing.getLicenseByKey, { licenseKey });
    if (!license || !license.active) {
      return Response.json({ found: false, active: false }, { status: 404, headers: { 'cache-control': 'no-store' } });
    }
    return Response.json(
      {
        found: true,
        plan: license.plan,
        email: license.email,
        expiresAt: license.expiresAt,
        active: true,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  }),
});

http.route({
  path: '/license/device-status',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    if (!authorizeLicenseApi(request)) return new Response('Unauthorized', { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const source = (body ?? {}) as Record<string, unknown>;
    const licenseKey = typeof source.licenseKey === 'string' ? source.licenseKey.trim() : '';
    const deviceId = typeof source.deviceId === 'string' ? source.deviceId.trim() : '';
    if (!licenseKey.startsWith('bcr_') || licenseKey.length < 20 || licenseKey.length > 120) {
      return new Response('Invalid key', { status: 400 });
    }
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
      return new Response('Invalid device', { status: 400 });
    }
    const result = await ctx.runMutation(internal.billing.checkDeviceStatus, {
      licenseKey,
      deviceId,
    });
    if (!result) {
      return Response.json({ found: false, active: false }, { status: 404, headers: { 'cache-control': 'no-store' } });
    }
    return Response.json({ found: true, ...result }, { headers: { 'cache-control': 'no-store' } });
  }),
});

http.route({
  path: '/license/reactivate',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    if (!authorizeLicenseApi(request)) return new Response('Unauthorized', { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    const source = (body ?? {}) as Record<string, unknown>;
    const licenseKeyRaw = typeof source.licenseKey === 'string' ? source.licenseKey.trim() : '';
    const emailRaw =
      typeof source.email === 'string' ? source.email.trim().toLowerCase() : '';
    const deviceId = typeof source.deviceId === 'string' ? source.deviceId.trim() : '';
    const hasKey = licenseKeyRaw.startsWith('bcr_') && licenseKeyRaw.length >= 20 && licenseKeyRaw.length <= 120;
    const hasEmail = emailRaw.includes('@') && emailRaw.length <= 200;
    if ((!hasKey && !hasEmail) || !/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
      return new Response('Invalid payload', { status: 400 });
    }
    const result = await ctx.runMutation(internal.billing.reactivateDevice, {
      licenseKey: hasKey ? licenseKeyRaw : undefined,
      email: !hasKey && hasEmail ? emailRaw : undefined,
      deviceId,
    });
    if (!result) {
      return Response.json({ found: false, active: false }, { status: 404, headers: { 'cache-control': 'no-store' } });
    }
    if ('rateLimited' in result && result.rateLimited) {
      return Response.json({ found: true, active: false, rateLimited: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
    }
    return Response.json({ found: true, ...result }, { headers: { 'cache-control': 'no-store' } });
  }),
});

http.route({
  path: '/license/upsert-verified',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    if (!authorizeLicenseApi(request)) return new Response('Unauthorized', { status: 401 });
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response('Invalid payload', { status: 400 });
    }
    if (!body || typeof body !== 'object') return new Response('Invalid payload', { status: 400 });
    const source = body as Record<string, unknown>;
    const sessionId = typeof source.sessionId === 'string' ? source.sessionId.trim() : '';
    const email = typeof source.email === 'string' ? source.email.trim().toLowerCase() : '';
    const plan = source.plan;
    if (!sessionId.startsWith('cs_') || !email.includes('@')) {
      return new Response('Invalid payload', { status: 400 });
    }
    if (plan !== 'team' && plan !== 'cabinet' && plan !== 'pilot') {
      return new Response('Invalid plan', { status: 400 });
    }
    try {
      const result = await ctx.runMutation(internal.billing.upsertLicenseFromVerifiedSession, {
        sessionId,
        email,
        plan,
        customerId: typeof source.customerId === 'string' ? source.customerId : undefined,
        subscriptionId:
          typeof source.subscriptionId === 'string' ? source.subscriptionId : undefined,
      });
      return Response.json(result, { headers: { 'cache-control': 'no-store' } });
    } catch {
      return new Response('Processing failed', { status: 502 });
    }
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
