import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

export const ACCESS_COOKIE_NAME = 'doc_rename_access';
const ACCESS_COOKIE_MAX_AGE_SECONDS = 8 * 60 * 60;

function safeEqual(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left).digest();
  const rightDigest = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function accessSignature(expiresAt: string, password: string): string {
  return createHmac('sha256', password).update(`bimcheck-access:${expiresAt}`).digest('base64url');
}

export function getAccessPassword(): string | null {
  return process.env.DOC_RENAME_ACCESS_PASSWORD?.trim() || null;
}

export function isAccessProtectionEnabled(): boolean {
  return getAccessPassword() !== null;
}

export function isValidAccessPassword(value: FormDataEntryValue | null): boolean {
  const password = getAccessPassword();
  return Boolean(password && typeof value === 'string' && safeEqual(value, password));
}

export function isValidAccessCookie(value: string | undefined, now = Date.now()): boolean {
  const password = getAccessPassword();
  if (!password || !value) return false;
  const [expiresAt, signature, ...rest] = value.split('.');
  if (!expiresAt || !signature || rest.length > 0 || !/^\d+$/.test(expiresAt)) return false;
  const expiry = Number(expiresAt);
  const maximumFuture = now + ACCESS_COOKIE_MAX_AGE_SECONDS * 1_000 + 60_000;
  if (!Number.isSafeInteger(expiry) || expiry <= now || expiry > maximumFuture) return false;
  return safeEqual(signature, accessSignature(expiresAt, password));
}

export function getAccessCookieValue(now = Date.now()): string {
  const password = getAccessPassword();
  if (!password) throw new Error('Private access is not configured');
  const expiresAt = String(now + ACCESS_COOKIE_MAX_AGE_SECONDS * 1_000);
  return `${expiresAt}.${accessSignature(expiresAt, password)}`;
}

export function normalizeNextPath(value: FormDataEntryValue | string | null | undefined): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  ) {
    return '/app';
  }

  let normalized: string;
  try {
    const base = new URL('https://bimcheck.invalid');
    const resolved = new URL(value, base);
    if (resolved.origin !== base.origin) return '/app';
    normalized = `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return '/app';
  }

  if (
    normalized === '/access' ||
    normalized.startsWith('/access?') ||
    normalized.startsWith('/api/access')
  ) {
    return '/app';
  }

  return normalized;
}
