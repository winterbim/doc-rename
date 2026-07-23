import { reactivateLicense } from '@/lib/license-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

/**
 * Réactivation d'une licence sur ce poste (changement de PC).
 * Entrée : { licenseKey? | email?, deviceId }. Bascule automatique :
 * au-delà du quota de postes du plan, le poste le plus ancien est déconnecté.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Demande invalide.' }, 400);
  }
  const source = (body ?? {}) as Record<string, unknown>;
  const licenseKey = typeof source.licenseKey === 'string' ? source.licenseKey.trim() : '';
  const email = typeof source.email === 'string' ? source.email.trim().toLowerCase() : '';
  const deviceId = typeof source.deviceId === 'string' ? source.deviceId.trim() : '';

  const hasKey = licenseKey.startsWith('bcr_') && licenseKey.length >= 20 && licenseKey.length <= 120;
  const hasEmail = email.includes('@') && email.length <= 200;
  if (!hasKey && !hasEmail) {
    return json({ error: 'Saisissez votre clé de licence (bcr_…) ou votre email de paiement.' }, 400);
  }
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
    return json({ error: 'Appareil non identifié — rechargez la page.' }, 400);
  }

  try {
    const result = await reactivateLicense({
      licenseKey: hasKey ? licenseKey : undefined,
      email: !hasKey && hasEmail ? email : undefined,
      deviceId,
    });
    if (result.status === 'rate-limited') {
      return json(
        { error: 'Trop de réactivations récentes sur cette licence. Réessayez dans quelques heures.' },
        429,
      );
    }
    if (result.status === 'not-found') {
      return json(
        {
          error:
            'Aucune licence active trouvée. Vérifiez la clé ou l’email de paiement Stripe, ou contactez le support.',
        },
        404,
      );
    }
    if (result.status !== 'ok') {
      return json({ error: 'Réactivation temporairement indisponible.' }, 503);
    }
    return json({
      activated: true,
      licenseKey: result.license.licenseKey,
      plan: result.license.plan,
      email: result.license.email,
      expiresAt: result.license.expiresAt,
      seats: result.license.seats ?? null,
    });
  } catch {
    return json({ error: 'Réactivation temporairement indisponible.' }, 503);
  }
}
