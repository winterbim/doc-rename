import { describe, expect, it } from 'vitest';
import { requireEmail, requireRuleJson, requireSlug, requireText } from './validation';

describe('Convex input validation', () => {
  it('normalizes bounded text, slugs, and email addresses', () => {
    expect(requireText('  Mon équipe  ', 'Name', 20)).toBe('Mon équipe');
    expect(requireSlug('  mon-equipe-42 ')).toBe('mon-equipe-42');
    expect(requireEmail('  BIM@Example.COM ')).toBe('bim@example.com');
  });

  it('rejects empty, oversized, and malformed identifiers', () => {
    expect(() => requireText('   ', 'Name', 20)).toThrow(/required/i);
    expect(() => requireText('12345', 'Name', 4)).toThrow(/too long/i);
    expect(() => requireSlug('../admin')).toThrow(/slug/i);
    expect(() => requireEmail('not-an-email')).toThrow(/invalid email/i);
  });

  it('accepts only bounded JSON objects for convention rules', () => {
    expect(requireRuleJson('{"separator":"_"}')).toBe('{"separator":"_"}');
    expect(() => requireRuleJson('[]')).toThrow(/JSON object/i);
    expect(() => requireRuleJson('{broken')).toThrow(/valid JSON/i);
    expect(() => requireRuleJson(JSON.stringify({ value: 'x'.repeat(300_000) }))).toThrow(
      /256 KB/i,
    );
  });
});
