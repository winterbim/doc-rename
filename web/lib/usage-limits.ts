'use client';

import { FREE_DAILY_LOTS } from '@/lib/pricing';

export const FREE_DAILY_RENAME_LIMIT = FREE_DAILY_LOTS;

/**
 * Access plan for rename quota.
 * - free: daily lot cap
 * - team | cabinet: unlimited
 * - pro: legacy alias for team (env / old deploys)
 */
export type AccessPlan = 'free' | 'pro' | 'team' | 'cabinet';

const STORAGE_KEY = 'bimcheck_rename_daily_usage_v1';
/** Previous key — still read for seamless migration. */
const LEGACY_STORAGE_KEY = 'doc_rename_daily_usage_v1';

export interface DailyRenameUsage {
  date: string;
  count: number;
}

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function safeLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function normalizeAccessPlan(raw: string | null | undefined): AccessPlan {
  const value = raw?.trim().toLowerCase();
  if (value === 'pro' || value === 'team' || value === 'cabinet') return value;
  return 'free';
}

/**
 * Deploy-level plan override (Vercel env). Used when a client is provisioned
 * manually after Stripe Payment Link, without per-user billing webhooks.
 */
export function getConfiguredAccessPlan(): AccessPlan {
  return normalizeAccessPlan(process.env.NEXT_PUBLIC_DOC_RENAME_PLAN);
}

export function isPaidPlan(plan: AccessPlan): boolean {
  return plan === 'pro' || plan === 'team' || plan === 'cabinet';
}

export function isUsageLimitEnabled(plan: AccessPlan = getConfiguredAccessPlan()): boolean {
  return !isPaidPlan(plan);
}

export function getAccessPlanLabel(plan: AccessPlan = getConfiguredAccessPlan()): string {
  if (plan === 'cabinet') return 'Cabinet';
  if (plan === 'team' || plan === 'pro') return 'Team';
  return 'Free';
}

function parseUsage(raw: string | null, currentDate: string): DailyRenameUsage | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DailyRenameUsage>;
    if (parsed.date !== currentDate || typeof parsed.count !== 'number') return null;
    return { date: currentDate, count: Math.max(0, Math.floor(parsed.count)) };
  } catch {
    return null;
  }
}

export function readDailyRenameUsage(date = new Date()): DailyRenameUsage {
  const currentDate = todayKey(date);
  const storage = safeLocalStorage();
  if (!storage) return { date: currentDate, count: 0 };

  const current = parseUsage(storage.getItem(STORAGE_KEY), currentDate);
  if (current) return current;

  const legacy = parseUsage(storage.getItem(LEGACY_STORAGE_KEY), currentDate);
  if (legacy) {
    storage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    return legacy;
  }

  return { date: currentDate, count: 0 };
}

export function getRemainingFreeRenames(date = new Date()): number {
  const usage = readDailyRenameUsage(date);
  return Math.max(0, FREE_DAILY_RENAME_LIMIT - usage.count);
}

export function recordFreeRenames(count: number, date = new Date()): DailyRenameUsage {
  const storage = safeLocalStorage();
  const usage = readDailyRenameUsage(date);
  const next: DailyRenameUsage = {
    date: usage.date,
    count: Math.min(FREE_DAILY_RENAME_LIMIT, usage.count + Math.max(0, Math.floor(count))),
  };
  if (!storage) return next;
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  try {
    storage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return next;
}

export function clearDailyRenameUsage(): void {
  const storage = safeLocalStorage();
  storage?.removeItem(STORAGE_KEY);
  storage?.removeItem(LEGACY_STORAGE_KEY);
}

/**
 * Resolve effective plan: deploy override wins, else cloud user plan, else free.
 */
export function resolveAccessPlan(
  envPlan: AccessPlan,
  cloudPlan: AccessPlan | null | undefined,
): AccessPlan {
  if (isPaidPlan(envPlan)) return envPlan;
  if (cloudPlan && isPaidPlan(cloudPlan)) return cloudPlan;
  return 'free';
}
