import { fetchDeviceStatus, fetchLicenseByKey } from '@/lib/license-server';

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
  const licenseKey = typeof source.licenseKey === 'string' ? source.licenseKey.trim() : '';
  const deviceId = typeof source.deviceId === 'string' ? source.deviceId.trim() : '';
  if (!licenseKey.startsWith('bcr_') || licenseKey.length < 20 || licenseKey.length > 120) {
    return json({ active: false, error: 'Clé invalide.' }, 400);
  }

  try {
    // Contrôle par poste actif (lie l'appareil si un siège est libre).
    if (/^[A-Za-z0-9_-]{8,80}$/.test(deviceId)) {
      const status = await fetchDeviceStatus(licenseKey, deviceId);
      if (!status) return json({ active: false });
      if (!status.active) {
        return json({
          active: false,
          reason: status.reason ?? null,
          seats: status.seats ?? null,
        });
      }
      return json({
        active: true,
        plan: status.plan,
        email: status.email,
        expiresAt: status.expiresAt,
        seats: status.seats ?? null,
      });
    }

    // Ancien client sans deviceId : validité simple de la licence.
    const license = await fetchLicenseByKey(licenseKey);
    if (!license || !license.active) {
      return json({ active: false });
    }
    return json({
      active: true,
      plan: license.plan,
      email: license.email,
      expiresAt: license.expiresAt,
    });
  } catch {
    return json({ error: 'Vérification indisponible.' }, 503);
  }
}
