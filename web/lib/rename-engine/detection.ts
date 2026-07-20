/**
 * BIM Detection Helpers
 * Ported 1:1 from extension/js/files.js (FilesManager detection methods)
 *
 * Extracted pure functions:
 *   - detectCategory        — extension → FileCategory
 *   - detectDocumentType    — filename → { code, label, confidence } | null
 *   - detectDocTypeCode     — filename → canonical document-type code | null
 *   - detectCompanyInName   — filename → { company, cleanedBaseName }
 *   - detectLotFromPath     — folder + filename → work-lot code | null
 *
 * All functions are stateless; they depend only on their arguments plus the
 * config constants (WORK_LOTS, COMPANIES, DOCUMENT_TYPES) imported from
 * the config barrel.
 */

import type { FileCategory } from './types';
import { FILE_CATEGORIES, DETECTION_PATTERNS } from './config/detectionPatterns';
import { WORK_LOTS } from './config/workLots';
import { COMPANIES } from './config/companies';
import { DOCUMENT_TYPES } from './config/documentTypes';

// ---------------------------------------------------------------------------
// detectCategory
// ---------------------------------------------------------------------------

/**
 * Categorize a file extension.
 *
 * Mirrors `FilesManager.detectCategory`.
 * `extension` should include the leading dot, e.g. `'.pdf'`.
 * Returns `'other'` for unrecognised extensions.
 */
export function detectCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase();
  for (const [catKey, catData] of Object.entries(FILE_CATEGORIES)) {
    if ((catData.extensions as readonly string[]).includes(ext)) {
      return catKey as FileCategory;
    }
  }
  return 'other';
}

// ---------------------------------------------------------------------------
// detectDocumentType — fuzzy / pattern-based
// ---------------------------------------------------------------------------

export interface DetectedDocumentType {
  code: string;
  label: string;
  confidence: 'high' | 'medium';
}

/**
 * Fuzzy-match a filename against known document-type patterns.
 *
 * Mirrors `FilesManager.detectDocumentType`.
 * Separators (`_`, `-`, `.`) are normalised to spaces before matching.
 * Returns `null` when no pattern matches.
 */
export function detectDocumentType(filename: string): DetectedDocumentType | null {
  // Normalise: lowercase + replace separators with space
  const nameLower = filename.toLowerCase().replace(/[_\-.]/g, ' ');

  for (const [typeCode, typeData] of Object.entries(DETECTION_PATTERNS)) {
    for (const pattern of typeData.patterns) {
      if (nameLower.includes(pattern.toLowerCase())) {
        return {
          code: typeCode,
          label: typeData.label,
          confidence: pattern.length > 5 ? 'high' : 'medium',
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// detectDocTypeCode — token-based match against CONFIG.DOCUMENT_TYPES
// ---------------------------------------------------------------------------

/**
 * Detect the canonical document-type code by tokenising the filename and
 * matching against all codes in `DOCUMENT_TYPES`.
 *
 * Mirrors `FilesManager.detectDocTypeCode`.
 * Prefers longest codes (e.g. 'RAP-MPR' before 'RAP').
 * Returns the first (longest) match or `null`.
 */
export function detectDocTypeCode(filename: string): string | null {
  const up = filename.toUpperCase();
  const tokens = up.split(/[^A-Z0-9]+/).filter(Boolean);

  // Collect all codes from all document-type groups
  const allCodes: string[] = [];
  for (const group of Object.values(DOCUMENT_TYPES)) {
    for (const item of group.items ?? []) {
      if (item?.code) allCodes.push(item.code);
    }
  }

  // Longest first — faithful to JS source comment
  allCodes.sort((a, b) => b.length - a.length);

  for (const code of allCodes) {
    const normCode = code.toUpperCase().replace(/[^A-Z0-9]+/g, '');
    for (const t of tokens) {
      if (t === normCode) return code;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// detectCompanyInName
// ---------------------------------------------------------------------------

export interface CompanyDetectionResult {
  company: string | null;
  cleanedBaseName: string | null;
}

/**
 * Detect a known company code or name embedded in a filename and return
 * the company code plus the cleaned base name (company token removed).
 *
 * Mirrors `FilesManager.detectCompanyInName` exactly:
 *   - Normalises strings (NFD → strip diacritics → UPPER → collapse non-alnum to '_')
 *   - Tries longest codes/names first
 *   - Requires a token of at least 3 chars
 *   - Returns `{ company: null, cleanedBaseName: null }` when nothing matches
 */
export function detectCompanyInName(originalName: string): CompanyDetectionResult {
  const lastDot = originalName.lastIndexOf('.');
  const base = lastDot > 0 ? originalName.substring(0, lastDot) : originalName;

  /** Normalise helper: NFD → strip combining chars → UPPER → collapse non-alnum to '_' → trim '_' */
  const norm = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  const normBase = '_' + norm(base) + '_';

  // Build candidates (code and name) and sort longest first for best match
  const candidates: Array<{ key: string; code: string }> = [];
  for (const c of COMPANIES) {
    candidates.push({ key: norm(c.code), code: c.code });
    if (c.name) candidates.push({ key: norm(c.name), code: c.code });
  }
  candidates.sort((a, b) => b.key.length - a.key.length);

  for (const cand of candidates) {
    if (!cand.key || cand.key.length < 3) continue;
    const token = '_' + cand.key + '_';
    if (normBase.includes(token)) {
      // Remove matched token from base (case-insensitive, separator-aware)
      const rx = new RegExp(
        '[_\\-\\s]*' + cand.key.replace(/_/g, '[_\\-\\s]+') + '[_\\-\\s]*',
        'i',
      );
      const cleaned = norm(base)
        .replace(rx, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      return { company: cand.code, cleanedBaseName: cleaned };
    }
  }
  return { company: null, cleanedBaseName: null };
}

// ---------------------------------------------------------------------------
// detectLotFromPath
// ---------------------------------------------------------------------------

/**
 * Detect a work-lot code from a folder path and/or filename tokens.
 *
 * Mirrors `FilesManager.detectLotFromPath`:
 *   - Concatenates folder + '/' + filename, uppercases
 *   - Splits on non-alnum boundaries
 *   - Returns the first token that matches a known WORK_LOTS code
 */
export function detectLotFromPath(folder: string, filename: string): string | null {
  const haystack = ((folder ?? '') + '/' + (filename ?? '')).toUpperCase();
  const tokens = haystack.split(/[^A-Z0-9]+/).filter(Boolean);
  const lotCodes = new Set(WORK_LOTS.map((l) => l.code));

  for (const t of tokens) {
    if (lotCodes.has(t)) return t;
  }
  return null;
}
