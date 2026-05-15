/**
 * BIM Default Settings & Storage Keys
 * Ported 1:1 from extension/js/config.js — CONFIG.DEFAULT_SETTINGS, CONFIG.STORAGE_KEYS,
 * CONFIG.STORAGE_PREFIX, CONFIG.DEFAULT_TEMPLATES, CONFIG.APP_NAME, CONFIG.VERSION
 */

import type { BimDefaultSettings, BimTemplate } from '../types';

export const APP_NAME = 'DOC-RENAME';
export const VERSION = '2.1.0';

export const STORAGE_PREFIX = 'bimcheck_rename_';

export const STORAGE_KEYS: Record<string, string> = {
  TEMPLATES: 'templates',
  SETTINGS: 'settings',
  HISTORY: 'history',
  LAST_CONFIG: 'last_config',
  LANGUAGE: 'language',
  // Persistence keys (port of extension localStorage keys)
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

export const DEFAULT_SETTINGS: BimDefaultSettings = {
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

export const DEFAULT_TEMPLATES: Record<string, BimTemplate> = {
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
