'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/lib/app-state';
import { readZip, isZip } from '@/lib/bim/zip-io';
import { isOtherArchive, readOtherArchive, archiveLabel } from '@/lib/bim/archive-io';
import { detectCategory } from '@/lib/bim/detection';
import { prefetchForExtension } from '@/lib/viewer-prefetch';
import {
  checkFilename,
  checkSize,
  checkBatchSize,
  checkZipMagic,
  MAX_FILE_SIZE,
} from '@/lib/upload-guard';
import type { BimFile } from '@/lib/bim/types';

/**
 * Shared file-ingestion pipeline.
 *
 * Identical logic to the original UploadZone (validate → expand archives →
 * dispatch FILES_ADD → prefetch viewers), extracted so it can be reused by
 * any UI surface that needs to add files (drop zone, "Add more files"
 * button in ActionBar, etc.).
 *
 * Pure logic — the helpers below have no React dependency.
 */

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function makeBimFile(originalName: string, blob: Blob, folder: string, size: number): BimFile {
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

async function expandZip(file: File, onError: (msg: string) => void): Promise<BimFile[]> {
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

async function expandOtherArchive(file: File, onError: (msg: string) => void): Promise<BimFile[]> {
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

async function expandFile(file: File, onError: (msg: string) => void): Promise<BimFile[]> {
  if (isZip(file)) return expandZip(file, onError);
  if (isOtherArchive(file)) return expandOtherArchive(file, onError);
  return [makeBimFile(file.name, file, '', file.size)];
}

function prefetchUniqueExtensions(files: BimFile[]): void {
  const seen = new Set<string>();
  for (const f of files) {
    if (!seen.has(f.extension)) {
      seen.add(f.extension);
      prefetchForExtension(f.extension);
    }
  }
}

export interface UseFileIngestionReturn {
  /** Validates, expands archives, dispatches FILES_ADD, prefetches viewers. */
  processFiles: (nativeFiles: File[]) => Promise<void>;
}

/**
 * React hook exposing the shared ingestion pipeline. Every consumer gets
 * the SAME validation + dispatch behavior — no duplication risk.
 */
export function useFileIngestion(): UseFileIngestionReturn {
  const { dispatch } = useAppContext();

  const processFiles = useCallback(
    async (nativeFiles: File[]) => {
      dispatch({ type: 'UPLOAD_START' });
      const bimFiles: BimFile[] = [];

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

  return { processFiles };
}
