import Stripe from 'stripe';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const webhookSecret = ['whsec', 'route_test_only'].join('_');
const stripe = new Stripe('', {
  apiVersion: '2026-06-24.dahlia',
  authenticator: async () => undefined,
});

function request(payload: string, signature: string): Request {
  return new Request('https://rename.example/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signature,
    },
    body: payload,
  });
}

describe('Stripe webhook route', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('rejects an invalid signature before contacting Convex', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', webhookSecret);
    vi.stubEnv('NEXT_PUBLIC_CONVEX_SITE_URL', 'https://example.convex.site');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request('{}', 't=1,v1=invalid'));
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards the unchanged, verified payload to the Convex processor', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', webhookSecret);
    vi.stubEnv('NEXT_PUBLIC_CONVEX_SITE_URL', 'https://example.convex.site');
    const payload = JSON.stringify({
      id: 'evt_route_test',
      type: 'checkout.session.completed',
      created: 1_800_000_000,
      livemode: false,
      data: { object: {} },
    });
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request(payload, signature));
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(init.body).toBe(payload);
    expect(new Headers(init.headers).get('stripe-signature')).toBe(signature);
  });

  it('fails closed when server configuration is missing', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    vi.stubEnv('NEXT_PUBLIC_CONVEX_SITE_URL', '');
    const response = await POST(request('{}', 't=1,v1=invalid'));
    expect(response.status).toBe(503);
  });
});
