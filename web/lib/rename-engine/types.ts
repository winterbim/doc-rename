/**
 * Shared types for the rename engine (pure logic, no React / DOM).
 *
 * Domain-agnostic: used by every industry profile (BIM, finance, legal, HR…).
 * BIM-specific catalogues (lots, companies, ISO fields) live under `config/`.
 */

// ---------------------------------------------------------------------------
// Work lots (Lots de Travail)
// category extended to cover all values in CONFIG.WORK_LOTS
// ---------------------------------------------------------------------------
export type WorkLotCategory =
  | 'structure'
  | 'envelope'
  | 'mep'
  | 'elec'
  | 'security'
  | 'equipment'
  | 'interior'
  | 'exterior'
  | 'coord'
  | string; // open — forward-compat

export interface WorkLot {
  code: string;
  name: string;
  category: WorkLotCategory;
  tooltip?: string;
}

// ---------------------------------------------------------------------------
// Construction companies
// ---------------------------------------------------------------------------
export interface Company {
  code: string;
  name: string;
  lots: string[];
}

// ---------------------------------------------------------------------------
// Document types
// ---------------------------------------------------------------------------
export interface DocumentType {
  code: string;
  name: string;
  /** Optional tooltip — present in contracts, doe, bim-coord groups */
  tooltip?: string;
}

export interface DocumentTypeGroup {
  label: string;
  items: DocumentType[];
}

// ---------------------------------------------------------------------------
// Disciplines (from CONFIG.DISCIPLINES — lightweight code/name pairs)
// ---------------------------------------------------------------------------
export interface Discipline {
  code: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Naming convention templates (from CONFIG.DEFAULT_TEMPLATES)
// ---------------------------------------------------------------------------
export interface ConventionTemplate {
  name: string;
  description: string;
  fields: string[];
  separator: string;
  example: string;
}

// ---------------------------------------------------------------------------
// Nomenclature fields
// Derived from fields.js fieldDefinitions keys + 'filename'
// ---------------------------------------------------------------------------
export type FieldInputType = 'text' | 'select' | 'number' | 'date';

export type FieldType =
  | 'project'
  | 'building'
  | 'workLot'
  | 'discipline'
  | 'docType'
  | 'document'  // alias used in fields.js for docType
  | 'sequence'
  | 'revision'
  | 'date'
  | 'phase'
  | 'zone'
  | 'level'
  | 'originator'
  | 'company'
  | 'status'
  | 'custom1'
  | 'custom2'
  | 'filename'
  | 'custom';   // catch-all for inline option arrays

export interface FieldDefinition {
  id: string;
  code: string;
  name: string;
  type: FieldType;
  inputType?: FieldInputType;
  required?: boolean;
  maxLength?: number;
  validation?: RegExp;
  /** Transform hint from source, e.g. 'upper', 'padStart:3' */
  transform?: string;
  caseTransform?: 'upper' | 'lower' | 'title' | 'none';
  padding?: { char: string; length: number; side: 'left' | 'right' };
  /** Named option set key or inline option array */
  options?: 'companies' | 'workLots' | 'documentTypes' | 'disciplines' | string | Array<{ code: string; name: string }>;
  searchable?: boolean;
  placeholder?: string;
  description?: string;
  default?: string;
  autoIncrement?: boolean;
  format?: string;
}

// ---------------------------------------------------------------------------
// File processing
// ---------------------------------------------------------------------------
export type FileCategory = 'documents' | 'cad' | 'bim' | 'images' | 'archives' | 'other';

export interface WorkspaceFile {
  id: string;
  original: string;
  newName?: string;
  extension: string;
  blob: Blob;
  folder: string;
  size: number;
  status: 'ready' | 'renamed' | 'error';
  addedAt: Date;
  category: FileCategory;
  detectedType?: string | null;
  mappedFields: Record<string, string>;
  autoDetected: Partial<Record<string, string>>;
  cleanedBaseName?: string | null;
}

// ---------------------------------------------------------------------------
// Nomenclature engine
// ---------------------------------------------------------------------------
export interface NomenclatureOptions {
  separator?: string;
  forcedSequence?: number;
  preview?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Filename cleaner
// ---------------------------------------------------------------------------
export interface CleanOptions {
  applySpelling?: boolean;
  removeWords?: boolean;
  applyRules?: boolean;
  applyCleanup?: boolean;
  normalizeAccents?: boolean;
}

export interface CleanChange {
  type: 'spelling' | 'remove' | 'rule' | 'cleanup' | 'accent';
  original?: string;
  replacement?: string;
  description: string;
}

export interface CleanResult {
  cleaned: string;
  changes: CleanChange[];
  hasChanges: boolean;
}

export interface ReplacementRule {
  id: string;
  find: string;
  replace: string;
  isRegex: boolean;
  caseSensitive: boolean;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Prefixes
// ---------------------------------------------------------------------------
export interface DetectedPrefix {
  prefix: string;
  count: number;
  /** Original filenames (up to 50) that share this prefix */
  fileIds: string[];
}

export type PrefixAction = 'remove' | 'replace' | 'map';

/** 'map' params use an array of { field, value } pairs (from the JS source) */
export interface PrefixMapEntry {
  field: string;
  value: string;
}

export interface PrefixRule {
  prefix: string;
  action: PrefixAction;
  params?: {
    newPrefix?: string;
    /** For 'map' action: field assignments extracted from the prefix tokens */
    map?: PrefixMapEntry[];
    /** Legacy: key-value record form — kept for compat if callers use it */
    mappings?: Record<string, string>;
  };
}

// ---------------------------------------------------------------------------
// Settings / defaults
// ---------------------------------------------------------------------------
export interface AppDefaultSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fr' | 'en' | 'de' | 'it';
  defaultCase: 'upper' | 'lower' | 'preserve';
  /** 'replace' is from the JS source (specialChars setting) */
  specialChars?: 'replace' | 'remove' | 'keep';
  defaultSeparator: string;
  preserveFolders: boolean;
  generateReport: boolean;
  normalizeAccents?: boolean;
  keepOriginal?: boolean;
  maxHistoryItems?: number;
}
