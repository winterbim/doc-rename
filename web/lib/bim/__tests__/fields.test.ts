/**
 * Tests for lib/bim/fields.ts
 * Covers the full public API surface of the fields module.
 */

import { describe, it, expect } from 'vitest';
import {
  FIELD_DEFINITIONS,
  createDefaultFieldsState,
  getAllFields,
  getFieldDefinition,
  getActiveFields,
  getInactiveFields,
  getFieldValue,
  setFieldValue,
  setActiveFields,
  setWorkLotPart,
  transformValue,
  getWorkLotPart,
  loadTemplate,
  validateFields,
  parseFilenameParts,
  exportFieldsState,
  exportFieldsStateCsv,
  importFieldsState,
  importFieldsStateFromTable,
} from '../fields';
import type { FieldDefinition } from '../types';
import type { FieldsState } from '../fields';

// ---------------------------------------------------------------------------
// FIELD_DEFINITIONS
// ---------------------------------------------------------------------------

describe('FIELD_DEFINITIONS', () => {
  it('contains exactly 17 field definitions', () => {
    expect(FIELD_DEFINITIONS).toHaveLength(17);
  });

  it('contains all expected field IDs', () => {
    const ids = FIELD_DEFINITIONS.map((f) => f.id);
    const expected = [
      'project', 'building', 'workLot', 'discipline', 'docType',
      'sequence', 'revision', 'date', 'phase', 'zone', 'level',
      'originator', 'company', 'status', 'custom1', 'custom2', 'filename',
    ];
    expect(ids).toEqual(expected);
  });

  it('has correct codes for key fields', () => {
    const byId = Object.fromEntries(FIELD_DEFINITIONS.map((f) => [f.id, f]));
    expect(byId['project'].code).toBe('PRJ');
    expect(byId['docType'].code).toBe('DOC');
    expect(byId['sequence'].code).toBe('SEQ');
    expect(byId['revision'].code).toBe('REV');
    expect(byId['custom1'].code).toBe('CUS1');
    expect(byId['filename'].code).toBe('NOM');
  });

  it('marks docType as required', () => {
    const docType = FIELD_DEFINITIONS.find((f) => f.id === 'docType');
    expect(docType?.required).toBe(true);
  });

  it('sequence has autoIncrement=true', () => {
    const seq = FIELD_DEFINITIONS.find((f) => f.id === 'sequence');
    expect(seq?.autoIncrement).toBe(true);
  });
});

describe('getAllFields', () => {
  it('returns the same array as FIELD_DEFINITIONS', () => {
    expect(getAllFields()).toBe(FIELD_DEFINITIONS);
  });
});

// ---------------------------------------------------------------------------
// createDefaultFieldsState
// ---------------------------------------------------------------------------

describe('createDefaultFieldsState', () => {
  it('returns the default active field IDs', () => {
    const state = createDefaultFieldsState();
    expect(state.activeFieldIds).toEqual([
      'project', 'building', 'workLot', 'docType', 'company', 'sequence',
    ]);
  });

  it('returns empty values and null workLotPart', () => {
    const state = createDefaultFieldsState();
    expect(state.values).toEqual({});
    expect(state.workLotPart).toBeNull();
  });

  it('returns new objects on each call (no shared reference)', () => {
    const a = createDefaultFieldsState();
    const b = createDefaultFieldsState();
    a.values['project'] = 'X';
    expect(b.values['project']).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getFieldDefinition
// ---------------------------------------------------------------------------

describe('getFieldDefinition', () => {
  it('returns the correct definition for known IDs', () => {
    const def = getFieldDefinition('project');
    expect(def).toBeDefined();
    expect(def!.id).toBe('project');
    expect(def!.code).toBe('PRJ');
  });

  it('returns undefined for unknown IDs', () => {
    expect(getFieldDefinition('nonexistent')).toBeUndefined();
    expect(getFieldDefinition('')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getActiveFields
// ---------------------------------------------------------------------------

describe('getActiveFields', () => {
  it('resolves active IDs to definitions in order', () => {
    const state = createDefaultFieldsState();
    const fields = getActiveFields(state);
    expect(fields.map((f) => f.id)).toEqual(state.activeFieldIds);
  });

  it('silently skips unknown IDs', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'unknown_id', 'sequence'],
      values: {},
      workLotPart: null,
    };
    const fields = getActiveFields(state);
    expect(fields.map((f) => f.id)).toEqual(['project', 'sequence']);
  });
});

// ---------------------------------------------------------------------------
// getInactiveFields
// ---------------------------------------------------------------------------

describe('getInactiveFields', () => {
  it('returns fields not in activeFieldIds', () => {
    const state = createDefaultFieldsState();
    const inactive = getInactiveFields(state);
    const inactiveIds = inactive.map((f) => f.id);
    for (const id of state.activeFieldIds) {
      expect(inactiveIds).not.toContain(id);
    }
  });

  it('returns 17 - active count fields', () => {
    const state = createDefaultFieldsState();
    const inactive = getInactiveFields(state);
    expect(inactive).toHaveLength(17 - state.activeFieldIds.length);
  });
});

// ---------------------------------------------------------------------------
// getFieldValue
// ---------------------------------------------------------------------------

describe('getFieldValue', () => {
  it('returns empty string for unset field', () => {
    const state = createDefaultFieldsState();
    expect(getFieldValue(state, 'project')).toBe('');
  });

  it('returns stored value', () => {
    const state: FieldsState = {
      activeFieldIds: [],
      values: { project: 'PROJ01' },
      workLotPart: null,
    };
    expect(getFieldValue(state, 'project')).toBe('PROJ01');
  });

  it('returns empty string for unknown field', () => {
    const state = createDefaultFieldsState();
    expect(getFieldValue(state, 'xyz')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// transformValue
// ---------------------------------------------------------------------------

describe('transformValue', () => {
  const fieldWith = (transform: string) =>
    ({ id: 'x', code: 'X', name: 'X', type: 'custom', transform }) as FieldDefinition;

  it("'upper' → toUpperCase", () => {
    expect(transformValue('abc', fieldWith('upper'))).toBe('ABC');
  });

  it("'lower' → toLowerCase", () => {
    expect(transformValue("Plan d'Arc", fieldWith('lower'))).toBe("plan d'arc");
  });

  it("'padStart:3' pads with zeroes", () => {
    expect(transformValue('5', fieldWith('padStart:3'))).toBe('005');
    expect(transformValue('42', fieldWith('padStart:3'))).toBe('042');
    expect(transformValue('100', fieldWith('padStart:3'))).toBe('100');
    expect(transformValue('1000', fieldWith('padStart:3'))).toBe('1000'); // no truncation
  });

  it("'cleanFilename' replaces special chars and uppercases", () => {
    expect(transformValue('plan d\'arc', fieldWith('cleanFilename'))).toBe("PLAN_D_ARC");
  });

  it("'upper|padStart:4' applies both transforms in order", () => {
    expect(transformValue('ab', fieldWith('upper|padStart:4'))).toBe('00AB');
  });

  it('returns value unchanged when no transform', () => {
    const field = { id: 'x', code: 'X', name: 'X', type: 'custom' } as FieldDefinition;
    expect(transformValue('hello', field)).toBe('hello');
  });

  it('returns value unchanged when value is empty', () => {
    expect(transformValue('', fieldWith('upper'))).toBe('');
  });
});

// ---------------------------------------------------------------------------
// setFieldValue
// ---------------------------------------------------------------------------

describe('setFieldValue', () => {
  it('is immutable — returns new state', () => {
    const state = createDefaultFieldsState();
    const next = setFieldValue(state, 'project', 'test');
    expect(next).not.toBe(state);
    expect(state.values['project']).toBeUndefined();
    expect(next.values['project']).toBe('TEST'); // 'project' has transform:'upper'
  });

  it('applies the field transform (upper)', () => {
    const state = createDefaultFieldsState();
    const next = setFieldValue(state, 'revision', 'b');
    expect(next.values['revision']).toBe('B');
  });

  it('applies padStart transform for sequence', () => {
    const state = createDefaultFieldsState();
    const next = setFieldValue(state, 'sequence', '7');
    expect(next.values['sequence']).toBe('007');
  });

  it('returns same state for unknown field ID', () => {
    const state = createDefaultFieldsState();
    const next = setFieldValue(state, 'nonexistent', 'x');
    expect(next).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// setActiveFields
// ---------------------------------------------------------------------------

describe('setActiveFields', () => {
  it('updates activeFieldIds', () => {
    const state = createDefaultFieldsState();
    const next = setActiveFields(state, ['project', 'docType']);
    expect(next.activeFieldIds).toEqual(['project', 'docType']);
  });

  it('filters out unknown IDs', () => {
    const state = createDefaultFieldsState();
    const next = setActiveFields(state, ['project', 'unknown', 'sequence']);
    expect(next.activeFieldIds).toEqual(['project', 'sequence']);
  });

  it('is immutable', () => {
    const state = createDefaultFieldsState();
    const next = setActiveFields(state, ['docType']);
    expect(next).not.toBe(state);
    expect(state.activeFieldIds).toHaveLength(6); // default unchanged
  });

  it('preserves other state properties', () => {
    const state: FieldsState = {
      activeFieldIds: ['project'],
      values: { project: 'P1' },
      workLotPart: 'ARC',
    };
    const next = setActiveFields(state, ['docType', 'sequence']);
    expect(next.values).toEqual(state.values);
    expect(next.workLotPart).toBe('ARC');
  });
});

// ---------------------------------------------------------------------------
// setWorkLotPart / getWorkLotPart
// ---------------------------------------------------------------------------

describe('getWorkLotPart', () => {
  it('returns workLotPart when set', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'workLot'],
      values: { workLot: 'STR' },
      workLotPart: 'ARC',
    };
    expect(getWorkLotPart(state)).toBe('ARC');
  });

  it('falls back to workLot field value when workLotPart is null', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'workLot'],
      values: { workLot: 'ARC' },
      workLotPart: null,
    };
    expect(getWorkLotPart(state)).toBe('ARC');
  });

  it('returns null when workLot field is not active', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'sequence'],
      values: { workLot: 'ARC' },
      workLotPart: null,
    };
    expect(getWorkLotPart(state)).toBeNull();
  });

  it('returns null when workLot field is active but has no value', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'workLot'],
      values: {},
      workLotPart: null,
    };
    expect(getWorkLotPart(state)).toBeNull();
  });
});

describe('setWorkLotPart', () => {
  it('updates workLotPart', () => {
    const state = createDefaultFieldsState();
    const next = setWorkLotPart(state, 'CVC');
    expect(next.workLotPart).toBe('CVC');
  });

  it('accepts null to clear', () => {
    const state: FieldsState = { ...createDefaultFieldsState(), workLotPart: 'ARC' };
    const next = setWorkLotPart(state, null);
    expect(next.workLotPart).toBeNull();
  });

  it('is immutable', () => {
    const state = createDefaultFieldsState();
    const next = setWorkLotPart(state, 'ELE');
    expect(next).not.toBe(state);
    expect(state.workLotPart).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// loadTemplate
// ---------------------------------------------------------------------------

describe('loadTemplate', () => {
  it("loads 'swiss-bim' template", () => {
    const state = createDefaultFieldsState();
    const next = loadTemplate(state, 'swiss-bim');
    expect(next.activeFieldIds).toEqual([
      'project', 'building', 'discipline', 'docType', 'sequence', 'revision',
    ]);
  });

  it("loads 'iso19650' template", () => {
    const state = createDefaultFieldsState();
    const next = loadTemplate(state, 'iso19650');
    expect(next.activeFieldIds).toEqual([
      'project', 'originator', 'discipline', 'zone', 'docType', 'sequence', 'revision',
    ]);
  });

  it("loads 'french-bim' template", () => {
    const state = createDefaultFieldsState();
    const next = loadTemplate(state, 'french-bim');
    expect(next.activeFieldIds).toEqual([
      'project', 'building', 'phase', 'discipline', 'docType', 'sequence',
    ]);
  });

  it('preserves values when clearValues is false (default)', () => {
    const state: FieldsState = {
      activeFieldIds: [],
      values: { project: 'PRJ01' },
      workLotPart: 'ARC',
    };
    const next = loadTemplate(state, 'swiss-bim', false);
    expect(next.values).toEqual({ project: 'PRJ01' });
    expect(next.workLotPart).toBe('ARC');
  });

  it('clears values and workLotPart when clearValues is true', () => {
    const state: FieldsState = {
      activeFieldIds: [],
      values: { project: 'PRJ01' },
      workLotPart: 'ARC',
    };
    const next = loadTemplate(state, 'swiss-bim', true);
    expect(next.values).toEqual({});
    expect(next.workLotPart).toBeNull();
  });

  it('returns same state for unknown template ID', () => {
    const state = createDefaultFieldsState();
    const next = loadTemplate(state, 'nonexistent-template');
    expect(next).toBe(state);
  });

  it('is immutable', () => {
    const state = createDefaultFieldsState();
    const next = loadTemplate(state, 'iso19650');
    expect(next).not.toBe(state);
    expect(state.activeFieldIds).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// validateFields
// ---------------------------------------------------------------------------

describe('validateFields', () => {
  it('returns no errors when required field has a value', () => {
    const state: FieldsState = {
      activeFieldIds: ['docType'],
      values: { docType: 'PLA' },
      workLotPart: null,
    };
    expect(validateFields(state)).toHaveLength(0);
  });

  it('returns error when required field is missing', () => {
    const state: FieldsState = {
      activeFieldIds: ['docType'],
      values: {},
      workLotPart: null,
    };
    const errors = validateFields(state);
    expect(errors).toHaveLength(1);
    expect(errors[0].fieldId).toBe('docType');
  });

  it('returns error when field exceeds maxLength', () => {
    const state: FieldsState = {
      activeFieldIds: ['project'],
      values: { project: 'TOOLONGPROJECT99' }, // > 10
      workLotPart: null,
    };
    const errors = validateFields(state);
    expect(errors.some((e) => e.fieldId === 'project')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseFilenameParts
// ---------------------------------------------------------------------------

describe('parseFilenameParts', () => {
  it('splits by underscores', () => {
    expect(parseFilenameParts('PRJ_BAT_ARC_001.pdf')).toEqual([
      'PRJ', 'BAT', 'ARC', '001',
    ]);
  });

  it('splits by hyphens', () => {
    expect(parseFilenameParts('PRJ-BAT-ARC-001.pdf')).toEqual([
      'PRJ', 'BAT', 'ARC', '001',
    ]);
  });

  it('strips extension', () => {
    const parts = parseFilenameParts('Plan_facade.dwg');
    expect(parts).not.toContain('dwg');
  });

  it('handles no extension', () => {
    expect(parseFilenameParts('plan facade')).toEqual(['plan', 'facade']);
  });
});

// ---------------------------------------------------------------------------
// exportFieldsState / importFieldsState — round-trip
// ---------------------------------------------------------------------------

describe('exportFieldsState / importFieldsState', () => {
  it('round-trips state faithfully', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'building', 'docType'],
      values: { project: 'PRJ01', building: 'BATA', docType: 'PLA' },
      workLotPart: 'ARC',
    };
    const json = exportFieldsState(state);
    const restored = importFieldsState(json);
    expect(restored.activeFieldIds).toEqual(state.activeFieldIds);
    expect(restored.values).toEqual(state.values);
    expect(restored.workLotPart).toBe('ARC');
  });

  it('exportFieldsState returns valid JSON', () => {
    const state = createDefaultFieldsState();
    expect(() => JSON.parse(exportFieldsState(state))).not.toThrow();
  });

  it('importFieldsState filters unknown field IDs', () => {
    const json = JSON.stringify({
      activeFieldIds: ['project', 'nonexistent', 'docType'],
      values: {},
      workLotPart: null,
    });
    const state = importFieldsState(json);
    expect(state.activeFieldIds).toEqual(['project', 'docType']);
  });

  it('importFieldsState accepts legacy "activeFields" key', () => {
    const json = JSON.stringify({
      activeFields: ['project', 'sequence'],
      fieldValues: { project: 'OLD' },
    });
    const state = importFieldsState(json);
    expect(state.activeFieldIds).toEqual(['project', 'sequence']);
    expect(state.values['project']).toBe('OLD');
  });

  it('importFieldsState uses default active fields when none provided', () => {
    const json = JSON.stringify({ values: {} });
    const state = importFieldsState(json);
    expect(state.activeFieldIds).toEqual(createDefaultFieldsState().activeFieldIds);
  });

  it('importFieldsState throws SyntaxError on bad JSON', () => {
    expect(() => importFieldsState('not-json')).toThrow(SyntaxError);
  });
});

describe('exportFieldsStateCsv / importFieldsStateFromTable', () => {
  it('exports active fields and values in a spreadsheet-friendly format', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'docType'],
      values: { project: 'PRJ01', docType: 'PLAN' },
      workLotPart: null,
    };

    const csv = exportFieldsStateCsv(state);

    expect(csv).toContain('ordre;id;code;champ;valeur;actif');
    expect(csv).toContain('project;PRJ;Code Projet;PRJ01;oui');
    expect(csv).toContain('docType;DOC;Type Document;PLAN;oui');
  });

  it('round-trips the exported CSV including active order', () => {
    const state: FieldsState = {
      activeFieldIds: ['project', 'building', 'docType'],
      values: { project: 'PRJ01', building: 'BAT-A', docType: 'PLA' },
      workLotPart: null,
    };

    const restored = importFieldsStateFromTable(exportFieldsStateCsv(state), createDefaultFieldsState());

    expect(restored.activeFieldIds).toEqual(state.activeFieldIds);
    expect(restored.values.project).toBe('PRJ01');
    expect(restored.values.building).toBe('BAT-A');
    expect(restored.values.docType).toBe('PLA');
  });

  it('imports a two-column table pasted from Excel', () => {
    const table = 'Code Projet\talpha\nRévision\tb\nSéquence\t7';
    const state = importFieldsStateFromTable(table, {
      activeFieldIds: ['docType'],
      values: {},
      workLotPart: null,
    });

    expect(state.activeFieldIds).toEqual(['docType', 'project', 'revision', 'sequence']);
    expect(state.values.project).toBe('ALPHA');
    expect(state.values.revision).toBe('B');
    expect(state.values.sequence).toBe('007');
  });

  it('imports semicolon CSV with field codes and values', () => {
    const csv = 'code;valeur\nPRJ;demo\nDOC;rapport\nREV;c';
    const state = importFieldsStateFromTable(csv);

    expect(state.values.project).toBe('DEMO');
    expect(state.values.docType).toBe('rapport');
    expect(state.values.revision).toBe('C');
  });

  it('preserves the base state when no known fields are found', () => {
    const base = createDefaultFieldsState();
    const state = importFieldsStateFromTable('unknown;value', base);
    expect(state).toBe(base);
  });
});
