'use client';

import type { AppState, PersistedSlices } from '@/lib/app-state';

/**
 * Bibliothèque de conventions multi-clients (fonctionnalité Cabinet).
 *
 * Chaque entrée est un instantané nommé de la convention active
 * (profil, champs, séparateur, entités du profil) stocké en localStorage —
 * cohérent avec l'architecture local-first. Une entrée s'applique via
 * l'action STATE_HYDRATE existante (les slices sont validées par le reducer).
 */
export interface ConventionEntry {
  id: string;
  /** Nom affiché — typiquement le client ou le projet. */
  name: string;
  savedAt: number;
  updatedAt: number;
  slices: PersistedSlices;
}

const STORAGE_KEY = 'bimcheck_convention_library_v1';
/** Garde-fou anti-gonflement du localStorage. */
export const MAX_LIBRARY_ENTRIES = 50;

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function uid(): string {
  return `conv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function listConventions(): ConventionEntry[] {
  const raw = storage()?.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is ConventionEntry =>
          typeof e === 'object' &&
          e !== null &&
          typeof (e as ConventionEntry).id === 'string' &&
          typeof (e as ConventionEntry).name === 'string' &&
          typeof (e as ConventionEntry).slices === 'object',
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

function writeAll(entries: ConventionEntry[]): void {
  storage()?.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_LIBRARY_ENTRIES)));
}

/** Instantané de la convention active — uniquement les slices « convention ». */
export function snapshotConvention(state: AppState): PersistedSlices {
  const entities = state.profileEntities[state.profileId];
  return {
    profileId: state.profileId,
    fields: {
      activeFieldIds: [...state.fields.activeFieldIds],
      values: { ...state.fields.values },
    },
    separator: state.separator,
    ...(entities && entities.length > 0
      ? { profileEntities: { [state.profileId]: entities } }
      : {}),
  };
}

export function saveConvention(name: string, state: AppState): ConventionEntry | null {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return null;
  const now = Date.now();
  const entry: ConventionEntry = {
    id: uid(),
    name: trimmed,
    savedAt: now,
    updatedAt: now,
    slices: snapshotConvention(state),
  };
  const entries = listConventions();
  if (entries.length >= MAX_LIBRARY_ENTRIES) return null;
  writeAll([entry, ...entries]);
  return entry;
}

export function updateConvention(id: string, state: AppState): ConventionEntry | null {
  const entries = listConventions();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  const updated: ConventionEntry = {
    ...entries[index],
    updatedAt: Date.now(),
    slices: snapshotConvention(state),
  };
  entries[index] = updated;
  writeAll(entries);
  return updated;
}

export function renameConvention(id: string, name: string): ConventionEntry | null {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return null;
  const entries = listConventions();
  const index = entries.findIndex((e) => e.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], name: trimmed, updatedAt: Date.now() };
  writeAll(entries);
  return entries[index];
}

export function duplicateConvention(id: string): ConventionEntry | null {
  const entries = listConventions();
  const source = entries.find((e) => e.id === id);
  if (!source || entries.length >= MAX_LIBRARY_ENTRIES) return null;
  const now = Date.now();
  const copy: ConventionEntry = {
    ...source,
    id: uid(),
    name: `${source.name} (copie)`.slice(0, 80),
    savedAt: now,
    updatedAt: now,
  };
  writeAll([copy, ...entries]);
  return copy;
}

export function deleteConvention(id: string): void {
  writeAll(listConventions().filter((e) => e.id !== id));
}

export function getConvention(id: string): ConventionEntry | null {
  return listConventions().find((e) => e.id === id) ?? null;
}
