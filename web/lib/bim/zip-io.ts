/**
 * ZIP I/O wrapper around jszip
 * Thin, promise-based API used by the web port.
 *
 * Ported from the ZIP logic embedded in:
 *   extension/js/files.js — FilesManager.extractZip / downloadAllAsZip
 *
 * Changes vs. the original:
 * - No DOM / FilesManager state; pure in/out.
 * - `readZip` returns all entries lazily (blob getter deferred until called).
 * - `writeZip` accepts a generic list of { path, blob } — caller decides names.
 * - `isZip` is a lightweight helper for drop-zone guards.
 */

import JSZip from 'jszip';

// ---------------------------------------------------------------------------
// ZipEntry
// ---------------------------------------------------------------------------

export interface ZipEntry {
  /** Full path inside the ZIP, e.g. 'subfolder/file.pdf' */
  path: string;
  /** Folder part of the path, e.g. 'subfolder' (empty string for top-level). */
  folder: string;
  /** Filename only, e.g. 'file.pdf' */
  name: string;
  /** Read the entry's raw bytes as a Blob (deferred, lazy). */
  blob: () => Promise<Blob>;
  /** Uncompressed size in bytes, if available from the ZIP metadata. */
  size?: number;
  /** True if the entry represents a directory. */
  isDir: boolean;
}

// ---------------------------------------------------------------------------
// readZip
// ---------------------------------------------------------------------------

/**
 * Load a ZIP from a `Blob`, `File`, or `ArrayBuffer` and return every entry
 * (files and directories) as a list of `ZipEntry` objects.
 *
 * Mirrors the filtering logic from `FilesManager.extractZip`:
 * macOS __MACOSX entries and .DS_Store files are excluded.
 */
export async function readZip(source: Blob | File | ArrayBuffer): Promise<ZipEntry[]> {
  const zip = await JSZip.loadAsync(source as Parameters<typeof JSZip.loadAsync>[0]);

  const entries: ZipEntry[] = [];

  zip.forEach((relativePath, zipEntry) => {
    // Skip macOS metadata artefacts (same filter as the JS source)
    if (
      relativePath.startsWith('__MACOSX') ||
      relativePath.includes('.DS_Store')
    ) {
      return;
    }

    const isDir = zipEntry.dir;
    const parts = relativePath.split('/');
    // For dirs the path ends with '/', so the last meaningful segment
    // is parts[parts.length - 2]; for files it is parts[parts.length - 1].
    const name = isDir
      ? parts[parts.length - 2] ?? ''
      : parts[parts.length - 1] ?? '';
    const folderParts = isDir ? parts.slice(0, -2) : parts.slice(0, -1);
    const folder = folderParts.join('/');

    const compressedSize = (zipEntry as unknown as { _data?: { compressedSize?: number } })
      ._data?.compressedSize;

    entries.push({
      path: relativePath,
      folder,
      name,
      blob: () => zipEntry.async('blob'),
      size: compressedSize,
      isDir,
    });
  });

  return entries;
}

// ---------------------------------------------------------------------------
// writeZip
// ---------------------------------------------------------------------------

/**
 * Build a new ZIP from a list of `{ path, blob }` entries and return a `Blob`.
 *
 * Folder paths in `path` are preserved (e.g. `'docs/report.pdf'`).
 * Uses DEFLATE compression (level 9) — same as `downloadAllAsZip`.
 */
export async function writeZip(
  entries: Array<{ path: string; blob: Blob }>,
): Promise<Blob> {
  const zip = new JSZip();

  for (const entry of entries) {
    zip.file(entry.path, entry.blob);
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

// ---------------------------------------------------------------------------
// isZip
// ---------------------------------------------------------------------------

/**
 * Return true if the File's name ends with `.zip` (case-insensitive).
 * Mirrors the guard in `FilesManager.handleFiles`.
 */
export function isZip(file: File): boolean {
  return file.name.toLowerCase().endsWith('.zip');
}
