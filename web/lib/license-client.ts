'use client';

import type { AccessPlan } from '@/lib/usage-limits';

const STORAGE_KEY = 'bimcheck_license_v1';

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
