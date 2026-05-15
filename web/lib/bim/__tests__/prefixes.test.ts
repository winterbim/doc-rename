import { describe, it, expect } from 'vitest';
import { detectPrefixes, applyPrefixAction, applyPrefixActionBatch } from '../prefixes';
import type { BimFile, PrefixRule } from '../types';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

/** Minimal stub that satisfies detectPrefixes's Pick type */
function makeDetectInput(
  originals: string[]
): Array<{ id: string; original: string; cleanedBaseName: null }> {
  return originals.map((o, i) => ({ id: `f${i}`, original: o, cleanedBaseName: null }));
}

/** Full BimFile stub — only the fields we actually touch */
function makeFile(overrides: Partial<BimFile> & { original: string }): BimFile {
  const defaults: BimFile = {
    id: 'test-id',
    original: overrides.original,
    extension: '.pdf',
    blob: new Blob(),
    folder: '',
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
// detectPrefixes
// ---------------------------------------------------------------------------

describe('detectPrefixes', () => {
  it('finds H3_ARC_ when 3+ files share it', () => {
    const files = makeDetectInput([
      'H3_ARC_Plan_001.pdf',
      'H3_ARC_Plan_002.pdf',
      'H3_ARC_Facade_A.pdf',
    ]);
    const result = detectPrefixes(files);
    const prefixes = result.map((p) => p.prefix);
    expect(prefixes).toContain('H3_ARC_');
  });

  it('count reflects the number of matching files', () => {
    const files = makeDetectInput([
      'H3_ARC_Plan_001.pdf',
      'H3_ARC_Plan_002.pdf',
      'H3_ARC_Facade_A.pdf',
    ]);
    const result = detectPrefixes(files);
    const arcEntry = result.find((p) => p.prefix === 'H3_ARC_');
    expect(arcEntry?.count).toBe(3);
  });

  it('ignores singletons (only 1 occurrence)', () => {
    const files = makeDetectInput([
      'H3_ARC_Plan_001.pdf',   // unique prefix at 3-token level
      'H3_STR_Plan_001.pdf',
      'H3_CVC_Schema_01.pdf',
    ]);
    // H3_ appears 3 times → should appear
    // but H3_ARC_, H3_STR_, H3_CVC_ each appear once → should NOT appear
    const result = detectPrefixes(files);
    const prefixes = result.map((p) => p.prefix);
    expect(prefixes).not.toContain('H3_ARC_');
    expect(prefixes).not.toContain('H3_STR_');
  });

  it('ignores singletons — single file produces empty result', () => {
    const files = makeDetectInput(['H3_ARC_Plan_001.pdf']);
    expect(detectPrefixes(files)).toHaveLength(0);
  });

  it('returns empty array for empty file list', () => {
    expect(detectPrefixes([])).toHaveLength(0);
  });

  it('returns empty result when files share no common prefix (≥3)', () => {
    const files = makeDetectInput([
      'ARC_Plan_001.pdf',
      'STR_Plan_001.pdf',
      'CVC_Schema_01.pdf',
    ]);
    // Each 1-token prefix appears once → none qualify
    expect(detectPrefixes(files)).toHaveLength(0);
  });

  it('returns longest-prefix winner on overlap — H3_ARC_ beats H3_', () => {
    // All 4 files share H3_ but only first 3 share H3_ARC_
    // H3_ has count=4, H3_ARC_ has count=3, both qualify (≥3)
    // After length-sort, H3_ARC_ (len 7) should appear before H3_ (len 3)
    const files = makeDetectInput([
      'H3_ARC_Plan_001.pdf',
      'H3_ARC_Plan_002.pdf',
      'H3_ARC_Facade_A.pdf',
      'H3_STR_Beam_001.pdf',
    ]);
    const result = detectPrefixes(files);
    const prefixes = result.map((p) => p.prefix);
    // H3_ARC_ (longer) should be present
    expect(prefixes).toContain('H3_ARC_');
    // H3_ may or may not appear — it's not filtered by the dedup rule
    // (dedup only removes exact duplicate prefix strings, not sub-prefixes)
    // What matters: H3_ARC_ comes before H3_ in the sorted result
    const arcIdx = prefixes.indexOf('H3_ARC_');
    const baseIdx = prefixes.indexOf('H3_');
    if (baseIdx !== -1) {
      expect(arcIdx).toBeLessThan(baseIdx);
    }
  });

  it('caps fileIds at 50 entries', () => {
    // 60 files all sharing PREFIX_
    const files = makeDetectInput(
      Array.from({ length: 60 }, (_, i) => `PREFIX_File_${i.toString().padStart(3, '0')}.pdf`)
    );
    const result = detectPrefixes(files);
    const prefixEntry = result.find((p) => p.prefix === 'PREFIX_');
    expect(prefixEntry).toBeDefined();
    expect(prefixEntry!.count).toBe(60);
    expect(prefixEntry!.fileIds).toHaveLength(50);
  });

  it('uses original filename regardless of cleanedBaseName', () => {
    const files = [
      { id: 'a', original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'cleaned-a' },
      { id: 'b', original: 'H3_ARC_Plan_002.pdf', cleanedBaseName: 'cleaned-b' },
      { id: 'c', original: 'H3_ARC_Facade_A.pdf', cleanedBaseName: null },
    ];
    const result = detectPrefixes(files);
    expect(result.map((p) => p.prefix)).toContain('H3_ARC_');
  });
});

// ---------------------------------------------------------------------------
// applyPrefixAction — 'remove'
// ---------------------------------------------------------------------------

describe("applyPrefixAction('remove')", () => {
  it('strips the prefix from cleanedBaseName when present', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
  });

  it('strips the prefix from original when cleanedBaseName is null', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
  });

  it('leaves name unchanged when file does not start with prefix', () => {
    const file = makeFile({ original: 'STR_Beam_001.pdf' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('STR_Beam_001');
  });

  it('does not mutate mappedFields for remove action', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', mappedFields: { lot: 'ARC' } });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const { mappedFields } = applyPrefixAction(file, rule);
    expect(mappedFields).toEqual({ lot: 'ARC' });
  });
});

// ---------------------------------------------------------------------------
// applyPrefixAction — 'replace'
// ---------------------------------------------------------------------------

describe("applyPrefixAction('replace')", () => {
  it('swaps the prefix with newPrefix', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'replace', params: { newPrefix: 'BIM_ARC_' } };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('BIM_ARC_Plan_001');
  });

  it('replaces with empty string when newPrefix is empty', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'replace', params: { newPrefix: '' } };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
  });

  it('replaces with empty string when newPrefix is absent (defaults to "")', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'replace', params: {} };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
  });

  it('leaves name unchanged when file does not start with prefix', () => {
    const file = makeFile({ original: 'STR_Beam_001.pdf', cleanedBaseName: 'STR_Beam_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'replace', params: { newPrefix: 'X_' } };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('STR_Beam_001');
  });
});

// ---------------------------------------------------------------------------
// applyPrefixAction — 'map'
// ---------------------------------------------------------------------------

describe("applyPrefixAction('map')", () => {
  it('extracts tokens into mappedFields', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = {
      prefix: 'H3_ARC_',
      action: 'map',
      params: {
        map: [
          { field: 'building', value: 'H3' },
          { field: 'workLot', value: 'ARC' },
        ],
      },
    };
    const { cleanedBaseName, mappedFields } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
    expect(mappedFields.building).toBe('H3');
    expect(mappedFields.workLot).toBe('ARC');
  });

  it('merges with existing mappedFields without clobbering unrelated entries', () => {
    const file = makeFile({
      original: 'H3_ARC_Plan_001.pdf',
      cleanedBaseName: 'H3_ARC_Plan_001',
      mappedFields: { project: 'PROJ01' },
    });
    const rule: PrefixRule = {
      prefix: 'H3_ARC_',
      action: 'map',
      params: { map: [{ field: 'workLot', value: 'ARC' }] },
    };
    const { mappedFields } = applyPrefixAction(file, rule);
    expect(mappedFields.project).toBe('PROJ01');
    expect(mappedFields.workLot).toBe('ARC');
  });

  it('strips prefix from base name when action is map', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf' });
    const rule: PrefixRule = {
      prefix: 'H3_ARC_',
      action: 'map',
      params: { map: [{ field: 'workLot', value: 'ARC' }] },
    };
    const { cleanedBaseName } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
  });

  it('handles map action with no params.map array gracefully', () => {
    const file = makeFile({ original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' });
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'map', params: {} };
    const { cleanedBaseName, mappedFields } = applyPrefixAction(file, rule);
    expect(cleanedBaseName).toBe('Plan_001');
    expect(mappedFields).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// applyPrefixActionBatch
// ---------------------------------------------------------------------------

describe('applyPrefixActionBatch', () => {
  it('applies rule to all matching files and skips non-matching', () => {
    const files: BimFile[] = [
      makeFile({ id: 'a', original: 'H3_ARC_Plan_001.pdf' }),
      makeFile({ id: 'b', original: 'H3_ARC_Plan_002.pdf' }),
      makeFile({ id: 'c', original: 'STR_Beam_001.pdf' }),
    ];
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const result = applyPrefixActionBatch(files, rule);

    expect(result[0].cleanedBaseName).toBe('Plan_001');
    expect(result[1].cleanedBaseName).toBe('Plan_002');
    // STR file is not touched — cleanedBaseName remains null (default from makeFile)
    expect(result[2].cleanedBaseName).toBeNull();
  });

  it('does not mutate the original file objects', () => {
    const original = makeFile({ id: 'a', original: 'H3_ARC_Plan_001.pdf' });
    const files: BimFile[] = [original];
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    applyPrefixActionBatch(files, rule);
    // Original file object is unchanged
    expect(original.cleanedBaseName).toBeNull();
  });

  it('returns a new array (does not mutate the input array)', () => {
    const files: BimFile[] = [makeFile({ id: 'a', original: 'H3_ARC_Plan_001.pdf' })];
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    const result = applyPrefixActionBatch(files, rule);
    expect(result).not.toBe(files);
  });

  it('handles empty files array', () => {
    const rule: PrefixRule = { prefix: 'H3_ARC_', action: 'remove' };
    expect(applyPrefixActionBatch([], rule)).toEqual([]);
  });

  it('applies map action in batch and records field mappings', () => {
    const files: BimFile[] = [
      makeFile({ id: 'a', original: 'H3_ARC_Plan_001.pdf', cleanedBaseName: 'H3_ARC_Plan_001' }),
      makeFile({ id: 'b', original: 'H3_ARC_Plan_002.pdf', cleanedBaseName: 'H3_ARC_Plan_002' }),
    ];
    const rule: PrefixRule = {
      prefix: 'H3_ARC_',
      action: 'map',
      params: { map: [{ field: 'workLot', value: 'ARC' }, { field: 'building', value: 'H3' }] },
    };
    const result = applyPrefixActionBatch(files, rule);
    expect(result[0].mappedFields.workLot).toBe('ARC');
    expect(result[1].mappedFields.building).toBe('H3');
  });
});
