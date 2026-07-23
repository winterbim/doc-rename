'use client';

import { useCallback } from 'react';
import { useAppContext } from '@/lib/app-state';
import { useAccessPlan } from '@/lib/hooks/useAccessPlan';
import { getPlanFeatures, planLimitMessage } from '@/lib/plan-features';
import { readZip, isZip } from '@/lib/rename-engine/zip-io';
import { isOtherArchive, readOtherArchive, archiveLabel } from '@/lib/rename-engine/archive-io';
import { detectCategory } from '@/lib/rename-engine/detection';
import { prefetchForExtension } from '@/lib/viewer-prefetch';
import {
  checkFilename,
  checkArchivePath,
  checkSize,
  checkBatchSize,
  checkExtractedBatchSize,
  checkArchiveEntryCount,
  checkZipMagic,
  reserveArchiveEntries,
} from '@/lib/upload-guard';
import type { WorkspaceFile } from '@/lib/rename-engine/types';

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

function makeWorkspaceFile(originalName: string, blob: Blob, folder: string, size: number): WorkspaceFile {
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

type ExtractionBudget = { bytes: number; archiveBytes: number; entries: number };

async function materializeArchiveEntries(
  entries: Awaited<ReturnType<typeof readZip>>,
  budget: ExtractionBudget,
  onError: (msg: string) => void,
): Promise<WorkspaceFile[]> {
  const results: WorkspaceFile[] = [];
  for (const entry of entries) {
    if (entry.isDir) continue;
    const safePath = checkArchivePath(entry.unsafePath ?? entry.path);
    const safeName = checkFilename(entry.name);
    if (!safePath.ok || !safeName.ok) {
      onError(`${entry.path} : ${safePath.reason ?? safeName.reason}`);
      continue;
    }
    if (entry.size !== undefined) {
      const declaredSize = checkSize(entry.size);
      const declaredBatch = checkBatchSize(budget.bytes + entry.size);
      const declaredArchiveBatch = checkExtractedBatchSize(budget.archiveBytes + entry.size);
      if (!declaredSize.ok || !declaredBatch.ok || !declaredArchiveBatch.ok) {
        onError(`${entry.path} : ${declaredSize.reason ?? declaredBatch.reason ?? declaredArchiveBatch.reason}`);
        continue;
      }
    }

    try {
      const blob = await entry.blob();
      const actualSize = checkSize(blob.size);
      const actualBatch = checkBatchSize(budget.bytes + blob.size);
      const actualArchiveBatch = checkExtractedBatchSize(budget.archiveBytes + blob.size);
      if (!actualSize.ok || !actualBatch.ok || !actualArchiveBatch.ok) {
        onError(`${entry.path} : ${actualSize.reason ?? actualBatch.reason ?? actualArchiveBatch.reason}`);
        continue;
      }
      budget.bytes += blob.size;
      budget.archiveBytes += blob.size;
      results.push(makeWorkspaceFile(entry.name, blob, entry.folder, blob.size));
    } catch {
      onError(`${entry.path} : extraction impossible, fichier ignoré.`);
    }
  }
  return results;
}

async function expandZip(
  file: File,
  budget: ExtractionBudget,
  onError: (msg: string) => void,
): Promise<WorkspaceFile[]> {
  try {
    const entries = await readZip(file, budget);
    return materializeArchiveEntries(entries, budget, onError);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erreur inattendue';
    onError(`Impossible de lire l’archive ZIP ${file.name} : ${message}`);
    return [];
  }
}

async function expandOtherArchive(
  file: File,
  budget: ExtractionBudget,
  onError: (msg: string) => void,
): Promise<WorkspaceFile[]> {
  try {
    const entries = await readOtherArchive(file, budget, budget.archiveBytes);
    return materializeArchiveEntries(entries, budget, onError);
  } catch (err) {
    const label = archiveLabel(file);
    const msg = err instanceof Error ? err.message : String(err);
    onError(`Erreur de lecture ${label} ${file.name} : ${msg}`);
    return [];
  }
}

async function expandFile(
  file: File,
  budget: ExtractionBudget,
  onError: (msg: string) => void,
): Promise<WorkspaceFile[]> {
  if (isZip(file)) return expandZip(file, budget, onError);
  if (isOtherArchive(file)) return expandOtherArchive(file, budget, onError);
  const entryCount = reserveArchiveEntries(budget, 1);
  if (!entryCount.ok) {
    onError(`${file.name}: ${entryCount.reason}`);
    return [];
  }
  const batch = checkBatchSize(budget.bytes + file.size);
  if (!batch.ok) {
    onError(`${file.name}: ${batch.reason}`);
    return [];
  }
  budget.bytes += file.size;
  return [makeWorkspaceFile(file.name, file, '', file.size)];
}

function prefetchUniqueExtensions(files: WorkspaceFile[]): void {
  const seen = new Set<string>();
  for (const f of files) {
    if (!seen.has(f.extension)) {
      seen.add(f.extension);
      prefetchForExtension(f.extension);
    }
  }
}

function formatAddedFiles(count: number): string {
  return count === 1 ? '1 fichier ajouté' : `${count} fichiers ajoutés`;
}

export interface UseFileIngestionReturn {
  /** Validates, expands archives, dispatches FILES_ADD, prefetches viewers. */
  processFiles: (nativeFiles: File[], options?: { demo?: boolean }) => Promise<void>;
}

/**
 * React hook exposing the shared ingestion pipeline. Every consumer gets
 * the SAME validation + dispatch behavior — no duplication risk.
 */
export function useFileIngestion(): UseFileIngestionReturn {
  const { state, dispatch } = useAppContext();
  const { plan } = useAccessPlan();

  const processFiles = useCallback(
    async (nativeFiles: File[], options?: { demo?: boolean }) => {
      dispatch({ type: 'UPLOAD_START' });
      const workspaceFiles: WorkspaceFile[] = [];
      try {
        const nativeEntryCount = checkArchiveEntryCount(nativeFiles.length);
        if (!nativeEntryCount.ok) {
          dispatch({ type: 'TOAST_SHOW', msg: nativeEntryCount.reason ?? 'Trop de fichiers.' });
          return;
        }
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
          dispatch({ type: 'TOAST_SHOW', msg: batch.reason ?? 'Lot trop volumineux.' });
          return;
        }

        const onError = (msg: string) => dispatch({ type: 'TOAST_SHOW', msg });
        const extractionBudget: ExtractionBudget = { bytes: 0, archiveBytes: 0, entries: 0 };
        for (const file of accepted) {
          const expanded = await expandFile(file, extractionBudget, onError);
          workspaceFiles.push(...expanded);
        }

        // Plafonds commerciaux du plan (les plafonds techniques de
        // upload-guard restent le garde-fou absolu au-dessus).
        const features = getPlanFeatures(plan);
        const existingCount = state.files.length;
        const existingBytes = state.files.reduce((sum, f) => sum + f.size, 0);
        let limitMsg: string | null = null;
        let admitted = workspaceFiles;
        if (existingCount + workspaceFiles.length > features.maxFilesPerBatch) {
          const room = Math.max(0, features.maxFilesPerBatch - existingCount);
          admitted = admitted.slice(0, room);
          limitMsg = planLimitMessage(plan, 'files', features.maxFilesPerBatch);
        }
        let runningBytes = existingBytes;
        const withinBytes: WorkspaceFile[] = [];
        for (const f of admitted) {
          if (runningBytes + f.size > features.maxBatchBytes) {
            limitMsg = planLimitMessage(plan, 'bytes', features.maxBatchBytes);
            break;
          }
          runningBytes += f.size;
          withinBytes.push(f);
        }

        if (withinBytes.length > 0) {
          const files = options?.demo
            ? withinBytes.map((f) => ({ ...f, isDemo: true }))
            : withinBytes;
          dispatch({ type: 'FILES_ADD', files });
          prefetchUniqueExtensions(files);
        }
        // Le message de limite (avec chemin d'upgrade) prime sur le compteur.
        if (limitMsg) {
          dispatch({ type: 'TOAST_SHOW', msg: limitMsg });
        } else if (withinBytes.length > 0) {
          dispatch({ type: 'TOAST_SHOW', msg: formatAddedFiles(withinBytes.length) });
        }
      } catch (error) {
        dispatch({
          type: 'TOAST_SHOW',
          msg: `Import interrompu : ${error instanceof Error ? error.message : 'erreur inattendue'}`,
        });
      } finally {
        dispatch({ type: 'UPLOAD_END' });
      }
    },
    [dispatch, plan, state.files],
  );

  return { processFiles };
}
