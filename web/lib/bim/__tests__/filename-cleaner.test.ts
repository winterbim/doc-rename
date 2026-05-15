/**
 * Tests for lib/bim/filename-cleaner.ts
 * Every public function + every algorithm branch + edge cases.
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultState,
  clean,
  cleanAll,
  preview,
  addReplacementRule,
  removeReplacementRule,
  toggleRule,
  addWordToRemove,
  removeWordFromList,
  exportState,
  importState,
  type CleanerState,
} from '../filename-cleaner';

// ---------------------------------------------------------------------------
// createDefaultState
// ---------------------------------------------------------------------------

describe('createDefaultState', () => {
  it('enabled is true', () => {
    const state = createDefaultState();
    expect(state.enabled).toBe(true);
  });

  it('has ≥100 spelling corrections (source has 133 entries, ~121 unique keys)', () => {
    const state = createDefaultState();
    // The JS source comment says "150+" but actual unique keys = 121-133 depending
    // on how JS resolves duplicate object keys. We assert ≥100 as a meaningful bound.
    expect(Object.keys(state.spellingCorrections).length).toBeGreaterThanOrEqual(100);
  });

  it('has ≥25 default words to remove', () => {
    const state = createDefaultState();
    expect(state.wordsToRemove.length).toBeGreaterThanOrEqual(25);
  });

  it('replacementRules is empty', () => {
    const state = createDefaultState();
    expect(state.replacementRules).toHaveLength(0);
  });

  it('returns a new state on each call (not the same reference)', () => {
    const s1 = createDefaultState();
    const s2 = createDefaultState();
    expect(s1).not.toBe(s2);
    expect(s1.wordsToRemove).not.toBe(s2.wordsToRemove);
  });

  it('options has applySpelling=true by default', () => {
    expect(createDefaultState().options.applySpelling).toBe(true);
  });

  it('options has normalizeAccents=false by default', () => {
    expect(createDefaultState().options.normalizeAccents).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clean — disabled state
// ---------------------------------------------------------------------------

describe('clean (disabled state)', () => {
  it('returns original unchanged when disabled', () => {
    const state: CleanerState = { ...createDefaultState(), enabled: false };
    const r = clean('copie_plan.pdf', state);
    expect(r.cleaned).toBe('copie_plan.pdf');
    expect(r.hasChanges).toBe(false);
    expect(r.changes).toHaveLength(0);
  });

  it('force option bypasses disabled state', () => {
    const state: CleanerState = { ...createDefaultState(), enabled: false };
    const r = clean('copie_plan.pdf', state, { force: true });
    // "copie" is in wordsToRemove → should be removed
    expect(r.cleaned).not.toBe('copie_plan.pdf');
  });
});

// ---------------------------------------------------------------------------
// clean — empty / passthrough
// ---------------------------------------------------------------------------

describe('clean — empty/passthrough', () => {
  it('empty string → empty result, no changes', () => {
    const state = createDefaultState();
    const r = clean('', state);
    expect(r.cleaned).toBe('');
    expect(r.hasChanges).toBe(false);
  });

  it('filename with no matching rules returns unchanged', () => {
    const state = createDefaultState();
    const r = clean('XYZ_TOTALLY_UNKNOWN_TOKEN.pdf', state);
    // None of the defaults should match
    expect(r.cleaned).toBe('XYZ_TOTALLY_UNKNOWN_TOKEN.pdf');
    expect(r.hasChanges).toBe(false);
  });

  it('hasChanges is true when at least one change applied', () => {
    const state = createDefaultState();
    const r = clean('copie_plan.pdf', state);
    expect(r.hasChanges).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// clean — word removal
// ---------------------------------------------------------------------------

describe('clean — word removal', () => {
  const state = createDefaultState();

  it('removes "copie"', () => {
    const r = clean('plan_copie.pdf', state);
    expect(r.cleaned).not.toContain('copie');
  });

  it('removes "draft"', () => {
    const r = clean('plan_draft.pdf', state);
    expect(r.cleaned).not.toContain('draft');
  });

  it('removes "temp"', () => {
    const r = clean('plan_temp.pdf', state);
    expect(r.cleaned).not.toContain('temp');
  });

  it('has "_v1" in the default words-to-remove list', () => {
    // Note: the source word "_v1" starts with "_" which is also a separator char.
    // The removal regex wraps it: (^|sep)_v1(sep|$) → requires double-sep in
    // typical filenames. The source has this same quirk. We verify list membership.
    expect(state.wordsToRemove).toContain('_v1');
  });

  it('has "_v2" in the default words-to-remove list', () => {
    expect(state.wordsToRemove).toContain('_v2');
  });

  it('removes "_old"', () => {
    const r = clean('plan_old.pdf', state);
    expect(r.cleaned).not.toContain('_old');
  });

  it('removes "backup"', () => {
    const r = clean('plan_backup.pdf', state);
    expect(r.cleaned).not.toContain('backup');
  });

  it('removes (1) numeric suffix', () => {
    const r = clean('plan (1).pdf', state);
    expect(r.cleaned).not.toContain('(1)');
  });

  it('records a change entry for each removed word', () => {
    const r = clean('doc_draft.pdf', state);
    const removeChanges = r.changes.filter((c) => c.type === 'remove');
    expect(removeChanges.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// clean — spelling corrections
// ---------------------------------------------------------------------------

describe('clean — spelling corrections', () => {
  const state = createDefaultState();

  it('corrects "detial" → "detail"', () => {
    const r = clean('plan_detial.pdf', state);
    expect(r.cleaned.toLowerCase()).toContain('detail');
  });

  it('corrects "facde" → "facade"', () => {
    const r = clean('plan_facde.pdf', state);
    expect(r.cleaned.toLowerCase()).toContain('facade');
  });

  it('corrects "rapoprt" → "rapport"', () => {
    const r = clean('rapoprt_final.pdf', state);
    expect(r.cleaned.toLowerCase()).toContain('rapport');
  });

  it('preserves uppercase if original was all-caps', () => {
    const r = clean('DETIAL_FACADE.pdf', state);
    // DETIAL → DETAIL (uppercased)
    expect(r.cleaned).toContain('DETAIL');
  });

  it('records a change entry of type "spelling"', () => {
    const r = clean('plan_detial.pdf', state);
    const sc = r.changes.filter((c) => c.type === 'spelling');
    expect(sc.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// clean — accent normalization
// ---------------------------------------------------------------------------

describe('clean — accent normalization', () => {
  it('does not normalize accents by default', () => {
    const state = createDefaultState();
    const r = clean('Plan_étage1_corrigé.pdf', state);
    expect(r.cleaned).toContain('é');
  });

  it('normalizes accents when option is enabled', () => {
    const state: CleanerState = {
      ...createDefaultState(),
      options: { ...createDefaultState().options, normalizeAccents: true },
    };
    const r = clean('Plan_étage1_corrigé.pdf', state);
    expect(r.cleaned).not.toContain('é');
    expect(r.cleaned.toLowerCase()).toContain('etage');
  });

  it('normalizes via per-call override', () => {
    const state = createDefaultState();
    const r = clean('Plan_étage1.pdf', state, { normalizeAccents: true });
    expect(r.cleaned).not.toContain('é');
  });

  it('records change of type "accent"', () => {
    const state = createDefaultState();
    const r = clean('Plan_étage1.pdf', state, { normalizeAccents: true });
    const ac = r.changes.filter((c) => c.type === 'accent');
    expect(ac.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// clean — replacement rules
// ---------------------------------------------------------------------------

describe('clean — replacement rules', () => {
  it('applies a simple string rule', () => {
    // Use a word not in the default remove list ("BATIMENT" → "STRUCTURE")
    // to avoid the word-removal step consuming it before the rule runs.
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: 'BATIMENT',
      replace: 'STRUCTURE',
      isRegex: false,
      caseSensitive: false,
      enabled: true,
    });
    const r = clean('PLAN_BATIMENT_001.pdf', state);
    expect(r.cleaned).toContain('STRUCTURE');
    expect(r.cleaned).not.toContain('BATIMENT');
  });

  it('applies a regex rule: /(_v\\d+)$/ removes version suffix', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: '_v\\d+$',
      replace: '',
      isRegex: true,
      caseSensitive: false,
      enabled: true,
    });
    const r = clean('PLAN_FACADE_v3.pdf', state);
    expect(r.cleaned).not.toContain('_v3');
    expect(r.cleaned).toContain('PLAN_FACADE');
  });

  it('respects caseSensitive=true — does NOT match wrong case', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: 'plan',
      replace: 'PLAN',
      isRegex: false,
      caseSensitive: true, // case sensitive
      enabled: true,
    });
    // "PLAN" (uppercase) should NOT be matched by "plan" case-sensitively
    const r = clean('PLAN_FACADE.pdf', state);
    // No change applied from the rule (PLAN ≠ plan case-sensitively)
    const ruleChanges = r.changes.filter((c) => c.type === 'rule');
    expect(ruleChanges).toHaveLength(0);
  });

  it('respects caseSensitive=false — matches any case', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: 'plan',
      replace: 'DOC',
      isRegex: false,
      caseSensitive: false,
      enabled: true,
    });
    const r = clean('PLAN_FACADE.pdf', state);
    expect(r.cleaned).toContain('DOC');
  });

  it('disabled rules are skipped', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: 'PLAN',
      replace: 'DOC',
      isRegex: false,
      caseSensitive: true,
      enabled: false, // disabled
    });
    const r = clean('PLAN_001.pdf', state);
    // Rule is disabled → PLAN remains
    const ruleChanges = r.changes.filter((c) => c.type === 'rule');
    expect(ruleChanges).toHaveLength(0);
  });

  it('invalid regex does not throw — just skips the rule', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: '[invalid(', // invalid regex
      replace: '',
      isRegex: true,
      caseSensitive: false,
      enabled: true,
    });
    expect(() => clean('PLAN.pdf', state)).not.toThrow();
  });

  it('records a change entry of type "rule"', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, {
      find: 'PLAN',
      replace: 'DOC',
      isRegex: false,
      caseSensitive: false,
      enabled: true,
    });
    const r = clean('PLAN_001.pdf', state);
    const rc = r.changes.filter((c) => c.type === 'rule');
    expect(rc.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// clean — cleanup patterns
// ---------------------------------------------------------------------------

describe('clean — cleanup patterns', () => {
  it('collapses multiple underscores', () => {
    const state = createDefaultState();
    // Directly test cleanup by disabling other steps
    const r = clean('PLAN___FACADE.pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    expect(r.cleaned).toBe('PLAN_FACADE.pdf');
  });

  it('collapses multiple hyphens', () => {
    const state = createDefaultState();
    const r = clean('PLAN---FACADE.pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    expect(r.cleaned).toBe('PLAN-FACADE.pdf');
  });

  it('strips leading/trailing underscores from baseName', () => {
    const state = createDefaultState();
    const r = clean('_PLAN_.pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    expect(r.cleaned).toBe('PLAN.pdf');
  });

  it('collapses multiple spaces', () => {
    const state = createDefaultState();
    const r = clean('PLAN  FACADE.pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    expect(r.cleaned).toBe('PLAN FACADE.pdf');
  });

  it('removes (1) numeric suffix', () => {
    const state = createDefaultState();
    const r = clean('PLAN (1).pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    expect(r.cleaned).not.toContain('(1)');
  });

  it('records a change entry of type "cleanup"', () => {
    const state = createDefaultState();
    const r = clean('PLAN___001.pdf', state, { applySpelling: false, removeWords: false, applyRules: false });
    const cc = r.changes.filter((c) => c.type === 'cleanup');
    expect(cc.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// preview
// ---------------------------------------------------------------------------

describe('preview', () => {
  it('bypasses disabled state (mirrors FilenameCleaner.preview)', () => {
    const state: CleanerState = { ...createDefaultState(), enabled: false };
    const r = preview('copie_plan.pdf', state);
    // Even disabled, force=true is set internally
    expect(r.cleaned).not.toBe('copie_plan.pdf');
  });

  it('returns same result as clean with force=true', () => {
    const state = createDefaultState();
    const cleanResult = clean('copie_plan.pdf', state, { force: true });
    const previewResult = preview('copie_plan.pdf', state);
    expect(previewResult.cleaned).toBe(cleanResult.cleaned);
  });
});

// ---------------------------------------------------------------------------
// cleanAll
// ---------------------------------------------------------------------------

describe('cleanAll', () => {
  it('processes a batch of 5 filenames', () => {
    const state = createDefaultState();
    const filenames = [
      'plan_copie.pdf',
      'schema_draft.pdf',
      'facade_temp.pdf',
      'detail_backup.pdf',
      'report_old.pdf',
    ];
    const results = cleanAll(filenames, state);
    expect(results).toHaveLength(5);
    results.forEach((r) => {
      expect(r).toHaveProperty('cleaned');
      expect(r).toHaveProperty('changes');
      expect(r).toHaveProperty('hasChanges');
    });
  });

  it('each result corresponds to the matching input filename', () => {
    const state = createDefaultState();
    const results = cleanAll(['a.pdf', 'b.pdf'], state);
    // Neither 'a' nor 'b' should trigger any changes
    expect(results[0].cleaned).toBe('a.pdf');
    expect(results[1].cleaned).toBe('b.pdf');
  });
});

// ---------------------------------------------------------------------------
// addReplacementRule / removeReplacementRule — immutability
// ---------------------------------------------------------------------------

describe('addReplacementRule / removeReplacementRule', () => {
  it('addReplacementRule returns a new state object (original unchanged)', () => {
    const state = createDefaultState();
    const newState = addReplacementRule(state, {
      find: 'X',
      replace: 'Y',
      isRegex: false,
      caseSensitive: false,
      enabled: true,
    });
    // Original state is untouched
    expect(state.replacementRules).toHaveLength(0);
    expect(newState.replacementRules).toHaveLength(1);
    expect(newState).not.toBe(state);
  });

  it('addReplacementRule assigns a unique id', () => {
    const state = createDefaultState();
    const s1 = addReplacementRule(state, { find: 'A', replace: 'B', isRegex: false, caseSensitive: false, enabled: true });
    const s2 = addReplacementRule(s1, { find: 'C', replace: 'D', isRegex: false, caseSensitive: false, enabled: true });
    const ids = s2.replacementRules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length); // all unique
  });

  it('removeReplacementRule returns new state without the rule', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, { find: 'A', replace: 'B', isRegex: false, caseSensitive: false, enabled: true });
    const ruleId = state.replacementRules[0].id;
    const newState = removeReplacementRule(state, ruleId);
    expect(state.replacementRules).toHaveLength(1); // original unchanged
    expect(newState.replacementRules).toHaveLength(0);
  });

  it('removeReplacementRule with unknown id returns unchanged state', () => {
    const state = createDefaultState();
    const newState = removeReplacementRule(state, 'nonexistent');
    expect(newState.replacementRules).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// toggleRule
// ---------------------------------------------------------------------------

describe('toggleRule', () => {
  it('disables an enabled rule', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, { find: 'A', replace: 'B', isRegex: false, caseSensitive: false, enabled: true });
    const id = state.replacementRules[0].id;
    const newState = toggleRule(state, id, false);
    expect(newState.replacementRules[0].enabled).toBe(false);
  });

  it('enables a disabled rule', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, { find: 'A', replace: 'B', isRegex: false, caseSensitive: false, enabled: false });
    const id = state.replacementRules[0].id;
    const newState = toggleRule(state, id, true);
    expect(newState.replacementRules[0].enabled).toBe(true);
  });

  it('returns new state (original unchanged)', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, { find: 'A', replace: 'B', isRegex: false, caseSensitive: false, enabled: true });
    const id = state.replacementRules[0].id;
    toggleRule(state, id, false);
    // Original state rule still enabled
    expect(state.replacementRules[0].enabled).toBe(true);
  });

  it('silently ignores unknown ruleId', () => {
    const state = createDefaultState();
    const newState = toggleRule(state, 'unknown', false);
    expect(newState.replacementRules).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// addWordToRemove / removeWordFromList
// ---------------------------------------------------------------------------

describe('addWordToRemove / removeWordFromList', () => {
  it('addWordToRemove adds a new word (lowercased)', () => {
    const state = createDefaultState();
    const newState = addWordToRemove(state, 'BROUILLON');
    expect(newState.wordsToRemove).toContain('brouillon');
  });

  it('addWordToRemove does not add duplicates', () => {
    const state = createDefaultState();
    const s1 = addWordToRemove(state, 'brouillon');
    const s2 = addWordToRemove(s1, 'BROUILLON');
    const count = s2.wordsToRemove.filter((w) => w === 'brouillon').length;
    expect(count).toBe(1);
  });

  it('addWordToRemove returns same state on duplicate', () => {
    const state = createDefaultState();
    // 'copy' is already in defaults
    const newState = addWordToRemove(state, 'copy');
    expect(newState).toBe(state); // same reference — no change
  });

  it('addWordToRemove returns new state (original unchanged)', () => {
    const state = createDefaultState();
    const before = state.wordsToRemove.length;
    const newState = addWordToRemove(state, 'uniqueword_xyz');
    expect(state.wordsToRemove.length).toBe(before);
    expect(newState.wordsToRemove.length).toBe(before + 1);
  });

  it('removeWordFromList removes the word', () => {
    const state = createDefaultState();
    // 'copy' is in defaults
    const newState = removeWordFromList(state, 'copy');
    expect(newState.wordsToRemove).not.toContain('copy');
  });

  it('removeWordFromList is case-insensitive', () => {
    const state = createDefaultState();
    const newState = removeWordFromList(state, 'COPY');
    expect(newState.wordsToRemove).not.toContain('copy');
  });

  it('removeWordFromList returns new state (original unchanged)', () => {
    const state = createDefaultState();
    removeWordFromList(state, 'copy');
    expect(state.wordsToRemove).toContain('copy');
  });

  it('removeWordFromList on absent word returns equivalent state', () => {
    const state = createDefaultState();
    const newState = removeWordFromList(state, 'nonexistentword_xyz');
    expect(newState.wordsToRemove).toEqual(state.wordsToRemove);
  });
});

// ---------------------------------------------------------------------------
// exportState / importState — round-trip
// ---------------------------------------------------------------------------

describe('exportState / importState', () => {
  it('round-trip preserves enabled flag', () => {
    const state = createDefaultState();
    const json = exportState(state);
    const restored = importState(json);
    expect(restored.enabled).toBe(state.enabled);
  });

  it('round-trip preserves replacementRules', () => {
    let state = createDefaultState();
    state = addReplacementRule(state, { find: 'X', replace: 'Y', isRegex: false, caseSensitive: false, enabled: true });
    const json = exportState(state);
    const restored = importState(json);
    expect(restored.replacementRules).toHaveLength(1);
    expect(restored.replacementRules[0].find).toBe('X');
  });

  it('round-trip preserves wordsToRemove', () => {
    const state = addWordToRemove(createDefaultState(), 'custom_word_xyz');
    const json = exportState(state);
    const restored = importState(json);
    expect(restored.wordsToRemove).toContain('custom_word_xyz');
  });

  it('round-trip preserves spellingCorrections', () => {
    const state = createDefaultState();
    const json = exportState(state);
    const restored = importState(json);
    expect(Object.keys(restored.spellingCorrections).length).toBeGreaterThanOrEqual(100);
  });

  it('round-trip preserves options', () => {
    const state: CleanerState = {
      ...createDefaultState(),
      options: { applySpelling: false, removeWords: true, applyRules: true, applyCleanup: false, normalizeAccents: true },
    };
    const restored = importState(exportState(state));
    expect(restored.options.applySpelling).toBe(false);
    expect(restored.options.normalizeAccents).toBe(true);
  });

  it('invalid JSON throws (caller catches)', () => {
    expect(() => importState('{not valid json')).toThrow();
  });

  it('valid JSON but wrong shape → throws', () => {
    expect(() => importState('"just a string"')).toThrow();
  });

  it('exportState produces valid JSON string', () => {
    const json = exportState(createDefaultState());
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
