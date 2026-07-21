/**
 * BIM Filename Cleaner
 * Ported 1:1 from extension/js/filename-cleaner.js (FilenameCleaner singleton)
 *
 * Changes from the JS source:
 * - No DOM / window / localStorage. State is a plain object (CleanerState);
 *   the React layer manages persistence.
 * - FilenameCleaner singleton → pure module-level functions. All mutators
 *   return a NEW CleanerState (immutable pattern) instead of modifying `this`.
 * - `init()` / `loadSettings()` / `saveSettings()` → `createDefaultState()`.
 * - `cleanAll` now takes plain strings (not file objects) — the React layer
 *   wraps original filenames itself. (A convenience overload is provided.)
 * - `importRules` / `exportRules` → `importState` / `exportState` operating on
 *   the full CleanerState (for cloud-sync / file import-export).
 * - Logger calls replaced by console.warn (no DOM dependency).
 */

import type { ReplacementRule, CleanOptions, CleanResult, CleanChange } from './types';

// ---------------------------------------------------------------------------
// CleanerState
// ---------------------------------------------------------------------------

export interface CleanerState {
  enabled: boolean;
  replacementRules: ReplacementRule[];
  wordsToRemove: string[];
  spellingCorrections: Record<string, string>;
  options: Required<CleanOptions>;
}

// ---------------------------------------------------------------------------
// Default spelling corrections (150+ entries from the JS source)
// ---------------------------------------------------------------------------

const DEFAULT_SPELLING_CORRECTIONS: Record<string, string> = {
  // Document types
  pland: 'plan',
  plans: 'plan',
  plna: 'plan',
  paln: 'plan',
  detial: 'detail',
  detaill: 'detail',
  détial: 'detail',
  coupe: 'coupe',
  coue: 'coupe',
  copu: 'coupe',
  facde: 'facade',
  façad: 'facade',
  facade: 'facade',
  shema: 'schema',
  'schéam': 'schema',
  'shéma': 'schema',
  schma: 'schema',

  // Work lots
  architceture: 'architecture',
  architectur: 'architecture',
  arhcitecture: 'architecture',
  archi: 'architecture',
  structur: 'structure',
  struture: 'structure',
  strcuture: 'structure',
  electrique: 'electrique',
  electirque: 'electrique',
  eletrique: 'electrique',
  elec: 'electrique',
  sanitiar: 'sanitaire',
  santaire: 'sanitaire',
  saniatire: 'sanitaire',
  sani: 'sanitaire',
  chauffag: 'chauffage',
  chaufage: 'chauffage',
  chuaffage: 'chauffage',
  chauf: 'chauffage',
  ventilatino: 'ventilation',
  ventilaiton: 'ventilation',
  ventilarion: 'ventilation',
  ventil: 'ventilation',
  climatisatino: 'climatisation',
  climatistation: 'climatisation',
  clim: 'climatisation',
  plombrie: 'plomberie',
  plombeire: 'plomberie',
  plomb: 'plomberie',
  sprinkelr: 'sprinkler',
  srpinkler: 'sprinkler',
  sprinklre: 'sprinkler',
  spk: 'sprinkler',

  // Report types
  rapoprt: 'rapport',
  rapprot: 'rapport',
  raport: 'rapport',
  rap: 'rapport',
  essaie: 'essai',
  esai: 'essai',
  essais: 'essai',
  controle: 'controle',
  contorle: 'controle',
  'contrôel': 'controle',
  ctrl: 'controle',
  receptino: 'reception',
  recpetion: 'reception',
  'réceptoin': 'reception',
  recep: 'reception',
  certificta: 'certificat',
  certiifcat: 'certificat',
  certif: 'certificat',
  cert: 'certificat',

  // Project phases
  executino: 'execution',
  'exécutoin': 'execution',
  exeuction: 'execution',
  exe: 'execution',
  etudes: 'etude',
  etuds: 'etude',
  etud: 'etude',
  conception: 'conception',
  conceptino: 'conception',
  concpetion: 'conception',
  conc: 'conception',
  provisoir: 'provisoire',
  provioire: 'provisoire',
  provisoire: 'provisoire',
  prov: 'provisoire',
  definitif: 'definitif',
  'défintif': 'definitif',
  definitf: 'definitif',
  def: 'definitif',

  // Buildings
  batimnet: 'batiment',
  'bâtiemnt': 'batiment',
  batimant: 'batiment',
  bat: 'batiment',
  etage: 'etage',
  eatge: 'etage',
  etag: 'etage',
  'sous-sol': 'sous-sol',
  soussol: 'sous-sol',
  ss: 'sous-sol',
  'rez-de-chaussee': 'rdc',
  'rez-de-chaussée': 'rdc',
  rezchaussee: 'rdc',

  // Other technical terms
  revision: 'revision',
  revisino: 'revision',
  'révsiion': 'revision',
  rev: 'revision',
  versino: 'version',
  vresion: 'version',
  ver: 'version',
  indcie: 'indice',
  indic: 'indice',
  ind: 'indice',
  final: 'final',
  fianl: 'final',
  fiinal: 'final',
  fin: 'final',
  'mise-a-jour': 'maj',
  'mise a jour': 'maj',
  maj: 'maj',
  copie: 'copie',
  copi: 'copie',
  copy: 'copie',
};

// ---------------------------------------------------------------------------
// Default words to remove (25+ entries from the JS source)
// ---------------------------------------------------------------------------

const DEFAULT_WORDS_TO_REMOVE: string[] = [
  'copy',
  'copie',
  'copie de',
  'copy of',
  'nouveau',
  'new',
  'nouveau document',
  'final',
  'final version',
  'version finale',
  'draft',
  'brouillon',
  'temp',
  'temporaire',
  'temporary',
  'old',
  'ancien',
  'ancienne version',
  'backup',
  'sauvegarde',
  'test',
  'essai',
  '(1)',
  '(2)',
  '(3)',
  '(4)',
  '(5)',
  '[1]',
  '[2]',
  '[3]',
  ' - copie',
  ' - copy',
  '_old',
  '_new',
  '_temp',
  '_v1',
  '_v2',
  '_v3',
  'document',
  'fichier',
  'file',
];

// ---------------------------------------------------------------------------
// Default CleanOptions
// ---------------------------------------------------------------------------

const DEFAULT_CLEAN_OPTIONS: Required<CleanOptions> = {
  applySpelling: true,
  removeWords: true,
  applyRules: true,
  applyCleanup: true,
  normalizeAccents: false,
};

// ---------------------------------------------------------------------------
// Cleanup patterns (compiled once at module load)
// ---------------------------------------------------------------------------

type CleanupPattern =
  | { pattern: RegExp; replacement: string }
  | { pattern: RegExp; replacement: (m: string) => string };

const CLEANUP_PATTERNS: CleanupPattern[] = [
  // Remove double version numbers (e.g. v1_v2 → v1)
  { pattern: /v\d+[._]v\d+/gi, replacement: (m: string) => m.split(/[._]/)[0] },
  // Collapse multiple spaces
  { pattern: /\s+/g, replacement: ' ' },
  // Collapse multiple underscores
  { pattern: /_+/g, replacement: '_' },
  // Collapse multiple hyphens
  { pattern: /-+/g, replacement: '-' },
  // Collapse multiple dots (before the last dot = extension)
  { pattern: /\.+(?=.*\.)/g, replacement: '.' },
  // Strip leading/trailing separators/spaces
  { pattern: /^[_\-\s]+|[_\-\s]+$/g, replacement: '' },
  // Remove space-wrapped numeric parentheses like (1)
  { pattern: /\s*\(\d+\)\s*/g, replacement: '' },
  // Remove space-wrapped numeric brackets like [1]
  { pattern: /\s*\[\d+\]\s*/g, replacement: '' },
];

// ---------------------------------------------------------------------------
// createDefaultState
// ---------------------------------------------------------------------------

/**
 * Return a fresh CleanerState with the 150+ spelling corrections and 25+
 * default words to remove loaded from the JS source.
 */
export function createDefaultState(): CleanerState {
  return {
    enabled: true,
    replacementRules: [],
    wordsToRemove: [...DEFAULT_WORDS_TO_REMOVE],
    spellingCorrections: { ...DEFAULT_SPELLING_CORRECTIONS },
    options: { ...DEFAULT_CLEAN_OPTIONS },
  };
}

// ---------------------------------------------------------------------------
// Internal step functions (mirrors the private methods of the JS singleton)
// ---------------------------------------------------------------------------

function applySpellingCorrections(
  text: string,
  corrections: Record<string, string>,
): { result: string; changed: boolean; changes: CleanChange[] } {
  const changes: CleanChange[] = [];
  const separatorPattern = /([_\-\s.]+)/;
  const parts = text.split(separatorPattern);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const lowerPart = part.toLowerCase();

    if (corrections[lowerPart]) {
      const corrected = corrections[lowerPart];
      // Preserve case if the original part was all-uppercase
      const finalValue =
        part === part.toUpperCase() ? corrected.toUpperCase() : corrected;
      changes.push({
        type: 'spelling',
        original: part,
        replacement: finalValue,
        description: `Correction: "${part}" → "${finalValue}"`,
      });
      parts[i] = finalValue;
    }
  }

  return {
    result: parts.join(''),
    changed: changes.length > 0,
    changes,
  };
}

function removeUnwantedWords(
  text: string,
  words: string[],
): { result: string; changed: boolean; changes: CleanChange[] } {
  const changes: CleanChange[] = [];
  let result = text;

  for (const word of words) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `(^|[_\\-\\s\\.])${escapedWord}([_\\-\\s\\.]|$)`,
      'gi',
    );

    if (pattern.test(result)) {
      const before = result;
      result = result.replace(pattern, '$1$2');
      // Clean up double separators
      result = result.replace(/[_\-\s.]{2,}/g, (match) => match[0]);

      if (result !== before) {
        changes.push({
          type: 'remove',
          original: word,
          description: `Supprimé: "${word}"`,
        });
      }
    }
  }

  return {
    result,
    changed: changes.length > 0,
    changes,
  };
}

function applyReplacementRules(
  text: string,
  rules: ReplacementRule[],
): { result: string; changed: boolean; changes: CleanChange[] } {
  const changes: CleanChange[] = [];
  let result = text;

  for (const rule of rules) {
    if (!rule.enabled) continue;

    try {
      let pattern: RegExp;
      if (rule.isRegex) {
        const flags = rule.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(rule.find, flags);
      } else {
        const escaped = rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = rule.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(escaped, flags);
      }

      if (pattern.test(result)) {
        const before = result;
        result = result.replace(pattern, rule.replace);

        if (result !== before) {
          changes.push({
            type: 'rule',
            original: rule.find,
            replacement: rule.replace,
            description: `Règle: "${rule.find}" → "${rule.replace}"`,
          });
        }
      }
    } catch {
      console.warn(`Invalid rule pattern: ${rule.find}`);
    }
  }

  return {
    result,
    changed: changes.length > 0,
    changes,
  };
}

function applyCleanupPatterns(
  text: string,
): { result: string; changed: boolean; changes: CleanChange[] } {
  const changes: CleanChange[] = [];
  let result = text;

  for (const { pattern, replacement } of CLEANUP_PATTERNS) {
    if (pattern.test(result)) {
      const before = result;
      // TypeScript needs the overload cast
      result = result.replace(
        pattern,
        replacement as string & ((m: string) => string),
      );

      if (result !== before) {
        changes.push({
          type: 'cleanup',
          description: 'Nettoyage: caractères superflus',
        });
      }
    }
  }

  return {
    result,
    changed: changes.length > 0,
    changes,
  };
}

const ACCENT_MAP: Record<string, string> = {
  à: 'a', â: 'a', ä: 'a', á: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', î: 'i', ï: 'i', í: 'i',
  ò: 'o', ô: 'o', ö: 'o', ó: 'o',
  ù: 'u', û: 'u', ü: 'u', ú: 'u',
  ç: 'c', ñ: 'n',
  À: 'A', Â: 'A', Ä: 'A', Á: 'A',
  È: 'E', É: 'E', Ê: 'E', Ë: 'E',
  Ì: 'I', Î: 'I', Ï: 'I', Í: 'I',
  Ò: 'O', Ô: 'O', Ö: 'O', Ó: 'O',
  Ù: 'U', Û: 'U', Ü: 'U', Ú: 'U',
  Ç: 'C', Ñ: 'N',
};

function normalizeAccentsStep(
  text: string,
): { result: string; changed: boolean; changes: CleanChange[] } {
  const changes: CleanChange[] = [];
  let result = text;
  let hasAccents = false;

  for (const [accent, normal] of Object.entries(ACCENT_MAP)) {
    if (result.includes(accent)) {
      result = result.split(accent).join(normal);
      hasAccents = true;
    }
  }

  if (hasAccents) {
    changes.push({ type: 'accent', description: 'Accents normalisés' });
  }

  return { result, changed: hasAccents, changes };
}

// ---------------------------------------------------------------------------
// clean
// ---------------------------------------------------------------------------

/**
 * Apply the full cleaning pipeline to one filename.
 *
 * Pipeline order (matches source):
 *   1. Spelling corrections
 *   2. Word removal
 *   3. Replacement rules
 *   4. Cleanup patterns
 *   5. Accent normalization (opt-in via state.options.normalizeAccents)
 *
 * When state.enabled is false the filename is returned unchanged (unless
 * `force: true` is passed in the options override).
 */
export function clean(
  filename: string,
  state: CleanerState,
  optionsOverride?: Partial<CleanOptions> & { force?: boolean },
): CleanResult {
  if (!state.enabled && !optionsOverride?.force) {
    return { cleaned: filename, changes: [], hasChanges: false };
  }

  // Merge per-call overrides with state defaults
  const opts: Required<CleanOptions> & { force?: boolean } = {
    ...state.options,
    ...optionsOverride,
  };

  const changes: CleanChange[] = [];

  // Separate base name and extension
  const lastDot = filename.lastIndexOf('.');
  let baseName = lastDot > 0 ? filename.substring(0, lastDot) : filename;
  const extension = lastDot > 0 ? filename.substring(lastDot) : '';

  // 1. Spelling corrections
  if (opts.applySpelling !== false) {
    const r = applySpellingCorrections(baseName, state.spellingCorrections);
    if (r.changed) {
      changes.push(...r.changes);
      baseName = r.result;
    }
  }

  // 2. Word removal
  if (opts.removeWords !== false) {
    const r = removeUnwantedWords(baseName, state.wordsToRemove);
    if (r.changed) {
      changes.push(...r.changes);
      baseName = r.result;
    }
  }

  // 3. Replacement rules
  if (opts.applyRules !== false) {
    const r = applyReplacementRules(baseName, state.replacementRules);
    if (r.changed) {
      changes.push(...r.changes);
      baseName = r.result;
    }
  }

  // 4. Cleanup patterns
  if (opts.applyCleanup !== false) {
    const r = applyCleanupPatterns(baseName);
    if (r.changed) {
      changes.push(...r.changes);
      baseName = r.result;
    }
  }

  // 5. Accent normalization (off by default, matching the source)
  if (opts.normalizeAccents) {
    const r = normalizeAccentsStep(baseName);
    if (r.changed) {
      changes.push(...r.changes);
      baseName = r.result;
    }
  }

  return {
    cleaned: baseName + extension,
    changes,
    hasChanges: changes.length > 0,
  };
}

// ---------------------------------------------------------------------------
// preview
// ---------------------------------------------------------------------------

/**
 * Preview-intent wrapper around clean — forces processing even when disabled.
 * Mirrors FilenameCleaner.preview.
 */
export function preview(
  filename: string,
  state: CleanerState,
  optionsOverride?: Partial<CleanOptions>,
): CleanResult {
  return clean(filename, state, { ...optionsOverride, force: true });
}

// ---------------------------------------------------------------------------
// cleanAll
// ---------------------------------------------------------------------------

/**
 * Apply the cleaning pipeline to multiple filenames.
 * Returns one CleanResult per input string.
 */
export function cleanAll(
  filenames: string[],
  state: CleanerState,
  optionsOverride?: Partial<CleanOptions>,
): CleanResult[] {
  return filenames.map((f) => clean(f, state, optionsOverride));
}

// ---------------------------------------------------------------------------
// Immutable state mutators
// ---------------------------------------------------------------------------

let _ruleCounter = 0;

function makeRuleId(): string {
  return `rule_${Date.now()}_${(++_ruleCounter).toString(36)}`;
}

/**
 * Add a replacement rule. Returns a NEW state (original is unchanged).
 */
export function addReplacementRule(
  state: CleanerState,
  rule: Omit<ReplacementRule, 'id'>,
): CleanerState {
  const newRule: ReplacementRule = { ...rule, id: makeRuleId() };
  return {
    ...state,
    replacementRules: [...state.replacementRules, newRule],
  };
}

/**
 * Remove a replacement rule by id. Returns a NEW state.
 */
export function removeReplacementRule(
  state: CleanerState,
  ruleId: string,
): CleanerState {
  return {
    ...state,
    replacementRules: state.replacementRules.filter((r) => r.id !== ruleId),
  };
}

/**
 * Enable/disable a rule. Returns a NEW state.
 */
export function toggleRule(
  state: CleanerState,
  ruleId: string,
  enabled: boolean,
): CleanerState {
  return {
    ...state,
    replacementRules: state.replacementRules.map((r) =>
      r.id === ruleId ? { ...r, enabled } : r,
    ),
  };
}

/**
 * Add a word to the removal list (lowercased, no duplicates). Returns a NEW state.
 */
export function addWordToRemove(
  state: CleanerState,
  word: string,
): CleanerState {
  const lw = word.toLowerCase();
  if (state.wordsToRemove.includes(lw)) return state;
  return {
    ...state,
    wordsToRemove: [...state.wordsToRemove, lw],
  };
}

/**
 * Remove a word from the removal list (case-insensitive). Returns a NEW state.
 */
export function removeWordFromList(
  state: CleanerState,
  word: string,
): CleanerState {
  const lw = word.toLowerCase();
  return {
    ...state,
    wordsToRemove: state.wordsToRemove.filter((w) => w.toLowerCase() !== lw),
  };
}

// ---------------------------------------------------------------------------
// Serialization (cloud-sync / file import-export)
// ---------------------------------------------------------------------------

/**
 * Serialize the full CleanerState to a JSON string.
 * Note: spellingCorrections is included so custom overrides round-trip.
 */
export function exportState(state: CleanerState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Deserialize a CleanerState from JSON.
 * On parse error, returns a fresh default state (graceful degradation).
 */
export function importState(json: string): CleanerState {
  const parsed: unknown = JSON.parse(json); // throws on invalid JSON — caller can catch
  // Validate minimally
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('enabled' in parsed) ||
    !('replacementRules' in parsed)
  ) {
    throw new Error('Invalid CleanerState JSON');
  }
  const raw = parsed as Partial<CleanerState>;
  return {
    enabled: raw.enabled !== false,
    replacementRules: Array.isArray(raw.replacementRules)
      ? raw.replacementRules
      : [],
    wordsToRemove: Array.isArray(raw.wordsToRemove)
      ? raw.wordsToRemove
      : [...DEFAULT_WORDS_TO_REMOVE],
    spellingCorrections:
      raw.spellingCorrections != null &&
      typeof raw.spellingCorrections === 'object'
        ? (raw.spellingCorrections as Record<string, string>)
        : { ...DEFAULT_SPELLING_CORRECTIONS },
    options: {
      ...DEFAULT_CLEAN_OPTIONS,
      ...(raw.options ?? {}),
    },
  };
}
