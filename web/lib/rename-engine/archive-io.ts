/**
 * Multi-format archive extraction via libarchive.js (WebAssembly).
 * Lazy-loaded — only imported when a non-ZIP archive is dropped.
 *
 * Supported formats: RAR v4/v5, 7z, TAR, TAR.GZ, GZIP, BZIP2, XZ, LZMA.
 * ZIP is intentionally excluded here — it stays on the faster JSZip path.
 *
 * Privacy: 100 % in-browser; no upload, no external call.
 *
 * Security note: no magic-bytes pre-check is performed on non-ZIP archives
 * (the ZIP guard in upload-guard.ts is ZIP-specific). libarchive.js will
 * throw a descriptive error on a corrupt or forged file — the caller surfaces
 * that error as a toast. Extracted entries are still subject to the per-file
 * MAX_FILE_SIZE cap (defense-in-depth against archive-bomb payloads).
 *
 * libarchive.js API (v2.x):
 *   Archive.init({ workerUrl })  — set worker URL once
 *   Archive.open(file)           — returns ArchiveReader
 *   reader.getFilesArray()       — [{ file: CompressedFile, path: string }]
 *                                  where `path` is the directory (e.g. "dir/")
 *                                  and `file.name` is the filename
 *   compressedFile.extract()     — returns Promise<File>
 */

import type { ZipEntry } from './zip-io';

const ARCHIVE_EXTENSIONS = [
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.tgz',
  '.tar.gz',
  '.bz2',
  '.tar.bz2',
  '.xz',
  '.tar.xz',
] as const;

/** True when the file is a non-ZIP archive we handle via libarchive.js. */
export function isOtherArchive(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ARCHIVE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/** Human-readable label for error messages. */
export function archiveLabel(file: File): string {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.rar')) return 'RAR';
  if (lower.endsWith('.7z')) return '7z';
  if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) return 'TAR.GZ';
  if (lower.endsWith('.tar.bz2')) return 'TAR.BZ2';
  if (lower.endsWith('.tar.xz')) return 'TAR.XZ';
  if (lower.endsWith('.tar')) return 'TAR';
  if (lower.endsWith('.gz')) return 'GZIP';
  if (lower.endsWith('.bz2')) return 'BZIP2';
  if (lower.endsWith('.xz')) return 'XZ';
  return 'Archive';
}

/** Track whether Archive.init() has been called in this page session. */
let _initialized = false;

/**
 * Lazy-load libarchive.js and extract every entry as ZipEntry-shaped objects.
 *
 * libarchive.js v2 getFilesArray() returns:
 *   [{ file: CompressedFile, path: string }]
 * where `path` is the directory portion (e.g. "subdir/") and
 * `file.name` is just the filename.
 *
 * Throws on unsupported or corrupt archives.
 */
export async function readOtherArchive(file: File): Promise<ZipEntry[]> {
  // Dynamic import — keeps libarchive.js (~2 MB WASM) out of the main bundle.
  const { Archive } = await import('libarchive.js');

  if (!_initialized) {
    Archive.init({ workerUrl: '/libarchive-worker.js' });
    _initialized = true;
  }

  const archive = await Archive.open(file);
  const entries: Array<{ file: { name: string; size: number; extract: () => Promise<File> }; path: string }> =
    await archive.getFilesArray();

  const results: ZipEntry[] = [];

  for (const entry of entries) {
    const compressedFile = entry.file;
    const dirPath = entry.path ?? ''; // e.g. "" or "subdir/"

    if (!compressedFile || !compressedFile.name) continue;

    const name = compressedFile.name;
    // Reconstruct full path for DS_Store / __MACOSX filtering
    const fullPath = dirPath ? `${dirPath}${name}` : name;

    // Skip macOS metadata artefacts (same filter as readZip).
    if (
      fullPath.startsWith('__MACOSX') ||
      fullPath.includes('.DS_Store')
    ) {
      continue;
    }

    // Normalise folder: strip trailing slash
    const folder = dirPath.endsWith('/') ? dirPath.slice(0, -1) : dirPath;

    // Capture reference for closure (avoid loop-variable capture)
    const capturedFile = compressedFile;

    results.push({
      path: fullPath,
      folder,
      name,
      blob: () => capturedFile.extract().then((f) => f as unknown as Blob),
      size: compressedFile.size,
      isDir: false,
    });
  }

  return results;
}
