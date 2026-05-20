/**
 * localStorage persistence helpers for DOC-RENAME app state.
 *
 * Keys mirror the extension's localStorage keys (via STORAGE_KEYS) so future
 * migration between the extension and the web app is clean.
 *
 * SSR-safe: all localStorage access is wrapped in try/catch; on the server
 * localStorage is undefined and every read returns null gracefully.
 *
 * Transient slices NOT persisted:
 *   files, ui.searchQuery, ui.extFilter, ui.selectedIds, ui.previewingFileId,
 *   isUploading, isRenaming, preview, toastMsg
 */

import { STORAGE_KEYS } from '@/lib/bim/config/defaults';
import type { AppState, PersistedSlices } from '@/lib/app-state';
import type { CleanerState } from '@/lib/bim/filename-cleaner';
import type { PrefixRule } from '@/lib/bim/types';
import {
  coercePublicProfileId,
  isIndustryProfileId,
  type ProfileEntitiesById,
  type ProfileEntity,
} from '@/lib/profiles';

/**
 * Schema version. Bump when ANY persisted slice changes shape in a way that
 * a previously-saved value would deserialize incorrectly.
 *
 *  v1 (2026-05): initial layout — per-slice keys, see STORAGE_KEYS.
 *  v2 (2026-05): active industry profile and profile-scoped entities.
 */
export const SCHEMA_VERSION = 2;

/**
 * Inspect the persisted schema version. Returns:
 *   - null if no version key (legacy / never-written) → caller treats as v0
 *   - the parsed version number if valid
 *   - null on malformed value (treated as legacy / reset)
 */
function getPersistedSchemaVersion(): number | null {
  const raw = storageGet(STORAGE_KEYS.SCHEMA_VERSION);
  if (raw === null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Future-compatibility guard. If the persisted version is HIGHER than what
 * this build knows about, we fail closed: load nothing. Better to start fresh
 * than corrupt unknown future data.
 */
function isFromFutureBuild(): boolean {
  const v = getPersistedSchemaVersion();
  return v !== null && v > SCHEMA_VERSION;
}

/**
 * Apply ordered, idempotent migrations from `fromVersion` up to SCHEMA_VERSION.
 * Each step performs whatever localStorage rewrites are needed and writes the
 * version sentinel at the end.
 */
function migrateSchema(fromVersion: number): void {
  // v0 → v1: no rewrite needed; existing per-slice keys are already v1 shape.
  if (fromVersion < 1) {
    storageSet(STORAGE_KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
  }
  // v1 → v2: new keys are optional and default to the BIM profile at runtime.
  if (fromVersion < 2) {
    storageSet(STORAGE_KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
  }
}

// ---------------------------------------------------------------------------
// Low-level storage access (SSR-safe)
// ---------------------------------------------------------------------------

function storageGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Shape validators
// ---------------------------------------------------------------------------

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

function isStringRecord(v: unknown): v is Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.values(v as Record<string, unknown>).every(
    (val) => typeof val === 'string'
  );
}

function isValidCleanerState(v: unknown): v is CleanerState {
  if (typeof v !== 'object' || v === null) return false;
  const raw = v as Record<string, unknown>;
  return (
    typeof raw.enabled === 'boolean' &&
    Array.isArray(raw.replacementRules) &&
    Array.isArray(raw.wordsToRemove) &&
    typeof raw.spellingCorrections === 'object' &&
    raw.spellingCorrections !== null &&
    typeof raw.options === 'object' &&
    raw.options !== null
  );
}

function isValidPrefixRules(v: unknown): v is PrefixRule[] {
  if (!Array.isArray(v)) return false;
  return v.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).prefix === 'string' &&
      typeof (item as Record<string, unknown>).action === 'string'
  );
}

function isValidProfileEntity(v: unknown): v is ProfileEntity {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Record<string, unknown>).id === 'string' &&
    typeof (v as Record<string, unknown>).code === 'string' &&
    typeof (v as Record<string, unknown>).label === 'string'
  );
}

function isValidProfileEntitiesById(v: unknown): v is ProfileEntitiesById {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.entries(v as Record<string, unknown>).every(
    ([profileId, entities]) =>
      isIndustryProfileId(profileId) &&
      Array.isArray(entities) &&
      entities.every(isValidProfileEntity),
  );
}

// ---------------------------------------------------------------------------
// loadPersistedState
// ---------------------------------------------------------------------------

/**
 * Read each persisted key from localStorage, parse JSON, validate shape.
 * Returns only slices that are present and valid; missing/corrupt entries
 * are silently skipped (callers merge with initialState defaults).
 */
export function loadPersistedState(): PersistedSlices {
  // Fail-closed on data written by a future build that we don't understand.
  if (isFromFutureBuild()) {
    return {};
  }

  // Apply migrations up to current version (idempotent — re-running is safe).
  const v = getPersistedSchemaVersion();
  if (v === null || v < SCHEMA_VERSION) {
    migrateSchema(v ?? 0);
  }

  const slices: PersistedSlices = {};

  // --- profileId ---
  const rawProfileId = storageGet(STORAGE_KEYS.PROFILE_ID);
  if (rawProfileId !== null && isIndustryProfileId(rawProfileId)) {
    // Coerce hidden profiles (Finance, RH, etc.) to BIM when BIM_ONLY V1
    // gate is on. Keeps users out of unsupported UI states without losing
    // the rest of their persisted preferences.
    slices.profileId = coercePublicProfileId(rawProfileId);
  }

  // --- profileEntities ---
  const rawProfileEntities = storageGet(STORAGE_KEYS.PROFILE_ENTITIES);
  if (rawProfileEntities !== null) {
    try {
      const parsed: unknown = JSON.parse(rawProfileEntities);
      if (isValidProfileEntitiesById(parsed)) {
        slices.profileEntities = parsed;
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // --- fields.activeFieldIds ---
  const rawActive = storageGet(STORAGE_KEYS.FIELDS_ACTIVE);
  if (rawActive !== null) {
    try {
      const parsed: unknown = JSON.parse(rawActive);
      if (isStringArray(parsed)) {
        slices.fields = { ...slices.fields, activeFieldIds: parsed };
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // --- fields.values ---
  const rawValues = storageGet(STORAGE_KEYS.FIELDS_VALUES);
  if (rawValues !== null) {
    try {
      const parsed: unknown = JSON.parse(rawValues);
      if (isStringRecord(parsed)) {
        slices.fields = { ...slices.fields, values: parsed };
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // --- separator (stored as { separator: string }) ---
  const rawSettings = storageGet(STORAGE_KEYS.NOMENCLATURE_SETTINGS);
  if (rawSettings !== null) {
    try {
      const parsed: unknown = JSON.parse(rawSettings);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof (parsed as Record<string, unknown>).separator === 'string'
      ) {
        slices.separator = (parsed as { separator: string }).separator;
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // --- cleaner ---
  const rawCleaner = storageGet(STORAGE_KEYS.FILENAME_CLEANER);
  if (rawCleaner !== null) {
    try {
      const parsed: unknown = JSON.parse(rawCleaner);
      if (isValidCleanerState(parsed)) {
        slices.cleaner = parsed as CleanerState;
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // --- prefixRules ---
  const rawPrefixes = storageGet(STORAGE_KEYS.PREFIX_RULES);
  if (rawPrefixes !== null) {
    try {
      const parsed: unknown = JSON.parse(rawPrefixes);
      if (isValidPrefixRules(parsed)) {
        slices.prefixRules = parsed as PrefixRule[];
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  return slices;
}

// ---------------------------------------------------------------------------
// persistState (debounced)
// ---------------------------------------------------------------------------

let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 500;

/**
 * Schedule a debounced write of the relevant app state slices to localStorage.
 * Only the persisted slices are saved; transient state is ignored.
 */
export function persistState(state: AppState): void {
  if (_debounceTimer !== null) {
    clearTimeout(_debounceTimer);
  }
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    _writeState(state);
  }, DEBOUNCE_MS);
}

/** Flush any pending debounced write immediately. Used in tests. */
export function flushPersist(state: AppState): void {
  if (_debounceTimer !== null) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  _writeState(state);
}

function _writeState(state: AppState): void {
  // Stamp the schema version on every write so a future build can detect
  // exactly which migration to apply (or fail closed if we're behind).
  storageSet(STORAGE_KEYS.SCHEMA_VERSION, String(SCHEMA_VERSION));
  storageSet(
    STORAGE_KEYS.FIELDS_ACTIVE,
    JSON.stringify(state.fields.activeFieldIds)
  );
  storageSet(
    STORAGE_KEYS.FIELDS_VALUES,
    JSON.stringify(state.fields.values)
  );
  storageSet(STORAGE_KEYS.PROFILE_ID, state.profileId);
  storageSet(
    STORAGE_KEYS.PROFILE_ENTITIES,
    JSON.stringify(state.profileEntities)
  );
  storageSet(
    STORAGE_KEYS.NOMENCLATURE_SETTINGS,
    JSON.stringify({ separator: state.separator })
  );
  storageSet(
    STORAGE_KEYS.FILENAME_CLEANER,
    JSON.stringify(state.cleaner)
  );
  storageSet(
    STORAGE_KEYS.PREFIX_RULES,
    JSON.stringify(state.prefixRules)
  );
}
