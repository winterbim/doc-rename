/**
 * Tests for lib/persistence.ts
 *
 * jsdom provides globalThis.localStorage automatically.
 * We reset it between tests via localStorage.clear().
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loadPersistedState, persistState, flushPersist } from './persistence';
import { initialState } from './app-state';
import { STORAGE_KEYS } from './rename-engine/config/defaults';
import { createDefaultState as createDefaultCleanerState } from './rename-engine/filename-cleaner';
import type { AppState } from './app-state';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(overrides: Partial<AppState> = {}): AppState {
  return { ...initialState, ...overrides };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// loadPersistedState — missing keys
// ---------------------------------------------------------------------------

describe('loadPersistedState — missing keys', () => {
  it('returns empty object when localStorage is empty', () => {
    const result = loadPersistedState();
    expect(result).toEqual({});
  });

  it('ignores missing FIELDS_ACTIVE key', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_VALUES, JSON.stringify({ project: 'PRJ' }));
    const result = loadPersistedState();
    expect(result.fields?.activeFieldIds).toBeUndefined();
    expect(result.fields?.values).toEqual({ project: 'PRJ' });
  });

  it('ignores missing FIELDS_VALUES key', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, JSON.stringify(['project', 'docType']));
    const result = loadPersistedState();
    expect(result.fields?.activeFieldIds).toEqual(['project', 'docType']);
    expect(result.fields?.values).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// loadPersistedState — invalid JSON
// ---------------------------------------------------------------------------

describe('loadPersistedState — invalid JSON', () => {
  it('skips FIELDS_ACTIVE on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, 'not-json{{{');
    const result = loadPersistedState();
    expect(result.fields?.activeFieldIds).toBeUndefined();
  });

  it('skips FIELDS_VALUES on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_VALUES, '{"broken"');
    const result = loadPersistedState();
    expect(result.fields?.values).toBeUndefined();
  });

  it('skips separator on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.NOMENCLATURE_SETTINGS, 'oops');
    const result = loadPersistedState();
    expect(result.separator).toBeUndefined();
  });

  it('skips cleaner on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.FILENAME_CLEANER, '{bad json');
    const result = loadPersistedState();
    expect(result.cleaner).toBeUndefined();
  });

  it('skips prefixRules on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.PREFIX_RULES, 'null null');
    const result = loadPersistedState();
    expect(result.prefixRules).toBeUndefined();
  });

  it('skips profileEntities on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE_ENTITIES, '{bad');
    const result = loadPersistedState();
    expect(result.profileEntities).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// loadPersistedState — wrong shape
// ---------------------------------------------------------------------------

describe('loadPersistedState — wrong shape', () => {
  it('skips FIELDS_ACTIVE if not an array', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, JSON.stringify({ ids: ['project'] }));
    const result = loadPersistedState();
    expect(result.fields?.activeFieldIds).toBeUndefined();
  });

  it('skips FIELDS_ACTIVE if contains non-strings', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, JSON.stringify(['project', 42]));
    const result = loadPersistedState();
    expect(result.fields?.activeFieldIds).toBeUndefined();
  });

  it('skips FIELDS_VALUES if not a string record', () => {
    localStorage.setItem(STORAGE_KEYS.FIELDS_VALUES, JSON.stringify({ project: 123 }));
    const result = loadPersistedState();
    expect(result.fields?.values).toBeUndefined();
  });

  it('skips separator if object has no separator key', () => {
    localStorage.setItem(STORAGE_KEYS.NOMENCLATURE_SETTINGS, JSON.stringify({ sep: '_' }));
    const result = loadPersistedState();
    expect(result.separator).toBeUndefined();
  });

  it('skips cleaner if missing required fields', () => {
    localStorage.setItem(STORAGE_KEYS.FILENAME_CLEANER, JSON.stringify({ enabled: true }));
    const result = loadPersistedState();
    expect(result.cleaner).toBeUndefined();
  });

  it('skips prefixRules if not an array', () => {
    localStorage.setItem(STORAGE_KEYS.PREFIX_RULES, JSON.stringify({ rules: [] }));
    const result = loadPersistedState();
    expect(result.prefixRules).toBeUndefined();
  });

  it('skips prefixRules if items have wrong shape', () => {
    localStorage.setItem(STORAGE_KEYS.PREFIX_RULES, JSON.stringify([{ prefix: 'X_', action: 'remove' }, 'bad']));
    const result = loadPersistedState();
    expect(result.prefixRules).toBeUndefined();
  });

  it('skips profileId if unknown', () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE_ID, 'unknown');
    const result = loadPersistedState();
    expect(result.profileId).toBeUndefined();
  });

  it('skips profileEntities if keyed by an unknown profile', () => {
    localStorage.setItem(
      STORAGE_KEYS.PROFILE_ENTITIES,
      JSON.stringify({ unknown: [{ id: 'x', code: 'X', label: 'X' }] }),
    );
    const result = loadPersistedState();
    expect(result.profileEntities).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Round-trip: flushPersist → loadPersistedState
// ---------------------------------------------------------------------------

describe('round-trip: flushPersist → loadPersistedState', () => {
  it('persists and loads fields.activeFieldIds', () => {
    const state = makeState({
      fields: { activeFieldIds: ['project', 'docType', 'sequence'], values: {}, workLotPart: null },
    });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.fields?.activeFieldIds).toEqual(['project', 'docType', 'sequence']);
  });

  it('persists and loads fields.values', () => {
    const state = makeState({
      fields: {
        activeFieldIds: ['project'],
        values: { project: 'MYPRJ', docType: 'PLA' },
        workLotPart: null,
      },
    });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.fields?.values).toEqual({ project: 'MYPRJ', docType: 'PLA' });
  });

  it('persists and loads separator', () => {
    const state = makeState({ separator: '-' });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.separator).toBe('-');
  });

  it('persists and loads cleaner state', () => {
    const cleaner = createDefaultCleanerState();
    const state = makeState({ cleaner });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.cleaner?.enabled).toBe(true);
    expect(loaded.cleaner?.wordsToRemove).toEqual(cleaner.wordsToRemove);
    expect(loaded.cleaner?.options).toEqual(cleaner.options);
  });

  it('persists and loads prefixRules', () => {
    const prefixRules = [
      { prefix: 'H3_', action: 'remove' as const },
      { prefix: 'ARC_', action: 'replace' as const, params: { newPrefix: 'STR_' } },
    ];
    const state = makeState({ prefixRules });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.prefixRules).toEqual(prefixRules);
  });

  it('persists and loads profileId and profile-scoped entities', () => {
    const state = makeState({
      profileId: 'finance',
      profileEntities: {
        finance: [{ id: 'finance:CLIENT', code: 'CLIENT', label: 'Client' }],
        hr: [{ id: 'hr:RH', code: 'RH', label: 'RH' }],
      },
    });
    flushPersist(state);
    const loaded = loadPersistedState();
    expect(loaded.profileId).toBe('finance');
    expect(loaded.profileEntities).toEqual(state.profileEntities);
  });

  it('full round-trip — all slices', () => {
    const cleaner = createDefaultCleanerState();
    const state = makeState({
      fields: {
        activeFieldIds: ['project', 'building', 'docType'],
        values: { project: 'PRJ01' },
        workLotPart: null,
      },
      separator: '-',
      cleaner,
      prefixRules: [{ prefix: 'X_', action: 'remove' as const }],
      profileId: 'hr',
      profileEntities: {
        hr: [{ id: 'hr:COLLAB', code: 'COLLAB', label: 'Collaborateur' }],
      },
    });
    flushPersist(state);
    const loaded = loadPersistedState();

    expect(loaded.fields?.activeFieldIds).toEqual(['project', 'building', 'docType']);
    expect(loaded.fields?.values).toEqual({ project: 'PRJ01' });
    expect(loaded.separator).toBe('-');
    expect(loaded.cleaner?.enabled).toBe(true);
    expect(loaded.prefixRules).toEqual([{ prefix: 'X_', action: 'remove' }]);
    expect(loaded.profileId).toBe('hr');
    expect(loaded.profileEntities).toEqual({
      hr: [{ id: 'hr:COLLAB', code: 'COLLAB', label: 'Collaborateur' }],
    });
  });
});

// ---------------------------------------------------------------------------
// persistState (debounced) — basic smoke test
// ---------------------------------------------------------------------------

describe('persistState (debounced)', () => {
  it('does not write synchronously', () => {
    const state = makeState({ separator: '.' });
    persistState(state);
    // Before debounce fires, key should still be null
    expect(localStorage.getItem(STORAGE_KEYS.NOMENCLATURE_SETTINGS)).toBeNull();
  });
});
