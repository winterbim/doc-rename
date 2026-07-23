import { describe, expect, it } from 'vitest';
import { formatBytesLimit, getPlanFeatures, planLimitMessage } from '@/lib/plan-features';

const MIB = 1024 * 1024;

describe('getPlanFeatures — échelle produit Free / Team / Cabinet', () => {
  it('Free : volumes d’essai, pas de rapport ni bibliothèque', () => {
    const f = getPlanFeatures('free');
    expect(f.maxFilesPerBatch).toBe(200);
    expect(f.maxBatchBytes).toBe(250 * MIB);
    expect(f.maxEntitiesPerProfile).toBe(100);
    expect(f.reportTxt).toBe(false);
    expect(f.reportCsv).toBe(false);
    expect(f.conventionLibrary).toBe(false);
  });

  it('Team : volumes équipe + rapport TXT, pas de bibliothèque', () => {
    const f = getPlanFeatures('team');
    expect(f.maxFilesPerBatch).toBe(1_000);
    expect(f.maxBatchBytes).toBe(1_024 * MIB);
    expect(f.maxEntitiesPerProfile).toBe(1_000);
    expect(f.reportTxt).toBe(true);
    expect(f.reportCsv).toBe(false);
    expect(f.conventionLibrary).toBe(false);
  });

  it('pro (alias hérité) = Team', () => {
    expect(getPlanFeatures('pro')).toEqual(getPlanFeatures('team'));
  });

  it('Cabinet : volumes max, entités illimitées, CSV + bibliothèque, 3 postes', () => {
    const f = getPlanFeatures('cabinet');
    expect(f.maxFilesPerBatch).toBe(5_000);
    expect(f.maxBatchBytes).toBe(2_048 * MIB);
    expect(f.maxEntitiesPerProfile).toBe(Number.POSITIVE_INFINITY);
    expect(f.reportTxt).toBe(true);
    expect(f.reportCsv).toBe(true);
    expect(f.conventionLibrary).toBe(true);
    expect(f.seats).toBe(3);
  });

  it('les postes actifs : Free 1 · Team 1 · Cabinet 3 · Pilote 1', () => {
    expect(getPlanFeatures('free').seats).toBe(1);
    expect(getPlanFeatures('team').seats).toBe(1);
    expect(getPlanFeatures('cabinet').seats).toBe(3);
    expect(getPlanFeatures('pilot').seats).toBe(1);
  });

  it('Pilote = découverte de l’offre Cabinet, mais sur un seul poste', () => {
    expect(getPlanFeatures('pilot')).toEqual({ ...getPlanFeatures('cabinet'), seats: 1 });
  });
});

describe('planLimitMessage', () => {
  it('Free : propose Team puis Cabinet', () => {
    const msg = planLimitMessage('free', 'files', 200);
    expect(msg).toContain('200 fichiers');
    expect(msg).toContain('Team');
  });

  it('Team : propose Cabinet', () => {
    const msg = planLimitMessage('team', 'bytes', 1_024 * MIB);
    expect(msg).toContain('1 Go');
    expect(msg).toContain('Cabinet');
    expect(msg).not.toContain('Passez à Team');
  });

  it('entities : mentionne la limite d’entités', () => {
    expect(planLimitMessage('free', 'entities', 100)).toContain('100 entités');
  });
});

describe('formatBytesLimit', () => {
  it('formate Mo et Go', () => {
    expect(formatBytesLimit(250 * MIB)).toBe('250 Mo');
    expect(formatBytesLimit(1_024 * MIB)).toBe('1 Go');
    expect(formatBytesLimit(2_048 * MIB)).toBe('2 Go');
  });
});
