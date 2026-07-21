import { fetchLicenseByKey } from '@/lib/license-server';

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
  const licenseKey =
    body && typeof body === 'object' && typeof (body as { licenseKey?: unknown }).licenseKey === 'string'
      ? (body as { licenseKey: string }).licenseKey.trim()
      : '';
  if (!licenseKey.startsWith('bcr_') || licenseKey.length < 20 || licenseKey.length > 120) {
    return json({ active: false, error: 'Clé invalide.' }, 400);
  }

  try {
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
