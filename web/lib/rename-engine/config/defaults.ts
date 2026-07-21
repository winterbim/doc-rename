/**
 * Default settings & storage keys for BIMCHECK-Rename.
 *
 * Storage key names keep the historical `bimcheck_rename_*` prefix so existing
 * browser localStorage survives upgrades. Do not rename keys without a schema
 * migration in `lib/persistence.ts`.
 */

import type { AppDefaultSettings, ConventionTemplate } from '../types';

export const APP_NAME = 'BIMCHECK-Rename';
export const VERSION = '0.3.0';

export const STORAGE_PREFIX = 'bimcheck_rename_';

export const STORAGE_KEYS: Record<string, string> = {
  TEMPLATES: 'templates',
  SETTINGS: 'settings',
  HISTORY: 'history',
  LAST_CONFIG: 'last_config',
  LANGUAGE: 'language',
  // Persistence keys — stable; changing them breaks existing sessions
  FIELDS_ACTIVE: 'bimcheck_rename_fields',
  FIELDS_VALUES: 'bimcheck_rename_field_values',
  NOMENCLATURE_SETTINGS: 'bimcheck_rename_settings',
  FILENAME_CLEANER: 'bimcheck_rename_filename_cleaner',
  SCHEMA_VERSION: 'bimcheck_rename_schema_version',
  PREFIX_RULES: 'bimcheck_rename_prefix_rules',
  PROFILE_ID: 'bimcheck_rename_profile_id',
  PROFILE_ENTITIES: 'bimcheck_rename_profile_entities',
  THEME: 'bim_theme',
};

export const DEFAULT_SETTINGS: AppDefaultSettings = {
  theme: 'light',
  language: 'fr',
  defaultCase: 'upper',
  specialChars: 'replace',
  defaultSeparator: '_',
  preserveFolders: true,
  generateReport: false,
  keepOriginal: false,
  maxHistoryItems: 50,
};

export const DEFAULT_TEMPLATES: Record<string, ConventionTemplate> = {
  'swiss-bim': {
    name: 'Norme BIM Suisse SIA',
    description: 'Convention selon SIA 2051',
    fields: ['project', 'building', 'discipline', 'docType', 'sequence', 'revision'],
    separator: '_',
    example: 'PRJ_BAT_ARC_PLA_001_A',
  },
  'french-bim': {
    name: 'Convention BIM France',
    description: 'Selon guide PTNB',
    fields: ['project', 'building', 'phase', 'discipline', 'docType', 'sequence'],
    separator: '-',
    example: 'PRJ-BAT-EXE-ARC-PLA-001',
  },
  iso19650: {
    name: 'ISO 19650',
    description: 'Standard international',
    fields: ['project', 'originator', 'discipline', 'zone', 'docType', 'sequence', 'revision'],
    separator: '-',
    example: 'PRJ-ORG-ARC-ZN01-PLA-001-P01',
  },
};
