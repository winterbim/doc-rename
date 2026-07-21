import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const secret = 'test-only-secret-at-least-thirty-two-characters';
const validPayload = {
  name: 'Camille Martin',
  email: 'camille@example.com',
  company: 'Atelier Exemple',
  role: 'BIM Manager',
  industry: 'BIM / Construction',
  currentTool: 'Autodesk Docs',
  monthlyFiles: '50-200',
  convention: 'Convention interne',
  message: 'Test de réception.',
  offer: 'pilot',
  consent: true,
  website: '',
};

function request(payload: unknown, origin = 'https://rename.example'): Request {
  return new Request('https://rename.example/api/pilot-requests', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
      'x-forwarded-for': '192.0.2.10',
    },
    body: JSON.stringify(payload),
  });
}

describe('pilot request route', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function configure() {
    vi.stubEnv('PILOT_REQUEST_INGEST_SECRET', secret);
    vi.stubEnv('NEXT_PUBLIC_CONVEX_SITE_URL', 'https://example.convex.site');
  }

  it('persists a validated request and returns its receipt reference', async () => {
    configure();
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ accepted: true, reference: 'request_123' }, { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(request(validPayload));
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ accepted: true, reference: 'request_123' });
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe('https://example.convex.site/pilot-requests');
    expect(new Headers(init.headers).get('authorization')).toBe(`Bearer ${secret}`);
    const forwarded = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(forwarded.email).toBe('camille@example.com');
    expect(forwarded.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(forwarded)).not.toContain('192.0.2.10');
  });

  it('rejects cross-origin requests before contacting Convex', async () => {
    configure();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(request(validPayload, 'https://attacker.example'));
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid consent and honeypot submissions', async () => {
    configure();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect((await POST(request({ ...validPayload, consent: false }))).status).toBe(422);
    expect((await POST(request({ ...validPayload, website: 'spam' }))).status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails closed when its server-only configuration is absent', async () => {
    vi.stubEnv('PILOT_REQUEST_INGEST_SECRET', '');
    vi.stubEnv('NEXT_PUBLIC_CONVEX_SITE_URL', '');
    const response = await POST(request(validPayload));
    expect(response.status).toBe(503);
  });
});
