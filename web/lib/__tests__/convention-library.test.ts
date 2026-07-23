import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteConvention,
  duplicateConvention,
  getConvention,
  listConventions,
  renameConvention,
  saveConvention,
  snapshotConvention,
  updateConvention,
} from '@/lib/convention-library';
import { initialState, type AppState } from '@/lib/app-state';

function stateFor(profileId: AppState['profileId'], separator = '_'): AppState {
  return { ...initialState, profileId, separator };
}

describe('convention-library — bibliothèque multi-clients (Cabinet)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('snapshot ne capture que les slices de convention', () => {
    const slices = snapshotConvention(stateFor('legal', '-'));
    expect(slices.profileId).toBe('legal');
    expect(slices.separator).toBe('-');
    expect(slices.fields?.activeFieldIds).toBeDefined();
    // Jamais de fichiers ni d'UI dans une convention
    expect('files' in slices).toBe(false);
  });

  it('save / list / get / delete', () => {
    const entry = saveConvention('DUPONT', stateFor('legal'));
    expect(entry).not.toBeNull();
    expect(listConventions()).toHaveLength(1);
    expect(getConvention(entry!.id)?.name).toBe('DUPONT');

    deleteConvention(entry!.id);
    expect(listConventions()).toHaveLength(0);
  });

  it('refuse un nom vide', () => {
    expect(saveConvention('   ', stateFor('legal'))).toBeNull();
    expect(listConventions()).toHaveLength(0);
  });

  it('update remplace les slices par la convention active', () => {
    const entry = saveConvention('CLIENT-A', stateFor('legal'))!;
    const updated = updateConvention(entry.id, stateFor('finance', '.'));
    expect(updated?.slices.profileId).toBe('finance');
    expect(updated?.slices.separator).toBe('.');
  });

  it('duplicate crée une copie indépendante', () => {
    const entry = saveConvention('CLIENT-A', stateFor('legal'))!;
    const copy = duplicateConvention(entry.id)!;
    expect(copy.id).not.toBe(entry.id);
    expect(copy.name).toContain('copie');
    expect(listConventions()).toHaveLength(2);
  });

  it('rename change le nom uniquement', () => {
    const entry = saveConvention('CLIENT-A', stateFor('legal'))!;
    const renamed = renameConvention(entry.id, 'CLIENT-B')!;
    expect(renamed.name).toBe('CLIENT-B');
    expect(renamed.slices.profileId).toBe('legal');
  });

  it('survit à un localStorage corrompu', () => {
    localStorage.setItem('bimcheck_convention_library_v1', '{pas du json[');
    expect(listConventions()).toEqual([]);
  });
});
