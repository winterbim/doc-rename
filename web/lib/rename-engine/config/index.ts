/**
 * BIM config barrel
 * Re-exports all config modules and provides a convenience `config` aggregate
 * matching the shape of the extension's `window.CONFIG`.
 */

export * from './workLots';
export * from './companies';
export * from './documentTypes';
export * from './extensions';
export * from './defaults';

import { WORK_LOTS } from './workLots';
import { COMPANIES } from './companies';
import { DOCUMENT_TYPES, DISCIPLINES } from './documentTypes';
import { SUPPORTED_EXTENSIONS } from './extensions';
import {
  APP_NAME,
  VERSION,
  STORAGE_PREFIX,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_TEMPLATES,
} from './defaults';

/** Convenience aggregate matching the extension's window.CONFIG shape */
export const config = {
  APP_NAME,
  VERSION,
  STORAGE_PREFIX,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_TEMPLATES,
  WORK_LOTS,
  COMPANIES,
  SUPPORTED_EXTENSIONS,
  DOCUMENT_TYPES,
  DISCIPLINES,
} as const;
