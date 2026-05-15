import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  LruCache,
  getObjectUrl,
  clearViewerCacheFor,
  clearAllViewerCaches,
  setDocxCache,
  getDocxCache,
  setDxfSvgCache,
  getDxfSvgCache,
  setTextCache,
  getTextCache,
  setSpreadsheetCache,
  getSpreadsheetCache,
} from './viewer-cache';

// ---------------------------------------------------------------------------
// LruCache unit tests
// ---------------------------------------------------------------------------

describe('LruCache — core behaviour', () => {
  it('stores and retrieves values', () => {
    const c = new LruCache<string>(3);
    c.set('a', 'alpha');
    expect(c.get('a')).toBe('alpha');
  });

  it('returns undefined for missing keys', () => {
    const c = new LruCache<string>(3);
    expect(c.get('missing')).toBeUndefined();
  });

  it('reports correct size', () => {
    const c = new LruCache<number>(10);
    c.set('x', 1);
    c.set('y', 2);
    expect(c.size()).toBe(2);
  });

  it('has() returns true/false correctly', () => {
    const c = new LruCache<string>(5);
    c.set('k', 'v');
    expect(c.has('k')).toBe(true);
    expect(c.has('missing')).toBe(false);
  });

  it('evicts the oldest entry when capacity is exceeded', () => {
    const c = new LruCache<number>(3);
    c.set('a', 1);
    c.set('b', 2);
    c.set('c', 3);
    // 'a' is LRU; adding 'd' should evict it
    c.set('d', 4);
    expect(c.get('a')).toBeUndefined();
    expect(c.get('b')).toBe(2);
    expect(c.get('c')).toBe(3);
    expect(c.get('d')).toBe(4);
    expect(c.size()).toBe(3);
  });

  it('get() refreshes recency so recently-used entries survive eviction', () => {
    const c = new LruCache<number>(3);
    c.set('a', 1);
    c.set('b', 2);
    c.set('c', 3);
    // Access 'a' to make it most recently used
    c.get('a');
    // 'b' is now the LRU; adding 'd' should evict it
    c.set('d', 4);
    expect(c.get('b')).toBeUndefined();
    expect(c.get('a')).toBe(1);
  });

  it('delete() removes an entry and returns true', () => {
    const c = new LruCache<string>(5);
    c.set('k', 'v');
    expect(c.delete('k')).toBe(true);
    expect(c.has('k')).toBe(false);
    expect(c.size()).toBe(0);
  });

  it('delete() returns false for missing key', () => {
    const c = new LruCache<string>(5);
    expect(c.delete('nope')).toBe(false);
  });

  it('clear() empties the cache', () => {
    const c = new LruCache<number>(5);
    c.set('a', 1);
    c.set('b', 2);
    c.clear();
    expect(c.size()).toBe(0);
    expect(c.get('a')).toBeUndefined();
  });

  it('values() iterates all stored values', () => {
    const c = new LruCache<string>(5);
    c.set('a', 'alpha');
    c.set('b', 'beta');
    expect([...c.values()].sort()).toEqual(['alpha', 'beta']);
  });

  it('overwrites existing key without growing size', () => {
    const c = new LruCache<number>(5);
    c.set('a', 1);
    c.set('a', 2);
    expect(c.size()).toBe(1);
    expect(c.get('a')).toBe(2);
  });
});

describe('LruCache — onEvict callback', () => {
  it('calls onEvict when LRU entry is evicted by capacity', () => {
    const evicted: number[] = [];
    const c = new LruCache<number>(2, (v) => evicted.push(v));
    c.set('a', 1);
    c.set('b', 2);
    c.set('c', 3); // 'a' (value 1) is evicted
    expect(evicted).toEqual([1]);
  });

  it('calls onEvict when delete() is called', () => {
    const evicted: string[] = [];
    const c = new LruCache<string>(5, (v) => evicted.push(v));
    c.set('k', 'foo');
    c.delete('k');
    expect(evicted).toEqual(['foo']);
  });

  it('calls onEvict for all entries on clear()', () => {
    const evicted: string[] = [];
    const c = new LruCache<string>(5, (v) => evicted.push(v));
    c.set('a', 'alpha');
    c.set('b', 'beta');
    c.clear();
    expect(evicted.sort()).toEqual(['alpha', 'beta']);
  });

  it('calls onEvict with old value when overwriting same key with different value', () => {
    const evicted: string[] = [];
    const c = new LruCache<string>(5, (v) => evicted.push(v));
    c.set('k', 'old');
    c.set('k', 'new');
    expect(evicted).toEqual(['old']);
    expect(c.get('k')).toBe('new');
  });

  it('does NOT call onEvict when overwriting same key with same value', () => {
    const evicted: string[] = [];
    const c = new LruCache<string>(5, (v) => evicted.push(v));
    c.set('k', 'same');
    c.set('k', 'same');
    expect(evicted).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// objectUrlCache integration tests (via the module-level public functions)
// ---------------------------------------------------------------------------

describe('objectUrlCache — URL revocation', () => {
  let revokeSpy: ReturnType<typeof vi.spyOn>;
  let createSpy: ReturnType<typeof vi.spyOn>;
  let urlCounter = 0;

  beforeEach(() => {
    urlCounter = 0;
    revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(
      () => `blob:mock-url-${++urlCounter}`,
    );
    // Clear caches between tests
    clearAllViewerCaches();
    revokeSpy.mockClear();
    createSpy.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getObjectUrl creates and caches a URL on first call', () => {
    const blob = new Blob(['data'], { type: 'text/plain' });
    const url = getObjectUrl('file1', blob);
    expect(url).toMatch(/^blob:/);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('getObjectUrl returns cached URL on subsequent calls', () => {
    const blob = new Blob(['data'], { type: 'text/plain' });
    const url1 = getObjectUrl('file1', blob);
    const url2 = getObjectUrl('file1', blob);
    expect(url1).toBe(url2);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('clearViewerCacheFor revokes the URL', () => {
    const blob = new Blob(['data'], { type: 'text/plain' });
    const url = getObjectUrl('file1', blob);
    clearViewerCacheFor('file1');
    expect(revokeSpy).toHaveBeenCalledWith(url);
  });

  it('clearAllViewerCaches revokes all cached URLs', () => {
    const blob = new Blob(['d'], { type: 'text/plain' });
    const url1 = getObjectUrl('file1', blob);
    const url2 = getObjectUrl('file2', blob);
    clearAllViewerCaches();
    expect(revokeSpy).toHaveBeenCalledWith(url1);
    expect(revokeSpy).toHaveBeenCalledWith(url2);
    expect(revokeSpy).toHaveBeenCalledTimes(2);
  });

  it('after clearAllViewerCaches, getObjectUrl creates a new URL', () => {
    const blob = new Blob(['d'], { type: 'text/plain' });
    getObjectUrl('file1', blob);
    clearAllViewerCaches();
    createSpy.mockClear();
    getObjectUrl('file1', blob);
    expect(createSpy).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Other cache getters/setters
// ---------------------------------------------------------------------------

describe('docxCache', () => {
  beforeEach(() => clearAllViewerCaches());

  it('set and get round-trips the entry', () => {
    setDocxCache('f1', { html: '<p>hello</p>', warnings: [] });
    expect(getDocxCache('f1')).toEqual({ html: '<p>hello</p>', warnings: [] });
  });

  it('returns undefined for unknown fileId', () => {
    expect(getDocxCache('unknown')).toBeUndefined();
  });

  it('is cleared by clearViewerCacheFor', () => {
    setDocxCache('f1', { html: 'x', warnings: [] });
    clearViewerCacheFor('f1');
    expect(getDocxCache('f1')).toBeUndefined();
  });
});

describe('dxfSvgCache', () => {
  beforeEach(() => clearAllViewerCaches());

  it('set and get round-trips the SVG string', () => {
    setDxfSvgCache('f2', '<svg/>');
    expect(getDxfSvgCache('f2')).toBe('<svg/>');
  });

  it('is cleared by clearViewerCacheFor', () => {
    setDxfSvgCache('f2', '<svg/>');
    clearViewerCacheFor('f2');
    expect(getDxfSvgCache('f2')).toBeUndefined();
  });
});

describe('textCache', () => {
  beforeEach(() => clearAllViewerCaches());

  it('set and get round-trips the text', () => {
    setTextCache('f3', 'hello world');
    expect(getTextCache('f3')).toBe('hello world');
  });

  it('is cleared by clearViewerCacheFor', () => {
    setTextCache('f3', 'hi');
    clearViewerCacheFor('f3');
    expect(getTextCache('f3')).toBeUndefined();
  });
});

describe('spreadsheetCache', () => {
  beforeEach(() => clearAllViewerCaches());

  it('set and get round-trips the entry', () => {
    const entry = { sheets: [{ name: 'Sheet1', html: '<table/>' }] };
    setSpreadsheetCache('f4', entry);
    expect(getSpreadsheetCache('f4')).toEqual(entry);
  });

  it('is cleared by clearViewerCacheFor', () => {
    setSpreadsheetCache('f4', { sheets: [] });
    clearViewerCacheFor('f4');
    expect(getSpreadsheetCache('f4')).toBeUndefined();
  });
});
