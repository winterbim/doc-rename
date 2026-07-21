const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function requireText(value: string, label: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required`);
  if (normalized.length > maxLength) throw new Error(`${label} is too long`);
  return normalized;
}

export function requireEmail(value: string): string {
  const normalized = requireText(value, 'Email', 254).toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) throw new Error('Invalid email address');
  return normalized;
}

export function requireSlug(value: string): string {
  const normalized = requireText(value, 'Slug', 64).toLowerCase();
  if (normalized.length < 3 || !SLUG_PATTERN.test(normalized)) {
    throw new Error('Slug must contain 3–64 lowercase letters, digits, or single hyphens');
  }
  return normalized;
}

export function requireRuleJson(value: string): string {
  if (new TextEncoder().encode(value).byteLength > 256 * 1024) {
    throw new Error('Convention rules exceed the 256 KB limit');
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Convention rules must be a JSON object');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Convention rules must be a JSON object') {
      throw error;
    }
    throw new Error('Convention rules must be valid JSON');
  }
  return value;
}
