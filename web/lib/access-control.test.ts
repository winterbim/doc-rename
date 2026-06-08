import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getAccessPassword,
  isAccessProtectionEnabled,
  isValidAccessCookie,
  isValidAccessPassword,
  normalizeNextPath,
} from './access-control';

describe('access-control', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps private access disabled when no password is configured', () => {
    vi.stubEnv('DOC_RENAME_ACCESS_PASSWORD', '');

    expect(getAccessPassword()).toBeNull();
    expect(isAccessProtectionEnabled()).toBe(false);
    expect(isValidAccessCookie('doc-rename-private-access-v1')).toBe(false);
  });

  it('validates the configured private access password', () => {
    vi.stubEnv('DOC_RENAME_ACCESS_PASSWORD', 'secret-demo');

    expect(isAccessProtectionEnabled()).toBe(true);
    expect(isValidAccessPassword('secret-demo')).toBe(true);
    expect(isValidAccessPassword('wrong')).toBe(false);
  });

  it('normalizes unsafe next paths back to the app', () => {
    expect(normalizeNextPath('https://example.com')).toBe('/app');
    expect(normalizeNextPath('//example.com')).toBe('/app');
    expect(normalizeNextPath('/api/access')).toBe('/app');
    expect(normalizeNextPath('/app')).toBe('/app');
  });
});
