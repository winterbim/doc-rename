import { describe, it, expect } from 'vitest';
import { WORK_LOTS, getWorkLot } from '../config/workLots';
import { COMPANIES, getCompany, getCompaniesForLot } from '../config/companies';
import {
  DOCUMENT_TYPES,
  getAllDocumentTypes,
  getDocumentType,
  DISCIPLINES,
} from '../config/documentTypes';
import { SUPPORTED_EXTENSIONS, getCategoryForExt } from '../config/extensions';
import {
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  STORAGE_PREFIX,
  DEFAULT_TEMPLATES,
  APP_NAME,
  VERSION,
} from '../config/defaults';
import { config } from '../config/index';

// ---------------------------------------------------------------------------
// Work Lots
// ---------------------------------------------------------------------------
describe('config: work lots', () => {
  it('has exactly 41 work lots', () => {
    expect(WORK_LOTS.length).toBe(41);
  });

  it('has at least 35 work lots', () => {
    expect(WORK_LOTS.length).toBeGreaterThanOrEqual(35);
  });

  it('every work lot has unique code', () => {
    const codes = WORK_LOTS.map(w => w.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every work lot has a non-empty name', () => {
    expect(WORK_LOTS.every(w => w.name && w.name.length > 0)).toBe(true);
  });

  it('every work lot has a non-empty category', () => {
    expect(WORK_LOTS.every(w => w.category && w.category.length > 0)).toBe(true);
  });

  it('includes the core lots: ARC, STR, CVC, ELE, SEC', () => {
    const codes = WORK_LOTS.map(w => w.code);
    for (const expected of ['ARC', 'STR', 'CVC', 'ELE', 'SEC']) {
      expect(codes).toContain(expected);
    }
  });

  it('includes coordination lots: SYN, GEO, BIM, PIC', () => {
    const codes = WORK_LOTS.map(w => w.code);
    for (const expected of ['SYN', 'GEO', 'BIM', 'PIC']) {
      expect(codes).toContain(expected);
    }
  });

  it('includes specialty MEP lots: GAZ, SGV', () => {
    const codes = WORK_LOTS.map(w => w.code);
    expect(codes).toContain('GAZ');
    expect(codes).toContain('SGV');
  });

  it('getWorkLot returns correct entry for ARC', () => {
    const lot = getWorkLot('ARC');
    expect(lot).toBeDefined();
    expect(lot!.name).toBe('Architecture');
    expect(lot!.category).toBe('structure');
  });

  it('getWorkLot returns undefined for unknown code', () => {
    expect(getWorkLot('UNKNOWN')).toBeUndefined();
  });

  it('categories cover the expected set', () => {
    const cats = new Set(WORK_LOTS.map(w => w.category));
    for (const expected of ['structure', 'envelope', 'mep', 'elec', 'security', 'equipment', 'interior', 'exterior', 'coord']) {
      expect(cats).toContain(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------
describe('config: companies', () => {
  it('has a broad French and Swiss company catalog', () => {
    expect(COMPANIES.length).toBeGreaterThanOrEqual(200);
    expect(getCompany('BOUYGUES_BATIMENT')?.lots).toContain('BIM');
    expect(getCompany('IMPLENIA')?.lots).toContain('STR');
  });

  it('every company has unique code', () => {
    const codes = COMPANIES.map(c => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every company has a non-empty name', () => {
    expect(COMPANIES.every(c => c.name && c.name.length > 0)).toBe(true);
  });

  it('every company has a lots array (may be empty)', () => {
    expect(COMPANIES.every(c => Array.isArray(c.lots))).toBe(true);
  });

  it('maps companies only to known work lots', () => {
    const knownLots = new Set(WORK_LOTS.map((lot) => lot.code));
    expect(COMPANIES.every((company) => company.lots.every((lot) => knownLots.has(lot)))).toBe(true);
  });

  it('getCompany returns SIEMENS correctly', () => {
    const c = getCompany('SIEMENS');
    expect(c).toBeDefined();
    expect(c!.name.toUpperCase()).toContain('SIEMENS');
    expect(c!.lots).toContain('ELE');
  });

  it('has unique company codes and no empty names', () => {
    const codes = COMPANIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(COMPANIES.length).toBeGreaterThanOrEqual(250);
  });

  it('getCompany returns undefined for unknown code', () => {
    expect(getCompany('NONEXISTENT')).toBeUndefined();
  });

  it('getCompaniesForLot returns companies for ELE lot', () => {
    const companies = getCompaniesForLot('ELE');
    expect(companies.length).toBeGreaterThan(0);
    expect(companies.every(c => c.lots.includes('ELE'))).toBe(true);
  });

  it('DORMAKABA is mapped to SER, MEN, CFA', () => {
    const c = getCompany('DORMAKABA');
    expect(c!.lots).toEqual(['SER', 'MEN', 'CFA']);
  });
});

// ---------------------------------------------------------------------------
// Document Types
// ---------------------------------------------------------------------------
describe('config: document types', () => {
  it('has exactly 15 groups', () => {
    expect(Object.keys(DOCUMENT_TYPES).length).toBe(15);
  });

  it('has at least 200 document type items in total', () => {
    expect(getAllDocumentTypes().length).toBeGreaterThanOrEqual(200);
  });

  it('has exactly 213 document type items in total', () => {
    expect(getAllDocumentTypes().length).toBe(213);
  });

  it('contains all expected groups', () => {
    const groups = Object.keys(DOCUMENT_TYPES);
    for (const expected of ['reports', 'plans', 'technical', 'tests', 'quotes', 'certifications',
      'lists', 'media', 'admin', 'bim', 'contracts', 'doe', 'bim-coord', 'phases', 'other']) {
      expect(groups).toContain(expected);
    }
  });

  it('each group has a non-empty label', () => {
    for (const group of Object.values(DOCUMENT_TYPES)) {
      expect(group.label.length).toBeGreaterThan(0);
    }
  });

  it('each group has at least one item', () => {
    for (const [key, group] of Object.entries(DOCUMENT_TYPES)) {
      expect(group.items.length, `group '${key}' has no items`).toBeGreaterThan(0);
    }
  });

  it('getDocumentType finds RAP correctly', () => {
    const dt = getDocumentType('RAP');
    expect(dt).toBeDefined();
    expect(dt!.name).toBe('Rapport');
  });

  it('getDocumentType finds CCTP with tooltip', () => {
    const dt = getDocumentType('CCTP');
    expect(dt).toBeDefined();
    expect(dt!.tooltip).toBeDefined();
    expect(dt!.tooltip).toContain('technique');
  });

  it('getDocumentType returns undefined for unknown code', () => {
    expect(getDocumentType('ZZZZZ')).toBeUndefined();
  });

  it('reports group has 51 items', () => {
    expect(DOCUMENT_TYPES.reports.items.length).toBe(51);
  });

  it('tests group has at least 60 items', () => {
    expect(DOCUMENT_TYPES.tests.items.length).toBeGreaterThanOrEqual(60);
  });
});

// ---------------------------------------------------------------------------
// Disciplines
// ---------------------------------------------------------------------------
describe('config: disciplines', () => {
  it('has exactly 19 disciplines', () => {
    expect(DISCIPLINES.length).toBe(19);
  });

  it('every discipline has unique code', () => {
    const codes = DISCIPLINES.map(d => d.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('includes ARC, CVC, ELE, STR', () => {
    const codes = DISCIPLINES.map(d => d.code);
    for (const expected of ['ARC', 'CVC', 'ELE', 'STR']) {
      expect(codes).toContain(expected);
    }
  });
});

// ---------------------------------------------------------------------------
// Extensions
// ---------------------------------------------------------------------------
describe('config: extensions', () => {
  it('categorizes .pdf as documents', () => {
    expect(getCategoryForExt('.pdf')).toBe('documents');
  });

  it('categorizes .dwg as cad', () => {
    expect(getCategoryForExt('.dwg')).toBe('cad');
  });

  it('categorizes .ifc as bim', () => {
    expect(getCategoryForExt('.ifc')).toBe('bim');
  });

  it('categorizes .rvt as bim', () => {
    expect(getCategoryForExt('.rvt')).toBe('bim');
  });

  it('categorizes .png as images', () => {
    expect(getCategoryForExt('.png')).toBe('images');
  });

  it('categorizes .zip as archives', () => {
    expect(getCategoryForExt('.zip')).toBe('archives');
  });

  it('unknown ext returns other', () => {
    expect(getCategoryForExt('.xyz')).toBe('other');
  });

  it('is case-insensitive', () => {
    expect(getCategoryForExt('.PDF')).toBe('documents');
    expect(getCategoryForExt('.DWG')).toBe('cad');
  });

  it('documents category has 9 extensions', () => {
    expect(SUPPORTED_EXTENSIONS.documents.length).toBe(9);
  });

  it('bim category includes .nwd, .nwc, .nwf, .bcf', () => {
    for (const ext of ['.nwd', '.nwc', '.nwf', '.bcf']) {
      expect(SUPPORTED_EXTENSIONS.bim).toContain(ext);
    }
  });

  it('cad category has .dwg, .dxf, .dgn', () => {
    expect(SUPPORTED_EXTENSIONS.cad).toEqual(['.dwg', '.dxf', '.dgn']);
  });
});

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
describe('config: defaults', () => {
  it('has all required settings', () => {
    expect(DEFAULT_SETTINGS.language).toBeDefined();
    expect(DEFAULT_SETTINGS.theme).toBeDefined();
    expect(DEFAULT_SETTINGS.defaultSeparator).toBeDefined();
  });

  it('default language is fr', () => {
    expect(DEFAULT_SETTINGS.language).toBe('fr');
  });

  it('default theme is light', () => {
    expect(DEFAULT_SETTINGS.theme).toBe('light');
  });

  it('default separator is underscore', () => {
    expect(DEFAULT_SETTINGS.defaultSeparator).toBe('_');
  });

  it('default case is upper', () => {
    expect(DEFAULT_SETTINGS.defaultCase).toBe('upper');
  });

  it('specialChars is replace', () => {
    expect(DEFAULT_SETTINGS.specialChars).toBe('replace');
  });

  it('STORAGE_KEYS contains original extension keys + persistence keys + schema-version sentinel', () => {
    const keys = Object.keys(STORAGE_KEYS);
    // Original 5 extension keys
    for (const expected of ['TEMPLATES', 'SETTINGS', 'HISTORY', 'LAST_CONFIG', 'LANGUAGE']) {
      expect(keys).toContain(expected);
    }
    // Wave E-2 persistence keys
    for (const expected of ['FIELDS_ACTIVE', 'FIELDS_VALUES', 'NOMENCLATURE_SETTINGS', 'FILENAME_CLEANER', 'PREFIX_RULES', 'THEME']) {
      expect(keys).toContain(expected);
    }
    // Wave QUAL-2 schema-version sentinel + profile-scoped persistence
    expect(keys).toContain('SCHEMA_VERSION');
    expect(keys).toContain('PROFILE_ID');
    expect(keys).toContain('PROFILE_ENTITIES');
    expect(keys.length).toBe(14);
  });

  it('STORAGE_PREFIX is bimcheck_rename_', () => {
    expect(STORAGE_PREFIX).toBe('bimcheck_rename_');
  });

  it('APP_NAME is BIMCHECK-Rename', () => {
    expect(APP_NAME).toBe('BIMCHECK-Rename');
  });

  it('VERSION is 0.3.0', () => {
    expect(VERSION).toBe('0.3.0');
  });

  it('DEFAULT_TEMPLATES has 3 templates', () => {
    expect(Object.keys(DEFAULT_TEMPLATES).length).toBe(3);
  });

  it('swiss-bim template separator is underscore', () => {
    expect(DEFAULT_TEMPLATES['swiss-bim'].separator).toBe('_');
  });

  it('iso19650 template separator is dash', () => {
    expect(DEFAULT_TEMPLATES['iso19650'].separator).toBe('-');
  });
});

// ---------------------------------------------------------------------------
// Aggregate config object
// ---------------------------------------------------------------------------
describe('config: aggregate', () => {
  it('config object exposes all top-level keys', () => {
    expect(config.WORK_LOTS).toBeDefined();
    expect(config.COMPANIES).toBeDefined();
    expect(config.DOCUMENT_TYPES).toBeDefined();
    expect(config.SUPPORTED_EXTENSIONS).toBeDefined();
    expect(config.DEFAULT_SETTINGS).toBeDefined();
    expect(config.STORAGE_KEYS).toBeDefined();
    expect(config.STORAGE_PREFIX).toBeDefined();
    expect(config.DEFAULT_TEMPLATES).toBeDefined();
    expect(config.DISCIPLINES).toBeDefined();
  });

  it('config.WORK_LOTS is the same reference as WORK_LOTS', () => {
    expect(config.WORK_LOTS).toBe(WORK_LOTS);
  });
});
