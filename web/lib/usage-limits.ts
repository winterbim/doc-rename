'use client';

export const FREE_DAILY_RENAME_LIMIT = 3;

const STORAGE_KEY = 'doc_rename_daily_usage_v1';

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

export function readDailyRenameUsage(date = new Date()): DailyRenameUsage {
  const currentDate = todayKey(date);
  const storage = safeLocalStorage();
  if (!storage) return { date: currentDate, count: 0 };

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { date: currentDate, count: 0 };
    const parsed = JSON.parse(raw) as Partial<DailyRenameUsage>;
    if (parsed.date !== currentDate || typeof parsed.count !== 'number') {
      return { date: currentDate, count: 0 };
    }
    return { date: currentDate, count: Math.max(0, Math.floor(parsed.count)) };
  } catch {
    return { date: currentDate, count: 0 };
  }
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
  return next;
}

export function clearDailyRenameUsage(): void {
  safeLocalStorage()?.removeItem(STORAGE_KEY);
}
