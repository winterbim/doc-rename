'use client';

import type { AccessPlan } from '@/lib/usage-limits';

const STORAGE_KEY = 'bimcheck_license_v1';
const DEVICE_KEY = 'bimcheck_device_id_v1';

/**
 * Identifiant stable de CE navigateur (postes actifs par licence).
 * Généré une fois, réutilisé pour status / activate / reactivate.
 */
export function getDeviceId(): string {
  const store = storage();
  const existing = store?.getItem(DEVICE_KEY);
  if (existing && /^[A-Za-z0-9_-]{8,80}$/.test(existing)) return existing;
  const generated =
    globalThis.crypto?.randomUUID?.().replace(/-/g, '') ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  const deviceId = `dev_${generated}`.slice(0, 60);
  store?.setItem(DEVICE_KEY, deviceId);
  return deviceId;
}

export type StoredLicense = {
  licenseKey: string;
  plan: AccessPlan;
  email?: string;
  expiresAt?: number | null;
  activatedAt: number;
};

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredLicense(): StoredLicense | null {
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredLicense>;
    if (
      typeof parsed.licenseKey !== 'string' ||
      !parsed.licenseKey.startsWith('bcr_') ||
      typeof parsed.plan !== 'string' ||
      typeof parsed.activatedAt !== 'number'
    ) {
      return null;
    }
    if (parsed.expiresAt != null && parsed.expiresAt <= Date.now()) {
      clearStoredLicense();
      return null;
    }
    return {
      licenseKey: parsed.licenseKey,
      plan: parsed.plan as AccessPlan,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      expiresAt: typeof parsed.expiresAt === 'number' ? parsed.expiresAt : null,
      activatedAt: parsed.activatedAt,
    };
  } catch {
    return null;
  }
}

export function writeStoredLicense(license: StoredLicense): void {
  storage()?.setItem(STORAGE_KEY, JSON.stringify(license));
  try {
    globalThis.dispatchEvent(new Event('bimcheck-license-changed'));
  } catch {
    /* ignore */
  }
}

export function clearStoredLicense(): void {
  storage()?.removeItem(STORAGE_KEY);
  try {
    globalThis.dispatchEvent(new Event('bimcheck-license-changed'));
  } catch {
    /* ignore */
  }
}

export function licensePlanFromStorage(): AccessPlan | null {
  const license = readStoredLicense();
  if (!license) return null;
  if (license.plan === 'team' || license.plan === 'cabinet' || license.plan === 'pilot' || license.plan === 'pro') {
    return license.plan;
  }
  return null;
}
