/**
 * Tests for lib/bim/nomenclature.ts
 * Every public function + every algorithm branch + every edge case.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  normalizeBIM,
  applyCaseTransform,
  parseFilename,
  cleanFilename,
  validateFilename,
  generate,
  generatePreview,
  batchGenerate,
  generateReport,
  getNextSequence,
  resetSequence,
  NomenclatureCache,
  type NomenclatureContext,
  type SequenceCounters,
  type ReportEntry,
} from '../nomenclature';
import type { BimFile, FieldDefinition } from '../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeField(
  overrides: Partial<FieldDefinition> & { id: string },
): FieldDefinition {
  const defaults: FieldDefinition = {
    id: overrides.id,
    code: overrides.id.toUpperCase(),
    name: overrides.id,
    type: 'custom',
  };
  return { ...defaults, ...overrides };
}

function makeCtx(overrides: Partial<NomenclatureContext> = {}): NomenclatureContext {
  return {
    activeFields: [],
    fieldValues: {},
    separator: '_',
    ...overrides,
  };
}

function makeFile(overrides: Partial<BimFile> & { original: string }): BimFile {
  const lastDot = overrides.original.lastIndexOf('.');
  const ext = lastDot > 0 ? overrides.original.substring(lastDot) : '';
  const defaults: BimFile = {
    id: 'file-1',
    original: overrides.original,
    extension: ext,
    blob: new Blob(),
    folder: 'root',
    size: 0,
    status: 'ready',
    addedAt: new Date(),
    category: 'documents',
    detectedType: null,
    mappedFields: {},
    autoDetected: {},
    cleanedBaseName: null,
    newName: undefined,
  };
  return { ...defaults, ...overrides };
}

// ---------------------------------------------------------------------------
// normalizeBIM
// ---------------------------------------------------------------------------

describe('normalizeBIM', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeBIM('')).toBe('');
  });

  it('returns empty string for null/undefined coerced via falsy', () => {
    // The source does: if (!str) return '';
    expect(normalizeBIM(null as unknown as string)).toBe('');
    expect(normalizeBIM(undefined as unknown as string)).toBe('');
  });

  it('converts lowercase to uppercase', () => {
    expect(normalizeBIM('plan')).toBe('PLAN');
  });

  it('strips lowercase accents: à é è ê î ô ù ü ç', () => {
    expect(normalizeBIM('à')).toBe('A');
    expect(normalizeBIM('éèêë')).toBe('EEEE');
    expect(normalizeBIM('îïì')).toBe('III');
    expect(normalizeBIM('ôöòõ')).toBe('OOOO');
    expect(normalizeBIM('ùûüú')).toBe('UUUU');
    expect(normalizeBIM('ç')).toBe('C');
    expect(normalizeBIM('ñ')).toBe('N');
    expect(normalizeBIM('ÿ')).toBe('Y');
  });

  it('strips uppercase accents: À É È Ê Î Ô Ù Ü Ç', () => {
    expect(normalizeBIM('À')).toBe('A');
    expect(normalizeBIM('ÉÈÊË')).toBe('EEEE');
    expect(normalizeBIM('ÎÏÌÍ')).toBe('IIII');
    expect(normalizeBIM('ÔÖÒÕ')).toBe('OOOO');
    expect(normalizeBIM('ÙÛÜÚ')).toBe('UUUU');
    expect(normalizeBIM('Ç')).toBe('C');
    expect(normalizeBIM('Ñ')).toBe('N');
    expect(normalizeBIM('Ÿ')).toBe('Y');
  });

  it('handles ligatures: æ → AE, œ → OE', () => {
    expect(normalizeBIM('æ')).toBe('AE');
    expect(normalizeBIM('œ')).toBe('OE');
    expect(normalizeBIM('Æ')).toBe('AE');
    expect(normalizeBIM('Œ')).toBe('OE');
  });

  it('collapses multiple underscores', () => {
    expect(normalizeBIM('A___B')).toBe('A_B');
    expect(normalizeBIM('__A__')).toBe('A');
  });

  it('strips leading and trailing underscores', () => {
    expect(normalizeBIM('_PLAN_')).toBe('PLAN');
  });

  it('full French sentence: Plan d\'architecture façade', () => {
    // "Plan d'architecture façade" → uppercase, strip accents
    expect(normalizeBIM("Plan d'architecture façade")).toBe(
      "PLAN D'ARCHITECTURE FACADE",
    );
  });

  it('handles mixed accented and plain characters', () => {
    expect(normalizeBIM('étage_1')).toBe('ETAGE_1');
  });
});

// ---------------------------------------------------------------------------
// applyCaseTransform
// ---------------------------------------------------------------------------

describe('applyCaseTransform', () => {
  it('upper → all uppercase', () => {
    expect(applyCaseTransform('hello World', 'upper')).toBe('HELLO WORLD');
  });

  it('lower → all lowercase', () => {
    expect(applyCaseTransform('Hello World', 'lower')).toBe('hello world');
  });

  it('title → first char upper, rest lower', () => {
    expect(applyCaseTransform('HELLO WORLD', 'title')).toBe('Hello world');
  });

  it('none → unchanged', () => {
    expect(applyCaseTransform('Hello', 'none')).toBe('Hello');
  });

  it('unknown value falls through to default (unchanged)', () => {
    expect(applyCaseTransform('Hello', 'preserve' as 'none')).toBe('Hello');
  });
});

// ---------------------------------------------------------------------------
// parseFilename
// ---------------------------------------------------------------------------

describe('parseFilename', () => {
  it('splits on last dot', () => {
    const r = parseFilename('plan.facade.pdf');
    expect(r.baseName).toBe('plan.facade');
    expect(r.extension).toBe('.pdf');
  });

  it('no extension', () => {
    const r = parseFilename('PLAN_001');
    expect(r.baseName).toBe('PLAN_001');
    expect(r.extension).toBe('');
  });

  it('dot at position 0 is treated as no extension (lastDot > 0 check)', () => {
    const r = parseFilename('.gitignore');
    expect(r.baseName).toBe('.gitignore');
    expect(r.extension).toBe('');
  });
});

// ---------------------------------------------------------------------------
// cleanFilename
// ---------------------------------------------------------------------------

describe('cleanFilename', () => {
  it('replaces non-alphanumeric with underscore and uppercases', () => {
    expect(cleanFilename('plan façade')).toBe('PLAN_FACADE');
  });

  it('collapses multiple underscores', () => {
    expect(cleanFilename('a  b')).toBe('A_B');
  });

  it('strips leading/trailing underscores', () => {
    expect(cleanFilename(' plan ')).toBe('PLAN');
  });
});

// ---------------------------------------------------------------------------
// validateFilename
// ---------------------------------------------------------------------------

describe('validateFilename', () => {
  it('valid Unix-friendly name returns valid=true and empty errors', () => {
    const r = validateFilename('P001-A-ARC-PLA-001.PDF');
    expect(r.valid).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('empty string → invalid', () => {
    expect(validateFilename('').valid).toBe(false);
    expect(validateFilename('').errors[0]).toMatch(/vide/i);
  });

  it('whitespace-only string → invalid', () => {
    expect(validateFilename('   ').valid).toBe(false);
  });

  it('contains "/" → invalid with message', () => {
    const r = validateFilename('path/to/file.pdf');
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => /invalide/i.test(e))).toBe(true);
  });

  it('contains ":" → invalid', () => {
    expect(validateFilename('C:file.pdf').valid).toBe(false);
  });

  it('contains "*" → invalid', () => {
    expect(validateFilename('file*.pdf').valid).toBe(false);
  });

  it('contains "?" → invalid', () => {
    expect(validateFilename('file?.pdf').valid).toBe(false);
  });

  it('contains "\\" → invalid', () => {
    expect(validateFilename('a\\b.pdf').valid).toBe(false);
  });

  it('contains "<" or ">" → invalid', () => {
    expect(validateFilename('<file>.pdf').valid).toBe(false);
  });

  it('reserved Windows name CON → invalid', () => {
    const r = validateFilename('CON.txt');
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => /réservé/i.test(e))).toBe(true);
  });

  it('reserved Windows name PRN → invalid', () => {
    expect(validateFilename('PRN').valid).toBe(false);
  });

  it('reserved Windows name NUL.pdf → invalid', () => {
    expect(validateFilename('NUL.pdf').valid).toBe(false);
  });

  it('250-char name → warning, still valid', () => {
    const name = 'A'.repeat(250);
    const r = validateFilename(name);
    // 250 > 200 → warning but not error (≤ 255)
    expect(r.valid).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('300-char name → invalid (> 255)', () => {
    const name = 'A'.repeat(300);
    const r = validateFilename(name);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => /long/i.test(e))).toBe(true);
  });

  it('exactly 200-char name → valid with no warning', () => {
    const name = 'A'.repeat(200);
    const r = validateFilename(name);
    expect(r.valid).toBe(true);
    expect(r.warnings).toHaveLength(0);
  });

  it('201-char name → warning', () => {
    const name = 'A'.repeat(201);
    const r = validateFilename(name);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getNextSequence / resetSequence
// ---------------------------------------------------------------------------

describe('getNextSequence', () => {
  it('starts at 001 for a new key', () => {
    const c: SequenceCounters = {};
    expect(getNextSequence(c, 'floor1')).toBe('001');
  });

  it('increments on successive calls', () => {
    const c: SequenceCounters = {};
    getNextSequence(c, 'floor1');
    expect(getNextSequence(c, 'floor1')).toBe('002');
    expect(getNextSequence(c, 'floor1')).toBe('003');
  });

  it('different keys are independent', () => {
    const c: SequenceCounters = {};
    getNextSequence(c, 'a');
    getNextSequence(c, 'a');
    expect(getNextSequence(c, 'b')).toBe('001');
  });

  it('pads to 3 digits', () => {
    const c: SequenceCounters = {};
    for (let i = 0; i < 9; i++) getNextSequence(c, 'x');
    expect(getNextSequence(c, 'x')).toBe('010');
  });
});

describe('resetSequence', () => {
  it('resets a single key', () => {
    const c: SequenceCounters = {};
    getNextSequence(c, 'k');
    getNextSequence(c, 'k');
    resetSequence(c, 'k');
    expect(getNextSequence(c, 'k')).toBe('001');
  });

  it('resets all keys when no key given', () => {
    const c: SequenceCounters = {};
    getNextSequence(c, 'a');
    getNextSequence(c, 'b');
    resetSequence(c);
    expect(getNextSequence(c, 'a')).toBe('001');
    expect(getNextSequence(c, 'b')).toBe('001');
  });
});

// ---------------------------------------------------------------------------
// generate
// ---------------------------------------------------------------------------

describe('generate', () => {
  it('simple case: 1 active field with a value → VALUE.EXT', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'PROJ01' },
    });
    const file = makeFile({ original: 'plan.pdf', extension: '.pdf' });
    const result = generate(file, ctx);
    // parts = ['PROJ01'], originalName = 'PLAN'
    expect(result).toBe('PROJ01_PLAN.PDF');
  });

  it('multiple fields joined with separator', () => {
    const ctx = makeCtx({
      activeFields: [
        makeField({ id: 'project' }),
        makeField({ id: 'phase' }),
      ],
      fieldValues: { project: 'PROJ01', phase: 'EXE' },
      separator: '-',
    });
    const file = makeFile({ original: 'plan.pdf', extension: '.pdf' });
    expect(generate(file, ctx)).toBe('PROJ01-EXE-PLAN.PDF');
  });

  it('missing field value is skipped (not added as empty token)', () => {
    const ctx = makeCtx({
      activeFields: [
        makeField({ id: 'project' }),
        makeField({ id: 'phase' }),
      ],
      fieldValues: { project: 'PROJ01' }, // phase missing
      separator: '-',
    });
    const file = makeFile({ original: 'plan.pdf', extension: '.pdf' });
    // Only project present → PROJ01-PLAN.PDF
    expect(generate(file, ctx)).toBe('PROJ01-PLAN.PDF');
  });

  it('skips the filename field', () => {
    const ctx = makeCtx({
      activeFields: [
        makeField({ id: 'filename' }),
        makeField({ id: 'project' }),
      ],
      fieldValues: { project: 'P1', filename: 'IGNORED' },
    });
    const file = makeFile({ original: 'doc.pdf', extension: '.pdf' });
    expect(generate(file, ctx)).toBe('P1_DOC.PDF');
  });

  it('uses cleanedBaseName instead of original when present', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    const file = makeFile({
      original: 'H3_ARC_Plan_001.pdf',
      extension: '.pdf',
      cleanedBaseName: 'Plan_001',
    });
    expect(generate(file, ctx)).toBe('P1_PLAN_001.PDF');
  });

  it('falls back to original baseName when cleanedBaseName is null', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    const file = makeFile({ original: 'schema.dwg', extension: '.dwg' });
    expect(generate(file, ctx)).toBe('P1_SCHEMA.DWG');
  });

  it('per-file mappedFields override global fieldValues', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'workLot' })],
      fieldValues: { workLot: 'ARC' }, // global
    });
    const file = makeFile({
      original: 'file.pdf',
      extension: '.pdf',
      mappedFields: { workLot: 'STR' }, // per-file override
    });
    expect(generate(file, ctx)).toBe('STR_FILE.PDF');
  });

  it('company field always uses per-file mappedFields (never global)', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'company' })],
      fieldValues: { company: 'GLOBAL_CO' },
    });
    const file = makeFile({
      original: 'file.pdf',
      extension: '.pdf',
      mappedFields: { company: 'PER_FILE_CO' },
    });
    // Per-file company should be used
    expect(generate(file, ctx)).toBe('PER_FILE_CO_FILE.PDF');
  });

  it('company field with no per-file mappedFields yields empty (skipped)', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'company' }), makeField({ id: 'project' })],
      fieldValues: { company: 'GLOBAL_CO', project: 'P1' },
    });
    const file = makeFile({
      original: 'file.pdf',
      extension: '.pdf',
      mappedFields: {}, // no company mapped
    });
    expect(generate(file, ctx)).toBe('P1_FILE.PDF');
  });

  it('sequence field with autoIncrement uses getNextSequence', () => {
    const seqField = makeField({ id: 'sequence', autoIncrement: true });
    const ctx = makeCtx({
      activeFields: [seqField],
      fieldValues: {},
    });
    const counters: SequenceCounters = {};
    const f1 = makeFile({ original: 'a.pdf', extension: '.pdf', folder: 'folderA' });
    const f2 = makeFile({ id: 'file-2', original: 'b.pdf', extension: '.pdf', folder: 'folderA' });
    const r1 = generate(f1, ctx, counters);
    const r2 = generate(f2, ctx, counters);
    expect(r1).toBe('001_A.PDF');
    expect(r2).toBe('002_B.PDF');
  });

  it('sequence counters are per-folder', () => {
    const seqField = makeField({ id: 'sequence', autoIncrement: true });
    const ctx = makeCtx({ activeFields: [seqField], fieldValues: {} });
    const counters: SequenceCounters = {};
    const fA = makeFile({ original: 'a.pdf', extension: '.pdf', folder: 'folderA' });
    const fB = makeFile({ id: 'f2', original: 'b.pdf', extension: '.pdf', folder: 'folderB' });
    const rA = generate(fA, ctx, counters);
    const rB = generate(fB, ctx, counters);
    expect(rA).toBe('001_A.PDF');
    expect(rB).toBe('001_B.PDF');
  });

  it('workLotPart is inserted after building field', () => {
    const ctx = makeCtx({
      activeFields: [
        makeField({ id: 'project' }),
        makeField({ id: 'building' }),
        makeField({ id: 'phase' }),
      ],
      fieldValues: { project: 'P1', building: 'B1', phase: 'EXE' },
      workLotPart: 'LOT03',
    });
    const file = makeFile({ original: 'plan.pdf', extension: '.pdf' });
    // project_building_workLot_phase_PLAN.PDF
    expect(generate(file, ctx)).toBe('P1_B1_LOT03_EXE_PLAN.PDF');
  });

  it('workLotPart appended at end when no building field present', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
      workLotPart: 'LOT03',
    });
    const file = makeFile({ original: 'plan.pdf', extension: '.pdf' });
    expect(generate(file, ctx)).toBe('P1_LOT03_PLAN.PDF');
  });

  it('no active fields → normalizedOriginalName.EXT only', () => {
    const ctx = makeCtx();
    const file = makeFile({ original: 'plan façade.pdf', extension: '.pdf' });
    expect(generate(file, ctx)).toBe('PLAN FACADE.PDF');
  });

  it('extension is uppercased', () => {
    const ctx = makeCtx();
    const file = makeFile({ original: 'doc.dwg', extension: '.dwg' });
    expect(generate(file, ctx)).toBe('DOC.DWG');
  });

  it('caseTransform option applied to field values', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'proj01' },
    });
    const file = makeFile({ original: 'a.pdf', extension: '.pdf' });
    const result = generate(file, ctx, {}, { caseTransform: 'upper' });
    expect(result).toBe('PROJ01_A.PDF');
  });
});

// ---------------------------------------------------------------------------
// generatePreview
// ---------------------------------------------------------------------------

describe('generatePreview', () => {
  it('uses NOM_FICHIER placeholder for original name', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    expect(generatePreview(ctx)).toBe('P1_NOM_FICHIER.PDF');
  });

  it('sequence field without autoIncrement shows 001 placeholder', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'sequence' })],
      fieldValues: {}, // no value for sequence
    });
    expect(generatePreview(ctx)).toBe('001_NOM_FICHIER.PDF');
  });

  it('custom extension hint', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    expect(generatePreview(ctx, '.dwg')).toBe('P1_NOM_FICHIER.DWG');
  });

  it('no active fields → NOM_FICHIER.PDF', () => {
    expect(generatePreview(makeCtx())).toBe('NOM_FICHIER.PDF');
  });

  it('skips filename field in preview', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'filename' }), makeField({ id: 'project' })],
      fieldValues: { project: 'P1', filename: 'IGNORE' },
    });
    expect(generatePreview(ctx)).toBe('P1_NOM_FICHIER.PDF');
  });

  it('workLotPart inserted after building in preview', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'building' })],
      fieldValues: { building: 'BAT_A' },
      workLotPart: 'LOT02',
    });
    expect(generatePreview(ctx)).toBe('BAT_A_LOT02_NOM_FICHIER.PDF');
  });

  it('normalizes accents in preview field values', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'éTAGE' },
    });
    expect(generatePreview(ctx)).toBe('ETAGE_NOM_FICHIER.PDF');
  });
});

// ---------------------------------------------------------------------------
// batchGenerate
// ---------------------------------------------------------------------------

describe('batchGenerate', () => {
  it('generates names for all files', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    const files = [
      makeFile({ id: 'a', original: 'a.pdf', extension: '.pdf' }),
      makeFile({ id: 'b', original: 'b.pdf', extension: '.pdf' }),
      makeFile({ id: 'c', original: 'c.pdf', extension: '.pdf' }),
    ];
    const results = batchGenerate(files, ctx);
    expect(results).toHaveLength(3);
    expect(results[0].newName).toBe('P1_A.PDF');
  });

  it('sequence increments across batch', () => {
    const seqField = makeField({ id: 'sequence', autoIncrement: true });
    const ctx = makeCtx({ activeFields: [seqField], fieldValues: {} });
    const files = Array.from({ length: 5 }, (_, i) =>
      makeFile({ id: `f${i}`, original: `file${i}.pdf`, extension: '.pdf', folder: 'root' }),
    );
    const results = batchGenerate(files, ctx);
    const names = results.map((r) => r.newName);
    expect(names[0]).toBe('001_FILE0.PDF');
    expect(names[4]).toBe('005_FILE4.PDF');
  });

  it('per-folder counters reset to 1 for each folder', () => {
    const seqField = makeField({ id: 'sequence', autoIncrement: true });
    const ctx = makeCtx({ activeFields: [seqField], fieldValues: {} });
    const files = [
      makeFile({ id: 'a1', original: 'a.pdf', extension: '.pdf', folder: 'folderA' }),
      makeFile({ id: 'a2', original: 'b.pdf', extension: '.pdf', folder: 'folderA' }),
      makeFile({ id: 'b1', original: 'c.pdf', extension: '.pdf', folder: 'folderB' }),
      makeFile({ id: 'b2', original: 'd.pdf', extension: '.pdf', folder: 'folderB' }),
    ];
    const results = batchGenerate(files, ctx);
    expect(results[0].newName).toBe('001_A.PDF');
    expect(results[1].newName).toBe('002_B.PDF');
    expect(results[2].newName).toBe('001_C.PDF');
    expect(results[3].newName).toBe('002_D.PDF');
  });

  it('counters reset between batchGenerate calls', () => {
    const seqField = makeField({ id: 'sequence', autoIncrement: true });
    const ctx = makeCtx({ activeFields: [seqField], fieldValues: {} });
    const files = [
      makeFile({ id: 'a', original: 'a.pdf', extension: '.pdf', folder: 'root' }),
    ];
    batchGenerate(files, ctx);
    const r2 = batchGenerate(files, ctx);
    // second call should restart from 001
    expect(r2[0].newName).toBe('001_A.PDF');
  });

  it('errors array is empty for valid names', () => {
    const ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    const files = [makeFile({ id: 'x', original: 'plan.pdf', extension: '.pdf' })];
    expect(batchGenerate(files, ctx)[0].errors).toHaveLength(0);
  });

  it('result fileId matches input file id', () => {
    const ctx = makeCtx();
    const file = makeFile({ id: 'unique-123', original: 'doc.pdf', extension: '.pdf' });
    const results = batchGenerate([file], ctx);
    expect(results[0].fileId).toBe('unique-123');
  });
});

// ---------------------------------------------------------------------------
// generateReport
// ---------------------------------------------------------------------------

describe('generateReport', () => {
  it('renders header and file count', () => {
    const entries: ReportEntry[] = [
      { fileId: 'a', original: 'old.pdf', newName: 'NEW.PDF', errors: [] },
    ];
    const report = generateReport(entries);
    expect(report).toContain('BIM Nomenclature Pro');
    expect(report).toContain('Fichiers traités: 1');
  });

  it('renders Before → After lines for each file', () => {
    const entries: ReportEntry[] = [
      { fileId: 'a', original: 'before.pdf', newName: 'AFTER.PDF', errors: [] },
      { fileId: 'b', original: 'doc.dwg', newName: 'DOC.DWG', errors: [] },
    ];
    const report = generateReport(entries);
    expect(report).toContain('Original: before.pdf');
    expect(report).toContain('Nouveau:  AFTER.PDF');
    expect(report).toContain('Original: doc.dwg');
  });

  it('includes errors when present', () => {
    const entries: ReportEntry[] = [
      { fileId: 'x', original: 'CON.txt', newName: 'CON.TXT', errors: ['Nom réservé par le système'] },
    ];
    const report = generateReport(entries);
    expect(report).toContain('Erreurs:');
    expect(report).toContain('Nom réservé');
  });

  it('empty result array renders a valid report', () => {
    const report = generateReport([]);
    expect(report).toContain('Fichiers traités: 0');
  });
});

// ---------------------------------------------------------------------------
// NomenclatureCache
// ---------------------------------------------------------------------------

describe('NomenclatureCache', () => {
  let cache: NomenclatureCache;
  let ctx: NomenclatureContext;
  let file: BimFile;

  beforeEach(() => {
    cache = new NomenclatureCache();
    ctx = makeCtx({
      activeFields: [makeField({ id: 'project' })],
      fieldValues: { project: 'P1' },
    });
    file = makeFile({ id: 'f1', original: 'plan.pdf', extension: '.pdf' });
  });

  it('returns undefined on first get (cold cache)', () => {
    expect(cache.get(file, ctx)).toBeUndefined();
  });

  it('returns the stored value after set', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    expect(cache.get(file, ctx)).toBe('P1_PLAN.PDF');
  });

  it('same input → same cached result via generate()', () => {
    const r1 = generate(file, ctx, {}, {}, cache);
    const r2 = generate(file, ctx, {}, {}, cache);
    expect(r1).toBe(r2);
  });

  it('changing ctx.separator invalidates (cache miss)', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    const ctx2 = { ...ctx, separator: '-' };
    expect(cache.get(file, ctx2)).toBeUndefined();
  });

  it('changing fieldValues invalidates (cache miss)', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    const ctx2 = { ...ctx, fieldValues: { project: 'P2' } };
    expect(cache.get(file, ctx2)).toBeUndefined();
  });

  it('changing cleanedBaseName invalidates (cache miss)', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    const file2 = { ...file, cleanedBaseName: 'Facade' };
    expect(cache.get(file2, ctx)).toBeUndefined();
  });

  it('invalidateFile removes one entry', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    cache.invalidateFile('f1');
    expect(cache.get(file, ctx)).toBeUndefined();
  });

  it('invalidateFile does not affect other files', () => {
    const file2 = makeFile({ id: 'f2', original: 'section.pdf', extension: '.pdf' });
    cache.set(file, ctx, 'P1_PLAN.PDF');
    cache.set(file2, ctx, 'P1_SECTION.PDF');
    cache.invalidateFile('f1');
    expect(cache.get(file2, ctx)).toBe('P1_SECTION.PDF');
  });

  it('invalidateAll clears all entries', () => {
    cache.set(file, ctx, 'P1_PLAN.PDF');
    cache.invalidateAll();
    expect(cache.get(file, ctx)).toBeUndefined();
  });

  it('files without id bypass the cache (always generate fresh)', () => {
    const fileNoId = { ...file, id: undefined as unknown as string };
    const r1 = generate(fileNoId, ctx, {}, {}, cache);
    const r2 = generate(fileNoId, ctx, {}, {}, cache);
    // Should still produce the correct result — just not cached
    expect(r1).toBe('P1_PLAN.PDF');
    expect(r2).toBe('P1_PLAN.PDF');
  });
});
