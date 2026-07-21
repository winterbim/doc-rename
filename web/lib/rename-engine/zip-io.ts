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
import { cleanFilename, normalizeOutputName, validateFilename } from './nomenclature';
import { assertSafeZipCentralDirectory } from './zip-central-guard';
import {
  checkArchiveEntryCount,
  checkArchivePath,
  checkBatchSize,
  checkExtractedBatchSize,
  checkSize,
  reserveArchiveEntries,
  type ArchiveEntryBudget,
} from '../upload-guard';

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
  /** Original unsanitized path when the archive library had to clean it. */
  unsafePath?: string;
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
export async function readZip(
  source: Blob | File | ArrayBuffer,
  entryBudget?: ArchiveEntryBudget,
): Promise<ZipEntry[]> {
  const data = source instanceof ArrayBuffer ? source : await source.arrayBuffer();
  const { entryCount } = assertSafeZipCentralDirectory(data);
  const totalEntryCheck = entryBudget
    ? checkArchiveEntryCount(entryBudget.entries + entryCount)
    : checkArchiveEntryCount(entryCount);
  if (!totalEntryCheck.ok) throw new Error(totalEntryCheck.reason);

  const zip = await JSZip.loadAsync(data);
  const rawEntryCount = Object.keys(zip.files).length;
  if (rawEntryCount !== entryCount) {
    throw new Error('Archive ZIP refusée : le lecteur ZIP a interprété un nombre d’entrées différent.');
  }
  if (entryBudget) {
    const reservation = reserveArchiveEntries(entryBudget, entryCount);
    if (!reservation.ok) throw new Error(reservation.reason);
  }

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

    const metadata = zipEntry as unknown as {
      _data?: { uncompressedSize?: number };
      unsafeOriginalName?: string;
    };

    entries.push({
      path: relativePath,
      folder,
      name,
      blob: () => zipEntry.async('blob'),
      size: metadata._data?.uncompressedSize,
      unsafePath: metadata.unsafeOriginalName,
      isDir,
    });
    const countCheck = checkArchiveEntryCount(entries.length);
    if (!countCheck.ok) throw new Error(countCheck.reason);
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
  const countCheck = checkArchiveEntryCount(entries.length);
  if (!countCheck.ok) throw new Error(countCheck.reason);
  const seen = new Set<string>();
  let totalBytes = 0;

  // Validate the complete batch before handing any Blob to JSZip. Besides
  // keeping the operation atomic, this prevents JSZip from starting an
  // asynchronous Blob conversion that would be abandoned if a later entry is
  // rejected (and could surface as an unhandled rejection in the browser).
  for (const entry of entries) {
    const pathCheck = checkArchivePath(entry.path);
    if (!pathCheck.ok) throw new Error(pathCheck.reason);
    for (const component of entry.path.split('/').filter(Boolean)) {
      const filenameCheck = validateFilename(component);
      if (!filenameCheck.valid) {
        throw new Error(`${entry.path} : ${filenameCheck.errors.join(', ')}`);
      }
    }
    const sizeCheck = checkSize(entry.blob.size);
    if (!sizeCheck.ok) throw new Error(`${entry.path} : ${sizeCheck.reason}`);
    totalBytes += entry.blob.size;
    const batchCheck = checkBatchSize(totalBytes);
    if (!batchCheck.ok) throw new Error(batchCheck.reason);
    const extractedCheck = checkExtractedBatchSize(totalBytes);
    if (!extractedCheck.ok) throw new Error(extractedCheck.reason);

    const collisionKey = entry.path.replace(/\\/g, '/').normalize('NFC').toLocaleLowerCase('en-US');
    if (seen.has(collisionKey)) {
      throw new Error(`Deux fichiers produisent le même chemin ZIP : ${entry.path}`);
    }
    seen.add(collisionKey);
  }

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

export function normalizeZipArchiveName(name: string): string {
  const fallback = 'FICHIERS_RENOMMES';
  const withoutExtension = name.replace(/\.zip$/i, '').trim() || fallback;
  // Browser download APIs sanitize slashes, controls and reserved device names
  // differently. Restrict the outer archive name to a portable ASCII subset so
  // the downloaded name always matches what the UI announces.
  const cleaned = cleanFilename(normalizeOutputName(withoutExtension)) || fallback;
  const base = cleaned.slice(0, 251); // reserve four UTF-8 bytes for ".ZIP"
  const candidate = `${base}.ZIP`;
  return validateFilename(candidate).valid ? candidate : `${fallback}.ZIP`;
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
