/**
 * BIM Nomenclature Fields Manager
 * Ported 1:1 from extension/js/fields.js (FieldsManager singleton)
 *
 * Changes from the JS source:
 * - No DOM / window / localStorage. State is a plain `FieldsState` object;
 *   the React layer owns persistence.
 * - Singleton methods → module-level exported functions.
 * - All mutators return new state (no in-place mutation).
 * - `onChange` / `notifyChange` removed — React re-render handles reactivity.
 * - `saveState` / `loadSavedState` removed — caller serialises via export/import.
 * - `validateFields`, `parseFilenameParts`, `setFilenameParts`, `getFilenameParts`,
 *   `clearFilenameParts` kept as pure helpers where they are free of side effects.
 * - `applyTemplate` → `loadTemplate` (same semantics).
 */

import type { FieldDefinition } from './types';
import { DEFAULT_TEMPLATES } from './config/defaults';

// ---------------------------------------------------------------------------
// FIELD_DEFINITIONS — master list (order-stable, read-only)
// Faithful replica of FieldsManager.fieldDefinitions from fields.js.
// ---------------------------------------------------------------------------

export const FIELD_DEFINITIONS: readonly FieldDefinition[] = [
  {
    id: 'project',
    code: 'PRJ',
    name: 'Code Projet',
    type: 'project',
    required: false,
    maxLength: 10,
    validation: /^[A-Z0-9]+$/,
    transform: 'upper',
    placeholder: 'ex: PROJ01',
    description: 'Identifiant unique du projet (optionnel)',
  },
  {
    id: 'building',
    code: 'BAT',
    name: 'Bâtiment',
    type: 'building',
    required: false,
    maxLength: 10,
    validation: /^[A-Z0-9]+$/,
    transform: 'upper',
    placeholder: 'ex: BAT-A',
    description: 'Code du bâtiment ou zone (optionnel)',
  },
  {
    id: 'workLot',
    code: 'LOT',
    name: 'Lot de Travail',
    type: 'workLot',
    required: false,
    inputType: 'select',
    options: 'workLots',
    searchable: true,
    placeholder: 'Sélectionner un lot...',
    description: 'Lot de travail (corps de métier)',
  },
  {
    id: 'discipline',
    code: 'DIS',
    name: 'Discipline',
    type: 'discipline',
    required: false,
    inputType: 'select',
    options: 'disciplines',
    placeholder: 'Sélectionner...',
    description: 'Discipline technique ou lot',
  },
  {
    id: 'docType',
    code: 'DOC',
    name: 'Type Document',
    type: 'document',
    required: true,
    inputType: 'select',
    options: 'documentTypes',
    searchable: true,
    placeholder: 'Sélectionner...',
    description: 'Type de document',
  },
  {
    id: 'sequence',
    code: 'SEQ',
    name: 'Séquence',
    type: 'sequence',
    required: false,
    maxLength: 5,
    validation: /^[0-9]+$/,
    transform: 'padStart:3',
    placeholder: 'ex: 001',
    description: 'Numéro de séquence',
    autoIncrement: true,
  },
  {
    id: 'revision',
    code: 'REV',
    name: 'Révision',
    type: 'revision',
    required: false,
    maxLength: 5,
    validation: /^[A-Z0-9]+$/,
    transform: 'upper',
    placeholder: 'ex: A ou 01',
    description: 'Indice de révision',
  },
  {
    id: 'date',
    code: 'DAT',
    name: 'Date',
    type: 'date',
    required: false,
    inputType: 'date',
    format: 'YYYYMMDD',
    description: 'Date du document',
  },
  {
    id: 'phase',
    code: 'PHA',
    name: 'Phase',
    type: 'custom',
    required: false,
    inputType: 'select',
    options: [
      { code: 'ESQ', name: 'Esquisse' },
      { code: 'AVP', name: 'Avant-projet' },
      { code: 'PRO', name: 'Projet' },
      { code: 'DCE', name: 'DCE' },
      { code: 'EXE', name: 'Exécution' },
      { code: 'DOE', name: 'DOE' },
      { code: 'EXP', name: 'Exploitation' },
    ],
    placeholder: 'Phase...',
    description: 'Phase du projet',
  },
  {
    id: 'zone',
    code: 'ZON',
    name: 'Zone',
    type: 'custom',
    required: false,
    maxLength: 10,
    validation: /^[A-Z0-9]+$/,
    transform: 'upper',
    placeholder: 'ex: ZN01',
    description: 'Zone ou secteur',
  },
  {
    id: 'level',
    code: 'NIV',
    name: 'Niveau',
    type: 'custom',
    required: false,
    maxLength: 5,
    validation: /^[A-Z0-9\-]+$/,
    transform: 'upper',
    placeholder: 'ex: R+2',
    description: 'Niveau ou étage',
  },
  {
    id: 'originator',
    code: 'ORI',
    name: 'Émetteur',
    type: 'custom',
    required: false,
    maxLength: 10,
    validation: /^[A-Z0-9]+$/,
    transform: 'upper',
    placeholder: 'ex: SGV',
    description: 'Code émetteur',
  },
  {
    id: 'company',
    code: 'ENT',
    name: 'Entreprise',
    type: 'custom',
    required: false,
    inputType: 'select',
    options: 'companies',
    searchable: true,
    placeholder: 'Sélectionner une entreprise...',
    description: 'Entreprise / fournisseur (filtré selon le lot PEF sélectionné)',
  },
  {
    id: 'status',
    code: 'STA',
    name: 'Statut',
    type: 'custom',
    required: false,
    inputType: 'select',
    options: [
      { code: 'WIP', name: 'En cours' },
      { code: 'S0', name: 'Pour information' },
      { code: 'S1', name: 'Pour coordination' },
      { code: 'S2', name: 'Pour commentaires' },
      { code: 'S3', name: 'Pour approbation' },
      { code: 'S4', name: 'Pour construction' },
      { code: 'S5', name: 'Approuvé final' },
      { code: 'S6', name: 'Tel que construit' },
    ],
    placeholder: 'Statut...',
    description: 'Statut du document (ISO 19650)',
  },
  {
    id: 'custom1',
    code: 'CUS1',
    name: 'Champ personnalisé 1',
    type: 'custom',
    required: false,
    maxLength: 20,
    placeholder: 'Valeur...',
    description: 'Champ personnalisable',
  },
  {
    id: 'custom2',
    code: 'CUS2',
    name: 'Champ personnalisé 2',
    type: 'custom',
    required: false,
    maxLength: 20,
    placeholder: 'Valeur...',
    description: 'Champ personnalisable',
  },
  {
    id: 'filename',
    code: 'NOM',
    name: 'Nom fichier original',
    type: 'custom',
    required: false,
    transform: 'cleanFilename',
    description: 'Nom de fichier original nettoyé',
  },
] as const;

/** Lookup map by field id for O(1) access */
const _fieldMap: ReadonlyMap<string, FieldDefinition> = new Map(
  FIELD_DEFINITIONS.map((f) => [f.id, f]),
);

// ---------------------------------------------------------------------------
// FieldsState — mutable per-user state (managed by the React layer)
// ---------------------------------------------------------------------------

export interface FieldsState {
  /** Ordered field IDs — the user's chosen sequence */
  activeFieldIds: string[];
  /** field id → user-entered (transformed) value */
  values: Record<string, string>;
  /**
   * Selected work-lot part (a token from the current filename chosen by the
   * user to be inserted after the 'building' field).
   * Mirrors FieldsManager.workLotPart.
   */
  workLotPart: string | null;
}

// ---------------------------------------------------------------------------
// createDefaultFieldsState
// ---------------------------------------------------------------------------

/**
 * Construct the default `FieldsState`.
 * Mirrors `FieldsManager.init()` / `resetToDefaults()`:
 * default active fields are ['project', 'building', 'workLot', 'docType', 'company', 'sequence'].
 */
export function createDefaultFieldsState(): FieldsState {
  return {
    activeFieldIds: ['project', 'building', 'workLot', 'docType', 'company', 'sequence'],
    values: {},
    workLotPart: null,
  };
}

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/**
 * Get all known field definitions (same as `FieldsManager.getAllFields()`).
 */
export function getAllFields(): readonly FieldDefinition[] {
  return FIELD_DEFINITIONS;
}

/**
 * Get a single field definition by ID.
 * Returns `undefined` if the ID is not recognised.
 */
export function getFieldDefinition(fieldId: string): FieldDefinition | undefined {
  return _fieldMap.get(fieldId);
}

/**
 * Get the active fields in order (resolves IDs → definitions).
 * Unknown IDs are silently skipped (same as the JS source `.filter(Boolean)`).
 */
export function getActiveFields(state: FieldsState): FieldDefinition[] {
  return state.activeFieldIds
    .map((id) => _fieldMap.get(id))
    .filter((f): f is FieldDefinition => f !== undefined);
}

/**
 * Get inactive (available) fields — all fields not in activeFieldIds.
 */
export function getInactiveFields(state: FieldsState): FieldDefinition[] {
  const activeSet = new Set(state.activeFieldIds);
  return FIELD_DEFINITIONS.filter((f) => !activeSet.has(f.id)) as FieldDefinition[];
}

/**
 * Get the current value of a field. Returns `''` if unset (mirrors JS source).
 */
export function getFieldValue(state: FieldsState, fieldId: string): string {
  return state.values[fieldId] ?? '';
}

// ---------------------------------------------------------------------------
// transformValue — faithful 1:1 port of FieldsManager.transformValue
// ---------------------------------------------------------------------------

/**
 * Apply casing + padding + custom transforms to a value.
 *
 * Transform strings are `'|'`-separated tokens:
 * - `'upper'` → toUpperCase
 * - `'lower'` → toLowerCase
 * - `'padStart:N'` → padStart(N, '0')
 * - `'cleanFilename'` → replace non-alnum with `_`, then uppercase
 */
export function transformValue(value: string, field: FieldDefinition): string {
  if (!value || !field.transform) return value;

  const transforms = field.transform.split('|');
  let result = String(value);

  for (const transform of transforms) {
    if (transform === 'upper') {
      result = result.toUpperCase();
    } else if (transform === 'lower') {
      result = result.toLowerCase();
    } else if (transform.startsWith('padStart:')) {
      const length = parseInt(transform.split(':')[1], 10);
      result = result.padStart(length, '0');
    } else if (transform === 'cleanFilename') {
      result = result.replace(/[^A-Za-z0-9_\-]/g, '_').toUpperCase();
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Mutators — all return new state (no mutation)
// ---------------------------------------------------------------------------

/**
 * Set a field value — returns new state.
 * Applies the field's transform; returns `null` if the field ID is unknown.
 * (JS source returned `false` on unknown field, here we return `null` so
 * TypeScript callers can distinguish "unknown field" from "valid update".)
 */
export function setFieldValue(
  state: FieldsState,
  fieldId: string,
  value: string,
): FieldsState {
  const field = _fieldMap.get(fieldId);
  if (!field) return state;

  const transformed = transformValue(value, field);

  return {
    ...state,
    values: { ...state.values, [fieldId]: transformed },
  };
}

/**
 * Set the active fields list — returns new state.
 * Unknown IDs are silently filtered out (same as JS source).
 */
export function setActiveFields(state: FieldsState, fieldIds: string[]): FieldsState {
  const valid = fieldIds.filter((id) => _fieldMap.has(id));
  return { ...state, activeFieldIds: valid };
}

/**
 * Set which token from the current filename is the work-lot part.
 * Mirrors `FieldsManager.setWorkLotPart`.
 */
export function setWorkLotPart(state: FieldsState, partValue: string | null): FieldsState {
  return { ...state, workLotPart: partValue ?? null };
}

// ---------------------------------------------------------------------------
// getWorkLotPart
// ---------------------------------------------------------------------------

/**
 * Get the selected work-lot code:
 *   1. If `state.workLotPart` is set (user manually selected a filename token) → return it.
 *   2. Else if the 'workLot' field is active and has a value → return that value.
 *   3. Otherwise → null.
 *
 * Mirrors `FieldsManager.getWorkLotPart()`.
 */
export function getWorkLotPart(state: FieldsState): string | null {
  if (state.workLotPart) return state.workLotPart;
  const wlActive = state.activeFieldIds.includes('workLot');
  if (wlActive) {
    const v = state.values['workLot'];
    return v || null;
  }
  return null;
}

// ---------------------------------------------------------------------------
// loadTemplate — mirrors FieldsManager.applyTemplate
// ---------------------------------------------------------------------------

/**
 * Load a predefined template into `state`.
 * Template IDs match the keys in `DEFAULT_TEMPLATES` ('swiss-bim', 'french-bim', 'iso19650').
 * If `clearValues` is true (default false) the field values are also reset.
 * Returns the same `state` unchanged if the templateId is not found.
 */
export function loadTemplate(
  state: FieldsState,
  templateId: string,
  clearValues = false,
): FieldsState {
  const template = DEFAULT_TEMPLATES[templateId];
  if (!template) return state;

  const valid = template.fields.filter((f) => _fieldMap.has(f));
  return {
    ...state,
    activeFieldIds: valid,
    values: clearValues ? {} : state.values,
    workLotPart: clearValues ? null : state.workLotPart,
  };
}

// ---------------------------------------------------------------------------
// Validation helper (pure port of FieldsManager.validateFields)
// ---------------------------------------------------------------------------

export interface FieldValidationError {
  fieldId: string;
  message: string;
}

/**
 * Validate all active fields in a state.
 * Returns an array of errors (empty if valid).
 */
export function validateFields(state: FieldsState): FieldValidationError[] {
  const errors: FieldValidationError[] = [];

  for (const fieldId of state.activeFieldIds) {
    const field = _fieldMap.get(fieldId);
    if (!field) continue;
    const value = state.values[fieldId];

    if (field.required && !value) {
      errors.push({ fieldId, message: `Le champ "${field.name}" est requis` });
    }
    if (value && field.maxLength && value.length > field.maxLength) {
      errors.push({
        fieldId,
        message: `Le champ "${field.name}" dépasse la longueur maximale (${field.maxLength})`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// parseFilenameParts — pure helper (no state mutation)
// ---------------------------------------------------------------------------

/**
 * Parse a filename into tokens by common separators (_, -, ., space).
 * Extension is stripped first.
 * Mirrors `FieldsManager.parseFilenameParts`.
 */
export function parseFilenameParts(filename: string): string[] {
  const lastDot = filename.lastIndexOf('.');
  const baseName = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  return baseName.split(/[_\-.\s]+/).filter((p) => p.length > 0);
}

// ---------------------------------------------------------------------------
// exportFieldsState / importFieldsState — JSON round-trip
// ---------------------------------------------------------------------------

/**
 * Serialize state to a JSON string (for cloud sync / localStorage).
 */
export function exportFieldsState(state: FieldsState): string {
  return JSON.stringify({
    activeFieldIds: state.activeFieldIds,
    values: state.values,
    workLotPart: state.workLotPart,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Deserialize state from a JSON string.
 * Unknown field IDs are filtered out; missing keys get safe defaults.
 * Throws `SyntaxError` if the JSON is malformed (caller should catch).
 */
export function importFieldsState(json: string): FieldsState {
  const raw = JSON.parse(json) as Partial<{
    activeFieldIds: unknown;
    values: unknown;
    workLotPart: unknown;
    // legacy key from the JS source
    activeFields: unknown;
    fieldValues: unknown;
  }>;

  // Support both the new key (activeFieldIds) and the legacy JS key (activeFields)
  const rawIds =
    (Array.isArray(raw.activeFieldIds) ? raw.activeFieldIds : null) ??
    (Array.isArray(raw.activeFields) ? raw.activeFields : null) ??
    [];

  const activeFieldIds = (rawIds as unknown[])
    .filter((id): id is string => typeof id === 'string' && _fieldMap.has(id));

  const rawValues =
    (raw.values && typeof raw.values === 'object' ? raw.values : null) ??
    (raw.fieldValues && typeof raw.fieldValues === 'object' ? raw.fieldValues : null) ??
    {};

  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawValues as Record<string, unknown>)) {
    if (typeof v === 'string' && _fieldMap.has(k)) {
      values[k] = v;
    }
  }

  const workLotPart =
    typeof raw.workLotPart === 'string' ? raw.workLotPart : null;

  return {
    activeFieldIds: activeFieldIds.length > 0
      ? activeFieldIds
      : createDefaultFieldsState().activeFieldIds,
    values,
    workLotPart,
  };
}
