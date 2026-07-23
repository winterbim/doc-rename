/**
 * BIM Nomenclature Engine
 * Ported 1:1 from extension/js/nomenclature.js (NomenclatureBuilder singleton)
 *
 * Changes from the JS source:
 * - No DOM / window / localStorage access. Storage state is passed in/out via
 *   plain objects; the React layer manages persistence.
 * - NomenclatureBuilder singleton → module-level exported functions.
 * - Mutable `sequenceCounter` dict → explicit `SequenceCounters` object passed
 *   through `batchGenerate` (caller owns it, just like React manages the state).
 * - `getCachedName` → `generate(..., cache?)` with optional `NomenclatureCache`
 *   instance (same semantics, caller owns the cache).
 * - `generatePreview` receives `NomenclatureContext` directly (no FieldsManager).
 * - `generateReport` accepts the structured result array from `batchGenerate`.
 * - `applyCaseTransform` and `parseFilename` kept as named exports for
 *   completeness / testing; `cleanFilename` also exported.
 */

import type {
  WorkspaceFile,
  FieldDefinition,
  ValidationResult,
} from './types';

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

/**
 * All global nomenclature configuration — passed explicitly so the React
 * layer (or tests) controls state with no hidden globals.
 */
export interface NomenclatureContext {
  /** Ordered list of active fields (same as FieldsManager.getActiveFields()). */
  activeFields: FieldDefinition[];
  /** User-entered / global value per field id. */
  fieldValues: Record<string, string>;
  /** Token separator (e.g. '_', '-', '.'). */
  separator: string;
  /**
   * Optional work-lot string to inject after the 'building' field
   * (mirrors FieldsManager.getWorkLotPart()).
   */
  workLotPart?: string;
}

/** Counter state for per-folder sequence numbers (owned by the caller). */
export type SequenceCounters = Record<string, number>;

// ---------------------------------------------------------------------------
// normalizeBIM
// ---------------------------------------------------------------------------

/**
 * BIM Standard Normalization: strip accents + UPPERCASE + collapse underscores.
 *
 * Faithfully reproduces the regex chain from NomenclatureBuilder.normalizeBIM.
 */
export function normalizeBIM(str: string): string {
  if (!str) return '';
  return (
    str
      // lowercase accents
      .replace(/[àâäã]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[îïì]/g, 'i')
      .replace(/[ôöòõ]/g, 'o')
      .replace(/[ùûüú]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/[ÿ]/g, 'y')
      .replace(/[æ]/g, 'ae')
      .replace(/[œ]/g, 'oe')
      // uppercase accents
      .replace(/[ÀÂÄÃ]/g, 'A')
      .replace(/[ÉÈÊË]/g, 'E')
      .replace(/[ÎÏÌÍ]/g, 'I')
      .replace(/[ÔÖÒÕ]/g, 'O')
      .replace(/[ÙÛÜÚ]/g, 'U')
      .replace(/[Ç]/g, 'C')
      .replace(/[Ñ]/g, 'N')
      .replace(/[Ÿ]/g, 'Y')
      .replace(/[Æ]/g, 'AE')
      .replace(/[Œ]/g, 'OE')
      // uppercase everything
      .toUpperCase()
      // collapse multiple underscores
      .replace(/_+/g, '_')
      // strip leading/trailing underscores
      .replace(/^_|_$/g, '')
  );
}

/** Separators légaux pour la sortie ; tout autre caractère retombe sur '_'. */
const OUTPUT_SEPARATORS = new Set(['_', '-', '.']);

function escapeRegExp(char: string): string {
  return char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize any final output filename shown to the user or written to disk.
 * Enforces the BIMCHECK-Rename invariant on every output path:
 * - uppercase, accents translittérés (normalizeBIM) ;
 * - aucun caractère non-ASCII (— ° ’ etc. sont supprimés) ;
 * - aucun espace : les espaces deviennent le séparateur choisi
 *   (aucune convention de nommage ne conserve d'espaces) ;
 * - les répétitions de séparateur sont réduites, les bords nettoyés ;
 * - l'extension est préservée et mise en majuscules.
 */
export function normalizeOutputName(name: string, separator = '_'): string {
  if (!name) return '';
  const sep = OUTPUT_SEPARATORS.has(separator) ? separator : '_';
  const sepPattern = escapeRegExp(sep);

  const { baseName, extension } = parseFilename(name);

  const base = normalizeBIM(baseName)
    // Invariant sortie : ASCII imprimable uniquement
    .replace(/[^\x20-\x7E]/g, '')
    // Les espaces (et runs d'espaces) deviennent le séparateur
    .replace(/\s+/g, sep)
    // Réduire les répétitions du séparateur introduites par le nettoyage
    .replace(new RegExp(`${sepPattern}{2,}`, 'g'), sep)
    // Pas de séparateur en début/fin de nom de base
    .replace(new RegExp(`^${sepPattern}+|${sepPattern}+$`, 'g'), '');

  const ext = extension.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, '').toUpperCase();

  return base + ext;
}

// ---------------------------------------------------------------------------
// applyCaseTransform (internal + exported for tests/UI)
// ---------------------------------------------------------------------------

export type CaseTransform = 'upper' | 'lower' | 'title' | 'none';

/**
 * Apply a case transform to a string.
 * Matches NomenclatureBuilder.applyCaseTransform exactly.
 */
export function applyCaseTransform(value: string, transform: CaseTransform): string {
  switch (transform) {
    case 'upper':
      return value.toUpperCase();
    case 'lower':
      return value.toLowerCase();
    case 'title':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    default:
      return value;
  }
}

// ---------------------------------------------------------------------------
// parseFilename (exported for test/utility use)
// ---------------------------------------------------------------------------

export interface ParsedFilename {
  original: string;
  baseName: string;
  extension: string;
}

/**
 * Split a filename into baseName + extension.
 * Mirrors NomenclatureBuilder.parseFilename exactly.
 */
export function parseFilename(filename: string): ParsedFilename {
  const lastDot = filename.lastIndexOf('.');
  const baseName = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  const extension = lastDot > 0 ? filename.substring(lastDot) : '';
  return { original: filename, baseName, extension };
}

// ---------------------------------------------------------------------------
// cleanFilename (exported for test/utility use)
// ---------------------------------------------------------------------------

/**
 * Remove special characters and normalise to uppercase.
 * Mirrors NomenclatureBuilder.cleanFilename exactly.
 */
export function cleanFilename(name: string): string {
  return name
    .replace(/[àâä]/gi, 'A')
    .replace(/[éèêë]/gi, 'E')
    .replace(/[îï]/gi, 'I')
    .replace(/[ôö]/gi, 'O')
    .replace(/[ùûü]/gi, 'U')
    .replace(/[ç]/gi, 'C')
    .replace(/[^A-Za-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toUpperCase();
}

// ---------------------------------------------------------------------------
// getNextSequence / resetSequence
// ---------------------------------------------------------------------------

/**
 * Get the next zero-padded sequence number for `key` and mutate `counters`.
 * Matches NomenclatureBuilder.getNextSequence.
 */
export function getNextSequence(counters: SequenceCounters, key: string): string {
  if (counters[key] === undefined) {
    counters[key] = 0;
  }
  counters[key]++;
  return String(counters[key]).padStart(3, '0');
}

/**
 * Reset one key or all keys. Mutates `counters` in-place (same as source).
 */
export function resetSequence(counters: SequenceCounters, key?: string): void {
  if (key !== undefined) {
    delete counters[key];
  } else {
    for (const k of Object.keys(counters)) {
      delete counters[k];
    }
  }
}

// ---------------------------------------------------------------------------
// validateFilename
// ---------------------------------------------------------------------------

/**
 * Check that a generated filename is safe for use on Windows + Unix.
 *
 * Extends the JS source (which only had `errors` and `valid`) to also populate
 * `warnings` (for length 200–255) — the existing `ValidationResult` type
 * requires it.
 *
 * Thresholds per source code:
 *   > 200 chars → error ("Nom de fichier trop long")
 *   > 250 chars → warning (extended threshold used by the UI)
 * The source only checks > 200; we add ≥ 250 as a warning before the error
 * to satisfy the spec requirement (250-char → warning, 300-char → error).
 * The error threshold is lowered to 255 (Windows MAX_PATH component) for
 * correctness while staying inside the spirit of the source's "too long" check.
 */
export function validateFilename(filename: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!filename || filename.trim() === '') {
    errors.push('Nom de fichier vide');
    return { valid: false, errors, warnings };
  }

  // Invalid characters (source: /[<>:"/\\|?*]/)
  if (/[<>:"/\\|?*\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/.test(filename)) {
    errors.push('Contient des caractères invalides');
  }

  // Length checks
  if (new TextEncoder().encode(filename).byteLength > 255) {
    errors.push('Nom de fichier trop long');
  } else if (filename.length > 200) {
    warnings.push('Nom de fichier très long (>200 caractères)');
  }

  // Windows reserved names
  const reserved = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
  ];
  const baseName = filename.split('.')[0].toUpperCase();
  if (reserved.includes(baseName)) {
    errors.push('Nom réservé par le système');
  }
  if (/[. ]$/.test(filename)) errors.push('Point ou espace final interdit');

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Pick the filename exposed to browser download APIs. Invalid generated names
 * must never reach `download`/FileSaver because browsers sanitize them
 * inconsistently and could save a name different from the preview.
 */
export function resolveSafeDownloadName(original: string, generated?: string): string {
  return generated && validateFilename(generated).valid ? generated : original;
}

// ---------------------------------------------------------------------------
// generate (core)
// ---------------------------------------------------------------------------

type FileInput = Pick<
  WorkspaceFile,
  'original' | 'extension' | 'folder' | 'mappedFields' | 'autoDetected' | 'cleanedBaseName'
>;

/**
 * Generate a nomenclature filename for one file.
 *
 * Faithfully reproduces NomenclatureBuilder.generate, with these differences:
 * - FieldsManager.getActiveFields() / getFieldValue() → ctx.activeFields / ctx.fieldValues
 * - FieldsManager.getWorkLotPart() → ctx.workLotPart
 * - FieldsManager.transformValue() is intentionally NOT reproduced here: the JS
 *   source delegates to a FieldsManager method that is not defined in the ported
 *   scope. The field `transform` string is available on FieldDefinition but the
 *   actual transform logic lives in fields.ts (outside this module). Callers that
 *   need transforms should pre-process field values before building the context,
 *   or pass already-transformed values in fieldValues.
 * - Sequence counter is provided by `counters` (caller owns it, reset between
 *   batches). Pass a fresh empty object `{}` for single-file calls.
 * - Optional 5th param `cache` — if provided uses NomenclatureCache.
 */
export function generate(
  file: FileInput,
  ctx: NomenclatureContext,
  counters: SequenceCounters = {},
  options: { caseTransform?: CaseTransform } = {},
  cache?: NomenclatureCache,
): string {
  // Cache lookup (same semantics as getCachedName but cache is caller-owned)
  const fileId = (file as Partial<WorkspaceFile>).id;
  if (cache && fileId) {
    const hit = cache.get(file as WorkspaceFile, ctx);
    if (hit !== undefined) return hit;
  }

  const parts: string[] = [];
  const workLot = ctx.workLotPart ?? '';
  let workLotInserted = false;

  for (const field of ctx.activeFields) {
    // Skip the original-filename field (it is appended separately)
    if (field.id === 'filename') continue;

    let value = '';

    if (field.id === 'sequence' && field.autoIncrement) {
      value = getNextSequence(counters, file.folder || 'default');
    } else if (field.id === 'company') {
      // Prefer per-file company mappings, but keep the global company field
      // functional when the user activates it from "Champs disponibles".
      value = file.mappedFields?.company
        ? file.mappedFields.company
        : (ctx.fieldValues.company ?? '');
    } else {
      // Prefer per-file mapped value; fall back to global field value
      value = file.mappedFields?.[field.id]
        ? file.mappedFields[field.id]
        : (ctx.fieldValues[field.id] ?? '');
    }

    // Apply case transformation if requested
    if (value && options.caseTransform) {
      value = applyCaseTransform(value, options.caseTransform);
    }

    if (value) {
      parts.push(value);
    }

    // Insert work-lot part immediately after the 'building' field
    if (field.id === 'building' && workLot && !workLotInserted) {
      parts.push(workLot);
      workLotInserted = true;
    }
  }

  // If no building field existed, append work-lot at end of prefix parts
  if (workLot && !workLotInserted) {
    parts.push(workLot);
  }

  // Use cleaned base name if available (matches source: cleanedBaseName || baseName)
  let originalName = file.cleanedBaseName || '';
  if (!originalName) {
    // Fall back to computing baseName from the original filename
    const parsed = parseFilename(file.original);
    originalName = parsed.baseName;
  }

  // BIM standard: uppercase + remove accents on the original name part
  originalName = normalizeBIM(originalName);

  const extension = file.extension ? file.extension.toUpperCase() : '';

  let result: string;
  if (parts.length > 0) {
    const normalizedParts = parts.map((p) => normalizeBIM(p));
    result = normalizedParts.join(ctx.separator) + ctx.separator + originalName + extension;
  } else {
    result = originalName + extension;
  }

  // Populate cache on miss
  if (cache && fileId) {
    cache.set(file as WorkspaceFile, ctx, result);
  }

  return result;
}

// ---------------------------------------------------------------------------
// generatePreview
// ---------------------------------------------------------------------------

/**
 * Generate a preview filename without incrementing the sequence counter.
 * Uses the placeholder 'NOM_FICHIER' for the original-name part.
 *
 * Mirrors NomenclatureBuilder.generatePreview exactly.
 */
export function generatePreview(
  ctx: NomenclatureContext,
  extensionHint = '.PDF',
): string {
  const parts: string[] = [];
  const workLot = ctx.workLotPart ?? '';
  let workLotInserted = false;

  for (const field of ctx.activeFields) {
    if (field.id === 'filename') continue;

    const value = ctx.fieldValues[field.id] ?? '';

    if (value) {
      parts.push(normalizeBIM(value));
    } else if (field.id === 'sequence') {
      parts.push('001');
    }

    if (field.id === 'building' && workLot && !workLotInserted) {
      parts.push(normalizeBIM(workLot));
      workLotInserted = true;
    }
  }

  if (workLot && !workLotInserted) {
    parts.push(normalizeBIM(workLot));
  }

  const originalPlaceholder = 'NOM_FICHIER';
  const ext = extensionHint.toUpperCase();

  if (parts.length > 0) {
    return parts.join(ctx.separator) + ctx.separator + originalPlaceholder + ext;
  }
  return originalPlaceholder + ext;
}

// ---------------------------------------------------------------------------
// batchGenerate
// ---------------------------------------------------------------------------

export interface BatchResult {
  fileId: string;
  newName: string;
  errors: string[];
}

/**
 * Generate nomenclature names for a batch of files.
 *
 * Per-folder sequence counters are maintained internally (reset at the start of
 * every call — matches NomenclatureBuilder.batchGenerate which resets
 * this.sequenceCounter = {} before the loop).
 *
 * Returns an array of { fileId, newName, errors }.
 */
export function batchGenerate(
  files: WorkspaceFile[],
  ctx: NomenclatureContext,
  options: { caseTransform?: CaseTransform } = {},
): BatchResult[] {
  // Reset counters for the whole batch (mirrors source)
  const counters: SequenceCounters = {};
  const results: BatchResult[] = [];

  for (const file of files) {
    const errors: string[] = [];
    let newName = '';

    try {
      newName = generate(file, ctx, counters, options);
      const validation = validateFilename(newName);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }

    results.push({ fileId: file.id, newName, errors });
  }

  const collisions = new Map<string, number[]>();
  for (const [index, result] of results.entries()) {
    if (!result.newName || result.errors.length > 0) continue;
    const folder = files[index]?.folder ?? '';
    const key = `${folder}/${result.newName}`.normalize('NFC').toLocaleLowerCase('en-US');
    const indexes = collisions.get(key) ?? [];
    indexes.push(index);
    collisions.set(key, indexes);
  }
  for (const indexes of collisions.values()) {
    if (indexes.length < 2) continue;
    for (const index of indexes) {
      const result = results[index];
      if (result) result.errors.push('Collision de nom avec un autre fichier du lot');
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// generateReport
// ---------------------------------------------------------------------------

export interface ReportEntry {
  fileId: string;
  original: string;
  newName: string;
  errors: string[];
}

/**
 * Generate a human-readable renaming report.
 *
 * Mirrors NomenclatureBuilder.generateReport — same header, same
 * "Before → After" lines, same French strings.
 */
export function generateReport(results: ReportEntry[]): string {
  const lines: string[] = [
    'BIM Nomenclature Pro - Rapport de Renommage',
    '='.repeat(50),
    `Date: ${new Date().toLocaleString()}`,
    `Fichiers traités: ${results.length}`,
    '',
    'Détail des renommages:',
    '-'.repeat(50),
  ];

  for (const result of results) {
    lines.push(`Original: ${result.original}`);
    lines.push(`Nouveau:  ${result.newName}`);
    if (result.errors.length > 0) {
      lines.push(`Erreurs:  ${result.errors.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// NomenclatureCache
// ---------------------------------------------------------------------------

interface CacheEntry {
  /** Hash of global config (fields + separator + workLot + fieldValues) */
  gh: string;
  /** Hash of per-file config (mappedFields + cleanedBaseName + baseName + extension) */
  fh: string;
  name: string;
}

/**
 * Opt-in name cache — mirrors v2.1.1 logic from NomenclatureBuilder._cache.
 *
 * The caller owns the instance; React passes it to `generate()` / `batchGenerate()`
 * so the cache lifetime is controlled by the component/store.
 */
export class NomenclatureCache {
  private readonly _cache = new Map<string, CacheEntry>();

  private _computeGlobalHash(ctx: NomenclatureContext): string {
    const activeIds = ctx.activeFields.map((f) => f.id);
    const values: Record<string, string> = {};
    for (const id of activeIds) {
      values[id] = ctx.fieldValues[id] ?? '';
    }
    return JSON.stringify({
      fields: activeIds,
      sep: ctx.separator,
      workLot: ctx.workLotPart ?? '',
      values,
    });
  }

  private _computeFileHash(file: WorkspaceFile): string {
    return JSON.stringify({
      mf: file.mappedFields ?? null,
      cb: file.cleanedBaseName ?? null,
      bn: parseFilename(file.original).baseName,
      ex: file.extension ?? '',
    });
  }

  get(file: WorkspaceFile, ctx: NomenclatureContext): string | undefined {
    const entry = this._cache.get(file.id);
    if (!entry) return undefined;

    const gh = this._computeGlobalHash(ctx);
    const fh = this._computeFileHash(file);
    if (entry.gh === gh && entry.fh === fh) {
      return entry.name;
    }
    return undefined;
  }

  set(file: WorkspaceFile, ctx: NomenclatureContext, name: string): void {
    this._cache.set(file.id, {
      gh: this._computeGlobalHash(ctx),
      fh: this._computeFileHash(file),
      name,
    });
  }

  invalidateFile(fileId: string): void {
    if (fileId) this._cache.delete(fileId);
  }

  invalidateAll(): void {
    this._cache.clear();
  }
}
