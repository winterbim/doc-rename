import { beforeEach, describe, expect, it } from 'vitest';
import {
  FREE_DAILY_RENAME_LIMIT,
  clearDailyRenameUsage,
  getRemainingFreeRenames,
  readDailyRenameUsage,
  recordFreeRenames,
} from './usage-limits';

describe('usage-limits', () => {
  beforeEach(() => {
    clearDailyRenameUsage();
  });

  it('starts with the full free quota', () => {
    expect(readDailyRenameUsage(new Date('2026-05-17T10:00:00')).count).toBe(0);
    expect(getRemainingFreeRenames(new Date('2026-05-17T10:00:00'))).toBe(FREE_DAILY_RENAME_LIMIT);
  });

  it('records successful renames up to the daily cap', () => {
    recordFreeRenames(2, new Date('2026-05-17T10:00:00'));
    expect(getRemainingFreeRenames(new Date('2026-05-17T11:00:00'))).toBe(1);

    recordFreeRenames(10, new Date('2026-05-17T12:00:00'));
    expect(readDailyRenameUsage(new Date('2026-05-17T13:00:00')).count).toBe(FREE_DAILY_RENAME_LIMIT);
    expect(getRemainingFreeRenames(new Date('2026-05-17T13:00:00'))).toBe(0);
  });

  it('resets on a new local day', () => {
    recordFreeRenames(3, new Date('2026-05-17T10:00:00'));

    expect(getRemainingFreeRenames(new Date('2026-05-18T10:00:00'))).toBe(FREE_DAILY_RENAME_LIMIT);
  });
});
