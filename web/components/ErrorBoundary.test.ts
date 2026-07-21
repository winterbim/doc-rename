import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appendErrorEntry, getErrorLog } from './ErrorBoundary';

describe('local error journal privacy', () => {
  beforeEach(() => localStorage.clear());

  it('redacts filenames, email and URL query values', () => {
    appendErrorEntry({
      id: 'e1',
      ts: new Date().toISOString(),
      message: 'Impossible de lire secret-client.pdf pour camille@example.com',
      stack: 'at parse(secret-client.pdf:1)',
      ua: 'test',
      url: 'https://rename.example/app?file=secret-client.pdf#preview',
    });
    const [entry] = getErrorLog();
    expect(entry.message).not.toContain('secret-client.pdf');
    expect(entry.message).not.toContain('camille@example.com');
    expect(entry.url).toBe('https://rename.example/app');
  });

  it('expires entries older than seven days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-21T12:00:00Z'));
    localStorage.setItem('bimdoc_error_log', JSON.stringify([{
      id: 'old',
      ts: '2026-07-01T12:00:00Z',
      message: 'old',
      ua: 'test',
      url: 'https://rename.example/app',
    }]));
    expect(getErrorLog()).toEqual([]);
    vi.useRealTimers();
  });
});
