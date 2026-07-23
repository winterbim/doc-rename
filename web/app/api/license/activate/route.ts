import { activateFromStripeSession, reactivateLicense } from '@/lib/license-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Demande invalide.' }, 400);
  }
  const source = (body ?? {}) as Record<string, unknown>;
  const sessionId = typeof source.sessionId === 'string' ? source.sessionId.trim() : '';
  const deviceId = typeof source.deviceId === 'string' ? source.deviceId.trim() : '';
  if (!sessionId.startsWith('cs_') || sessionId.length > 200) {
    return json({ error: 'Session de paiement invalide.' }, 400);
  }

  try {
    // Retry briefly: webhook may land a second after the browser redirect.
    let license = await activateFromStripeSession(sessionId);
    if (!license) {
      for (const delayMs of [400, 800, 1_200]) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        license = await activateFromStripeSession(sessionId);
        if (license) break;
      }
    }
    if (!license || !license.active) {
      return json(
        {
          error:
            'Licence introuvable pour le moment. Réessayez dans quelques secondes ou contactez le support avec votre e-mail de paiement.',
          pending: true,
        },
        404,
      );
    }
    // Lier ce poste à la licence (premier siège) — best-effort : l'échec de
    // liaison ne bloque pas l'activation, le statut la fera au prochain check.
    if (/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
      try {
        await reactivateLicense({ licenseKey: license.licenseKey, deviceId });
      } catch {
        /* non bloquant */
      }
    }
    return json({
      activated: true,
      licenseKey: license.licenseKey,
      plan: license.plan,
      email: license.email,
      expiresAt: license.expiresAt,
    });
  } catch {
    return json({ error: 'Activation temporairement indisponible.' }, 503);
  }
}
