export const ACCESS_COOKIE_NAME = 'doc_rename_access';
const ACCESS_COOKIE_VALUE = 'doc-rename-private-access-v1';

export function getAccessPassword(): string | null {
  return process.env.DOC_RENAME_ACCESS_PASSWORD?.trim() || null;
}

export function isAccessProtectionEnabled(): boolean {
  return getAccessPassword() !== null;
}

export function isValidAccessPassword(value: FormDataEntryValue | null): boolean {
  const password = getAccessPassword();
  return Boolean(password && typeof value === 'string' && value === password);
}

export function isValidAccessCookie(value: string | undefined): boolean {
  return isAccessProtectionEnabled() && value === ACCESS_COOKIE_VALUE;
}

export function getAccessCookieValue(): string {
  return ACCESS_COOKIE_VALUE;
}

export function normalizeNextPath(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/app';
  }

  if (value === '/access' || value.startsWith('/access?') || value.startsWith('/api/access')) {
    return '/app';
  }

  return value;
}
