import { createHmac } from 'node:crypto';
import { validatePilotRequest } from '@/lib/pilot-request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;

function convexEndpoint(): URL | null {
  const raw = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL('/pilot-requests', raw);
    const allowed =
      (url.protocol === 'https:' && url.hostname.endsWith('.convex.site')) ||
      (process.env.NODE_ENV !== 'production' && ['127.0.0.1', 'localhost'].includes(url.hostname));
    return allowed ? url : null;
  } catch {
    return null;
  }
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function clientHash(request: Request, secret: string): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const identifier = forwarded || 'unknown';
  return createHmac('sha256', secret).update(identifier).digest('hex');
}

function json(data: unknown, status: number): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const secret = process.env.PILOT_REQUEST_INGEST_SECRET?.trim();
  const target = convexEndpoint();
  if (!secret || secret.length < 32 || !target) {
    return json({ error: 'Réception temporairement indisponible.' }, 503);
  }
  if (!sameOrigin(request)) return json({ error: 'Origine de la demande refusée.' }, 403);

  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim();
  if (contentType !== 'application/json') return json({ error: 'Format de demande invalide.' }, 415);

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: 'Demande trop volumineuse.' }, 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ error: 'Demande illisible.' }, 400);
  }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return json({ error: 'Demande trop volumineuse.' }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Demande invalide.' }, 400);
  }
  const validation = validatePilotRequest(parsed);
  if (!validation.ok) return json({ error: validation.error }, 422);

  try {
    const response = await fetch(target, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${secret}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...validation.value,
        ipHash: clientHash(request, secret),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const result = (await response.json().catch(() => null)) as
      | { accepted?: boolean; reference?: string; error?: string }
      | null;
    if (response.status === 429) {
      return json({ error: 'Trop de demandes récentes. Réessayez dans une heure.' }, 429);
    }
    if (!response.ok || !result?.accepted || !result.reference) {
      return json({ error: 'La demande n’a pas pu être enregistrée.' }, 502);
    }
    return json({ accepted: true, reference: result.reference }, 202);
  } catch {
    return json({ error: 'Réception temporairement indisponible.' }, 503);
  }
}
