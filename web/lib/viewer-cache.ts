/**
 * Per-file caches for viewer outputs. Keyed by file id (BimFile.id).
 * Cleared when a file is removed from state — wire that via a side-effect hook
 * in RenamerShell (useViewerCacheCleanup).
 *
 * All caches are bounded LRUs to prevent unbounded heap growth when users
 * open large numbers of files in one session.
 */

// ---------------------------------------------------------------------------
// LruCache
// ---------------------------------------------------------------------------

/**
 * Minimal LRU cache backed by insertion-ordered Map.
 *
 * When capacity is exceeded the least-recently-used entry is evicted.
 * An optional `onEvict` callback fires for each evicted (or deleted) value so
 * callers can release associated resources (e.g. URL.revokeObjectURL).
 *
 * NOTE: `clear()` also fires `onEvict` for every remaining entry so no
 * resource leaks occur on a full reset.
 */
export class LruCache<V> {
  private readonly map = new Map<string, V>();

  constructor(
    private readonly capacity: number,
    private readonly onEvict: ((v: V) => void) | null = null,
  ) {}

  get(key: string): V | undefined {
    const v = this.map.get(key);
    if (v === undefined) return undefined;
    // Refresh recency by moving to end
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      // Evict old value for this key before inserting new one
      const old = this.map.get(key)!;
      this.map.delete(key);
      if (this.onEvict && old !== value) this.onEvict(old);
    }
    this.map.set(key, value);
    // Evict LRU entries until we are within capacity
    while (this.map.size > this.capacity) {
      const oldest = this.map.keys().next().value;
      if (oldest === undefined) break;
      const oldVal = this.map.get(oldest)!;
      this.map.delete(oldest);
      if (this.onEvict) this.onEvict(oldVal);
    }
  }

  delete(key: string): boolean {
    const v = this.map.get(key);
    if (v === undefined) return false;
    this.map.delete(key);
    if (this.onEvict) this.onEvict(v);
    return true;
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  /** Clear all entries, firing onEvict for each. */
  clear(): void {
    if (this.onEvict) {
      for (const v of this.map.values()) this.onEvict(v);
    }
    this.map.clear();
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }

  size(): number {
    return this.map.size;
  }
}

// ---------------------------------------------------------------------------
// Cache instances
// ---------------------------------------------------------------------------

interface DocxCacheEntry {
  html: string;
  warnings: string[];
}
interface SpreadsheetSheet {
  name: string;
  html: string;
}
interface SpreadsheetCacheEntry {
  sheets: SpreadsheetSheet[];
}

// objectURL cache: URLs are cheap references — we keep up to 200, but on
// eviction we MUST revoke or the browser holds the underlying Blob in memory.
const objectUrlCache = new LruCache<string>(200, (url) => URL.revokeObjectURL(url));

// HTML strings for DOCX previews can be large — cap at 30.
const docxCache = new LruCache<DocxCacheEntry>(30);

// Spreadsheet HTML tables can be very large — cap at 20.
const spreadsheetCache = new LruCache<SpreadsheetCacheEntry>(20);

// DXF→SVG strings are moderate — cap at 50.
const dxfSvgCache = new LruCache<string>(50);

// Plain text previews are lightweight — cap at 100.
const textCache = new LruCache<string>(100);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getObjectUrl(fileId: string, blob: Blob): string {
  const existing = objectUrlCache.get(fileId);
  if (existing) return existing;
  const url = URL.createObjectURL(blob);
  objectUrlCache.set(fileId, url);
  return url;
}

export function getDocxCache(fileId: string): DocxCacheEntry | undefined {
  return docxCache.get(fileId);
}
export function setDocxCache(fileId: string, value: DocxCacheEntry): void {
  docxCache.set(fileId, value);
}

export function getSpreadsheetCache(fileId: string): SpreadsheetCacheEntry | undefined {
  return spreadsheetCache.get(fileId);
}
export function setSpreadsheetCache(fileId: string, value: SpreadsheetCacheEntry): void {
  spreadsheetCache.set(fileId, value);
}

export function getDxfSvgCache(fileId: string): string | undefined {
  return dxfSvgCache.get(fileId);
}
export function setDxfSvgCache(fileId: string, svg: string): void {
  dxfSvgCache.set(fileId, svg);
}

export function getTextCache(fileId: string): string | undefined {
  return textCache.get(fileId);
}
export function setTextCache(fileId: string, value: string): void {
  textCache.set(fileId, value);
}

/** Clear all viewer caches for a given file. Called when file is removed. */
export function clearViewerCacheFor(fileId: string): void {
  // objectUrlCache.delete fires onEvict → URL.revokeObjectURL automatically
  objectUrlCache.delete(fileId);
  docxCache.delete(fileId);
  spreadsheetCache.delete(fileId);
  dxfSvgCache.delete(fileId);
  textCache.delete(fileId);
}

/** Clear everything (for resetting on FILES_RESET). */
export function clearAllViewerCaches(): void {
  // LruCache.clear() fires onEvict for every entry — revokes all objectURLs.
  objectUrlCache.clear();
  docxCache.clear();
  spreadsheetCache.clear();
  dxfSvgCache.clear();
  textCache.clear();
}
