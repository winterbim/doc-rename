/**
 * Property-based fuzz tests for lib/bim public functions.
 *
 * Goal: prove every public function is TOTAL — never throws on any input —
 * and satisfies structural invariants under random data.
 *
 * ~3000+ random inputs exercised per test run via fast-check.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  normalizeBIM,
  validateFilename,
  parseFilename,
} from '../nomenclature';
import { clean, createDefaultState } from '../filename-cleaner';
import {
  detectCategory,
  detectDocumentType,
  detectCompanyInName,
  detectLotFromPath,
} from '../detection';

const arbitraryFilename = fc.string({ minLength: 1, maxLength: 200 });

// ---------------------------------------------------------------------------
// normalizeBIM
// ---------------------------------------------------------------------------

describe('fuzz: nomenclature.normalizeBIM', () => {
  it('never throws on any string', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 500 }), (s) => {
        const out = normalizeBIM(s);
        expect(typeof out).toBe('string');
      }),
      { numRuns: 500 },
    );
  });

  it('is idempotent: normalize(normalize(s)) === normalize(s)', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        expect(normalizeBIM(normalizeBIM(s))).toBe(normalizeBIM(s));
      }),
      { numRuns: 500 },
    );
  });

  it('output is never lowercase (always uppercase or non-alpha)', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const out = normalizeBIM(s);
        // The function calls .toUpperCase() so result === result.toUpperCase()
        expect(out).toBe(out.toUpperCase());
      }),
      { numRuns: 500 },
    );
  });

  it('empty string returns empty string', () => {
    expect(normalizeBIM('')).toBe('');
    expect(normalizeBIM('  ')).toBe('  ');
  });
});

// ---------------------------------------------------------------------------
// validateFilename
// ---------------------------------------------------------------------------

describe('fuzz: validateFilename is total', () => {
  it('never throws on any input', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const result = validateFilename(s);
        expect(typeof result.valid).toBe('boolean');
        expect(Array.isArray(result.errors)).toBe(true);
        expect(Array.isArray(result.warnings)).toBe(true);
      }),
      { numRuns: 500 },
    );
  });

  it('valid field is false iff errors array is non-empty', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = validateFilename(s);
        expect(r.valid).toBe(r.errors.length === 0);
      }),
      { numRuns: 500 },
    );
  });

  it('rejects empty string', () => {
    expect(validateFilename('').valid).toBe(false);
  });

  it('rejects whitespace-only filenames', () => {
    expect(validateFilename('   ').valid).toBe(false);
    expect(validateFilename('\t\n').valid).toBe(false);
  });

  it('rejects each Windows-invalid character', () => {
    for (const ch of '/\\<>:"|?*') {
      expect(validateFilename(`file${ch}.pdf`).valid).toBe(false);
    }
  });

  it('accepts a well-formed BIM filename', () => {
    expect(validateFilename('PRJ_BAT-A_ARCH_PLA_001.PDF').valid).toBe(true);
  });

  it('errors is non-empty for filenames > 255 chars', () => {
    const long = 'A'.repeat(256);
    const r = validateFilename(long);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('warnings for filenames 201-255 chars', () => {
    const medium = 'A'.repeat(210);
    const r = validateFilename(medium);
    expect(r.valid).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// parseFilename
// ---------------------------------------------------------------------------

describe('fuzz: parseFilename is total', () => {
  it('never throws and always returns {baseName, extension}', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = parseFilename(s);
        expect(typeof r.baseName).toBe('string');
        expect(typeof r.extension).toBe('string');
        expect(r.original).toBe(s);
      }),
      { numRuns: 500 },
    );
  });

  it('baseName + extension reconstructs the original string', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = parseFilename(s);
        expect(r.baseName + r.extension).toBe(s);
      }),
      { numRuns: 500 },
    );
  });

  it('extension always starts with dot or is empty', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = parseFilename(s);
        if (r.extension !== '') {
          expect(r.extension[0]).toBe('.');
        }
      }),
      { numRuns: 500 },
    );
  });
});

// ---------------------------------------------------------------------------
// filename-cleaner.clean
// ---------------------------------------------------------------------------

describe('fuzz: filename-cleaner.clean is total + idempotent', () => {
  const state = createDefaultState();

  it('never throws on any input', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = clean(s, state);
        expect(typeof r.cleaned).toBe('string');
        expect(Array.isArray(r.changes)).toBe(true);
        expect(typeof r.hasChanges).toBe('boolean');
      }),
      { numRuns: 300 },
    );
  });

  it('hasChanges === (changes.length > 0)', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = clean(s, state);
        expect(r.hasChanges).toBe(r.changes.length > 0);
      }),
      { numRuns: 300 },
    );
  });

  it('clean is idempotent after one pass', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const once = clean(s, state).cleaned;
        const twice = clean(once, state).cleaned;
        expect(twice).toBe(once);
      }),
      { numRuns: 300 },
    );
  });

  it('returns input unchanged when state.enabled is false', () => {
    const disabledState = { ...state, enabled: false };
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = clean(s, disabledState);
        expect(r.cleaned).toBe(s);
        expect(r.hasChanges).toBe(false);
      }),
      { numRuns: 200 },
    );
  });
});

// ---------------------------------------------------------------------------
// detection helpers
// ---------------------------------------------------------------------------

describe('fuzz: detectCategory is total', () => {
  const validCategories = ['documents', 'cad', 'bim', 'images', 'archives', 'other'];

  it('never throws and always returns a known category', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 20 }), (ext) => {
        const c = detectCategory(ext);
        expect(validCategories).toContain(c);
      }),
      { numRuns: 500 },
    );
  });

  it('returns "other" for empty extension', () => {
    expect(detectCategory('')).toBe('other');
  });
});

describe('fuzz: detectDocumentType is total', () => {
  it('never throws', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = detectDocumentType(s);
        // null or object with required fields
        if (r !== null) {
          expect(typeof r.code).toBe('string');
          expect(typeof r.label).toBe('string');
          expect(['high', 'medium']).toContain(r.confidence);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('returns null for empty string', () => {
    expect(detectDocumentType('')).toBeNull();
  });
});

describe('fuzz: detectCompanyInName is total', () => {
  it('never throws and always returns {company, cleanedBaseName}', () => {
    fc.assert(
      fc.property(arbitraryFilename, (s) => {
        const r = detectCompanyInName(s);
        expect(r).toHaveProperty('company');
        expect(r).toHaveProperty('cleanedBaseName');
        // company is string | null
        if (r.company !== null) expect(typeof r.company).toBe('string');
        // cleanedBaseName is string | null
        if (r.cleanedBaseName !== null)
          expect(typeof r.cleanedBaseName).toBe('string');
      }),
      { numRuns: 500 },
    );
  });

  it('returns null company for completely empty string', () => {
    const r = detectCompanyInName('');
    expect(r.company).toBeNull();
  });
});

describe('fuzz: detectLotFromPath is total', () => {
  it('never throws on any folder/filename pair', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 100 }),
        arbitraryFilename,
        (folder, name) => {
          const r = detectLotFromPath(folder, name);
          // null or a non-empty string
          if (r !== null) {
            expect(typeof r).toBe('string');
            expect(r.length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 500 },
    );
  });

  it('returns null for empty inputs', () => {
    expect(detectLotFromPath('', '')).toBeNull();
  });
});
