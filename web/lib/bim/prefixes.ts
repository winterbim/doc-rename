/**
 * BIM Prefix Detection & Actions — ported from the legacy browser extension.
 *
 * Stateless pure module — no localStorage, no DOM, no chrome.*, no window.*.
 * Persistence and side-effects are the React layer's responsibility.
 *
 * What was kept from the JS source:
 *   - detectPrefixes: token-split on /[_\s]+/, up to 4-token candidates,
 *     minimum 3 occurrences, deduplicate by longest-wins.
 *   - applyAction semantics: remove / replace / map.
 *   - saveRules / loadRules / onChange / reset — intentionally NOT ported
 *     here (they wrap localStorage and DOM-event side-effects).  They belong
 *     in a React context / zustand store.
 *
 * The public API adds:
 *   - applyPrefixAction  — single-file, returns new values (pure, no mutation)
 *   - applyPrefixActionBatch — batch, returns new array
 */

import type { BimFile, DetectedPrefix, PrefixRule } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Strip the file extension from a filename, identical to the JS source. */
function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, '');
}

/**
 * Token span: the token text plus the index in the source string where it ends.
 * Tracking the end position lets us extract the ACTUAL substring of the source
 * (with its original separators) instead of rejoining with a fixed character.
 */
interface TokenSpan {
  token: string;
  /** Index in the source after the last char of the token. */
  end: number;
}

/**
 * Split a base name into tokens on any of: `_`, `-`, `.`, whitespace.
 * Returns tokens with their end-position in the source so callers can extract
 * the original prefix substring (preserving the source's separators).
 *
 * Examples (separator characters: `_`, `-`, `.`, whitespace):
 *   "H3_ARC_Plan_001"      → [{token:"H3",end:2},{token:"ARC",end:6},{token:"Plan",end:11},{token:"001",end:15}]
 *   "1.2-Mitigeur sur plage" → [{token:"1",end:1},{token:"2",end:3},{token:"Mitigeur",end:12},...]
 *   "SE-HUBLOT H3-RDC-INDICE" → [{token:"SE",end:2},{token:"HUBLOT",end:9},{token:"H3",end:12},...]
 */
function tokenizeWithSpans(base: string): TokenSpan[] {
  const regex = /[^_\s.\-]+/g;
  const result: TokenSpan[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(base)) !== null) {
    result.push({ token: m[0], end: m.index + m[0].length });
  }
  return result;
}

/**
 * Build the candidate prefix as the ACTUAL substring of `base` covering the
 * first `k` tokens, plus the trailing separator character (if any) so the
 * prefix ends on a separator boundary. This preserves the original separators
 * (`-`, `.`, ` `) instead of forcing `_`.
 */
function buildCandidate(base: string, spans: TokenSpan[], k: number): string {
  const end = spans[k - 1].end;
  // Include the separator character that follows the k-th token, if present
  const next = base[end];
  if (next !== undefined && /[_\s.\-]/.test(next)) {
    return base.slice(0, end + 1);
  }
  return base.slice(0, end);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect common filename prefixes (≥3 occurrences) by token-splitting on
 * `_` or whitespace.  Returns up-to-4-token candidates, deduplicated by
 * longest-wins (longest prefix that covers a set of files wins over shorter
 * overlapping prefixes).
 *
 * The `fileIds` field holds the *original filenames* of matching files
 * (capped at 50), matching the JS source's `files` array field.
 *
 * Input accepts either `cleanedBaseName` (preferred, already stripped) or
 * `original` (raw filename with extension) — mirroring the JS source's
 * `f.original || f.name || f` fallback.
 */
export function detectPrefixes(
  files: Pick<BimFile, 'id' | 'original' | 'cleanedBaseName'>[]
): DetectedPrefix[] {
  // Map: candidate prefix → list of original filenames that share it
  const prefixMap = new Map<string, string[]>();

  for (const f of files) {
    const name: string = f.original;
    const base = stripExtension(name);
    const spans = tokenizeWithSpans(base);

    for (let k = 1; k <= Math.min(spans.length, 4); k++) {
      const candidate = buildCandidate(base, spans, k);
      // Skip single-char numeric-only or very short candidates that produce noise
      // ("1." or "A-" alone are too generic and create lots of false positives).
      if (candidate.length < 3) continue;
      const existing = prefixMap.get(candidate);
      if (existing) {
        existing.push(name);
      } else {
        prefixMap.set(candidate, [name]);
      }
    }
  }

  // Filter to ≥3 occurrences, build result objects
  let results: DetectedPrefix[] = [];
  for (const [prefix, names] of prefixMap.entries()) {
    if (names.length >= 3) {
      results.push({
        prefix,
        count: names.length,
        fileIds: names.slice(0, 50),
      });
    }
  }

  // Deduplicate overlapping prefixes: longest prefix wins.
  // Sort by length desc, then count desc — same order as JS source.
  results.sort(
    (a, b) => b.prefix.length - a.prefix.length || b.count - a.count
  );

  const seen = new Set<string>();
  results = results.filter((p) => {
    if (seen.has(p.prefix)) return false;
    seen.add(p.prefix);
    return true;
  });

  return results;
}

/**
 * Compute the result of applying a prefix rule to a single file.
 * Returns a new `cleanedBaseName` and any `mappedFields` entries — does NOT
 * mutate the input.
 *
 * Mirrors the JS source's `applyAction` block inside the `for (const file of affected)` loop.
 */
export function applyPrefixAction(
  file: Pick<BimFile, 'id' | 'original' | 'cleanedBaseName' | 'mappedFields'>,
  rule: PrefixRule
): { cleanedBaseName: string | null; mappedFields: Record<string, string> } {
  const { prefix, action, params = {} } = rule;

  // Compute the base name the same way as the JS source:
  // prefer cleanedBaseName if already set, otherwise strip extension from original.
  const base: string =
    file.cleanedBaseName != null && file.cleanedBaseName !== ''
      ? file.cleanedBaseName
      : stripExtension(file.original);

  // Clone existing mappedFields so we don't mutate the input
  const mappedFields: Record<string, string> = { ...file.mappedFields };

  let cleanedBaseName: string | null;

  if (action === 'remove') {
    // Strip the prefix from the base name
    cleanedBaseName = base.startsWith(prefix)
      ? base.slice(prefix.length)
      : base;
  } else if (action === 'replace') {
    const newPrefix = params.newPrefix ?? '';
    cleanedBaseName = base.startsWith(prefix)
      ? newPrefix + base.slice(prefix.length)
      : base;
  } else if (action === 'map') {
    // Remove prefix from base name, then record field mappings
    cleanedBaseName = base.startsWith(prefix) ? base.slice(prefix.length) : base;

    // JS source expects params.map as Array<{ field, value }>
    if (Array.isArray(params.map)) {
      for (const entry of params.map) {
        if (entry.field) {
          mappedFields[entry.field] = entry.value ?? '';
        }
      }
    }
  } else {
    // Unknown action — return unchanged
    cleanedBaseName = base;
  }

  return { cleanedBaseName, mappedFields };
}

/**
 * Apply a prefix rule to a batch of files.
 * Only files whose `original` filename (or `cleanedBaseName`) starts with
 * the rule's prefix are affected.  Returns a new array — does NOT mutate
 * the input array or any individual file objects.
 */
export function applyPrefixActionBatch(
  files: BimFile[],
  rule: PrefixRule
): BimFile[] {
  return files.map((file) => {
    // Only process files whose effective name starts with the target prefix
    const base =
      file.cleanedBaseName != null && file.cleanedBaseName !== ''
        ? file.cleanedBaseName
        : stripExtension(file.original);

    if (!base.startsWith(rule.prefix)) {
      return file; // unaffected — return reference unchanged
    }

    const { cleanedBaseName, mappedFields } = applyPrefixAction(file, rule);
    return { ...file, cleanedBaseName, mappedFields };
  });
}
