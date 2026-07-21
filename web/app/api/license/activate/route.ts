import { activateFromStripeSession } from '@/lib/license-server';

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
  const sessionId =
    body && typeof body === 'object' && typeof (body as { sessionId?: unknown }).sessionId === 'string'
      ? (body as { sessionId: string }).sessionId.trim()
      : '';
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
