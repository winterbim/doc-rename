'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/lib/app-state';
import { useFileDrop } from '@/lib/hooks/useFileDrop';
import { readZip, isZip } from '@/lib/bim/zip-io';
import { isOtherArchive, readOtherArchive, archiveLabel } from '@/lib/bim/archive-io';
import { detectCategory } from '@/lib/bim/detection';
import { prefetchForExtension } from '@/lib/viewer-prefetch';
import { checkFilename, checkSize, checkBatchSize, checkZipMagic, MAX_FILE_SIZE } from '@/lib/upload-guard';
import type { BimFile } from '@/lib/bim/types';

/** Generate a short random id */
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Convert a native File (or ZipEntry-derived blob) into a BimFile.
 */
function makeBimFile(
  originalName: string,
  blob: Blob,
  folder: string,
  size: number,
): BimFile {
  const lastDot = originalName.lastIndexOf('.');
  const extension = lastDot > 0 ? originalName.substring(lastDot).toLowerCase() : '';
  return {
    id: uid(),
    original: originalName,
    extension,
    blob,
    folder,
    size,
    status: 'ready',
    addedAt: new Date(),
    category: detectCategory(extension),
    detectedType: null,
    mappedFields: {},
    autoDetected: {},
    cleanedBaseName: null,
  };
}

/** Expand a single ZIP file into BimFile entries. */
async function expandZip(
  file: File,
  onError: (msg: string) => void,
): Promise<BimFile[]> {
  try {
    const entries = await readZip(file);
    const results: BimFile[] = [];
    for (const entry of entries) {
      if (entry.isDir) continue;
      const blob = await entry.blob();
      results.push(makeBimFile(entry.name, blob, entry.folder, entry.size ?? blob.size));
    }
    return results;
  } catch {
    onError(`Impossible de lire le ZIP: ${file.name}`);
    return [];
  }
}

/** Expand a RAR / 7z / TAR / GZIP / etc. archive via libarchive.js (lazy). */
async function expandOtherArchive(
  file: File,
  onError: (msg: string) => void,
): Promise<BimFile[]> {
  try {
    const entries = await readOtherArchive(file);
    const results: BimFile[] = [];
    for (const entry of entries) {
      if (entry.isDir) continue;
      const blob = await entry.blob();
      if (blob.size > MAX_FILE_SIZE) {
        onError(`${entry.name}: extrait > ${MAX_FILE_SIZE / 1024 / 1024} Mo, ignoré`);
        continue;
      }
      results.push(makeBimFile(entry.name, blob, entry.folder, entry.size ?? blob.size));
    }
    return results;
  } catch (err) {
    const label = archiveLabel(file);
    const msg = err instanceof Error ? err.message : String(err);
    onError(`Erreur lecture ${label} ${file.name}: ${msg}`);
    return [];
  }
}

/**
 * Route a single accepted file to the right expansion path and append results.
 * Extracted so processFiles stays below the cognitive-complexity limit.
 */
async function expandFile(
  file: File,
  onError: (msg: string) => void,
): Promise<BimFile[]> {
  if (isZip(file)) return expandZip(file, onError);
  if (isOtherArchive(file)) return expandOtherArchive(file, onError);
  return [makeBimFile(file.name, file, '', file.size)];
}

/** Kick off idle prefetches for every unique extension in a file list. */
function prefetchUniqueExtensions(files: BimFile[]): void {
  const seen = new Set<string>();
  for (const f of files) {
    if (!seen.has(f.extension)) {
      seen.add(f.extension);
      prefetchForExtension(f.extension);
    }
  }
}

interface UploadZoneProps {
  /** When true, renders as a compact bar (~40px) instead of the full drop zone. */
  readonly compact?: boolean;
}

export function UploadZone({ compact = false }: UploadZoneProps) {
  const { dispatch } = useAppContext();

  const processFiles = useCallback(
    async (nativeFiles: File[]) => {
      dispatch({ type: 'UPLOAD_START' });
      const bimFiles: BimFile[] = [];

      // Boundary sanitization — defense-in-depth before parse / read
      let totalBytes = 0;
      const accepted: File[] = [];
      for (const file of nativeFiles) {
        const fn = checkFilename(file.name);
        if (!fn.ok) {
          dispatch({ type: 'TOAST_SHOW', msg: `${file.name}: ${fn.reason}` });
          continue;
        }
        const sz = checkSize(file.size);
        if (!sz.ok) {
          dispatch({ type: 'TOAST_SHOW', msg: `${file.name}: ${sz.reason}` });
          continue;
        }
        if (isZip(file)) {
          const magic = await checkZipMagic(file);
          if (!magic.ok) {
            dispatch({ type: 'TOAST_SHOW', msg: `${file.name}: ${magic.reason}` });
            continue;
          }
        }
        totalBytes += file.size;
        accepted.push(file);
      }
      const batch = checkBatchSize(totalBytes);
      if (!batch.ok) {
        dispatch({ type: 'TOAST_SHOW', msg: batch.reason ?? 'Lot trop grand' });
        dispatch({ type: 'UPLOAD_END' });
        return;
      }

      const onError = (msg: string) => dispatch({ type: 'TOAST_SHOW', msg });
      for (const file of accepted) {
        const expanded = await expandFile(file, onError);
        bimFiles.push(...expanded);
      }

      if (bimFiles.length > 0) {
        dispatch({ type: 'FILES_ADD', files: bimFiles });
        dispatch({
          type: 'TOAST_SHOW',
          msg: `${bimFiles.length} fichier(s) ajouté(s)`,
        });
        prefetchUniqueExtensions(bimFiles);
      }
      dispatch({ type: 'UPLOAD_END' });
    },
    [dispatch],
  );

  const { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, openFilePicker, inputRef } =
    useFileDrop({ onFiles: processFiles });

  const sharedDragProps = {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.ifc,.rvt,.nwd,.png,.jpg,.jpeg,.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz"
      className="sr-only"
      aria-hidden="true"
      tabIndex={-1}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) processFiles(files);
        e.target.value = '';
      }}
    />
  );

  /* ── Compact bar (shown when files are already loaded) ── */
  if (compact) {
    return (
      <div
        {...sharedDragProps}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        aria-label="Ajouter des fichiers. Cliquez ou glissez ici"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openFilePicker();
        }}
        className={[
          'flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-sans font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
          isDragging
            ? 'border-brick bg-brick/5 text-brick'
            : 'border-dashed border-line bg-paper-2/40 text-ink-soft hover:border-brick/50 hover:bg-paper-2/70 hover:text-brick',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {isDragging ? 'Relâchez pour ajouter' : 'Ajouter des fichiers ou glisser un ZIP'}
        {hiddenInput}
      </div>
    );
  }

  /* ── Full drop zone (shown when no files loaded yet) ── */
  return (
    <div
      {...sharedDragProps}
      onClick={openFilePicker}
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt de fichiers. Cliquez ou glissez vos fichiers ici"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openFilePicker();
      }}
      className={[
        'relative flex max-h-[200px] min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
        isDragging
          ? 'border-brick bg-brick/5'
          : 'border-line bg-paper-2/40 hover:border-brick/50 hover:bg-paper-2/70',
      ].join(' ')}
    >
      {/* Upload icon */}
      <svg
        className={`mb-3 h-10 w-10 transition-colors ${isDragging ? 'text-brick' : 'text-ink-mute'}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-sm font-sans font-medium text-ink">
        {isDragging ? 'Relâchez pour ajouter' : 'Glissez vos fichiers / un ZIP ici'}
      </p>
      <p className="mt-1 text-xs font-sans text-ink-soft">
        ou{' '}
        <span className="font-medium text-brick underline underline-offset-2">
          cliquez pour parcourir
        </span>
      </p>
      <p className="mt-2 text-xs text-ink-mute">
        PDF, DWG, IFC, RVT, images — ou ZIP / RAR / 7z / TAR / GZIP
      </p>

      {hiddenInput}
    </div>
  );
}
