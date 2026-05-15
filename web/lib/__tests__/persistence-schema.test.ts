/**
 * Persistence schema-versioning tests.
 *
 * Goal: prove forward-compat (future data → fail closed) and backward-compat
 * (legacy data with no version sentinel → migrated to current version).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPersistedState, persistState, flushPersist, SCHEMA_VERSION } from '../persistence';
import { STORAGE_KEYS } from '../bim/config/defaults';
import { createDefaultFieldsState } from '../bim/fields';
import { createDefaultState as createDefaultCleaner } from '../bim/filename-cleaner';
import type { AppState } from '../app-state';

function freshAppState(): AppState {
  return {
    files: [],
    fields: createDefaultFieldsState(),
    separator: '-',
    cleaner: createDefaultCleaner(),
    prefixRules: [],
    isUploading: false,
    isRenaming: false,
    preview: '',
    toastMsg: null,
    ui: {
      searchQuery: '',
      extFilter: '',
      selectedIds: [],
      previewingFileId: null,
      applyScope: 'all',
    },
  };
}

describe('persistence: schema versioning', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.useFakeTimers();
  });

  it('persistState writes the SCHEMA_VERSION sentinel', () => {
    persistState(freshAppState());
    vi.runAllTimers();
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)).toBe(String(SCHEMA_VERSION));
  });

  it('flushPersist writes synchronously and stamps the version', () => {
    flushPersist(freshAppState());
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)).toBe(String(SCHEMA_VERSION));
  });

  it('load on legacy data (no version key, with FIELDS_ACTIVE) migrates and reads', () => {
    // Simulate a legacy write (no schema sentinel)
    globalThis.localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, JSON.stringify(['project']));
    // No SCHEMA_VERSION key set → simulates pre-versioning data.
    const slices = loadPersistedState();
    // Migration must have stamped the version.
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)).toBe(String(SCHEMA_VERSION));
    // The legacy fields slice is still loaded.
    expect(slices.fields?.activeFieldIds).toEqual(['project']);
  });

  it('load from a FUTURE version (v=99) fails closed: returns empty slices', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, '99');
    globalThis.localStorage.setItem(STORAGE_KEYS.FIELDS_ACTIVE, JSON.stringify(['project']));
    const slices = loadPersistedState();
    // Future data is NOT loaded; caller will get defaults.
    expect(slices.fields).toBeUndefined();
  });

  it('load from current version proceeds normally', () => {
    flushPersist(freshAppState());
    const slices = loadPersistedState();
    expect(slices.separator).toBe('-');
  });

  it('malformed version sentinel is treated as legacy and migrated', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, 'not-a-number');
    globalThis.localStorage.setItem(STORAGE_KEYS.FIELDS_VALUES, JSON.stringify({ project: 'P01' }));
    const slices = loadPersistedState();
    expect(globalThis.localStorage.getItem(STORAGE_KEYS.SCHEMA_VERSION)).toBe(String(SCHEMA_VERSION));
    expect(slices.fields?.values).toEqual({ project: 'P01' });
  });

  it('round-trip preserves all persisted slices', () => {
    const original = freshAppState();
    original.separator = '_';
    original.fields.values = { project: 'PRJ', building: 'A' };
    flushPersist(original);
    const slices = loadPersistedState();
    expect(slices.separator).toBe('_');
    expect(slices.fields?.values).toEqual({ project: 'PRJ', building: 'A' });
  });
});
