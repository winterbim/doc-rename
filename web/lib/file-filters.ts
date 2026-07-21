/**
 * Pure filter helpers for the BIMDoc file list.
 * No side-effects — only functions that transform arrays.
 */

import type { WorkspaceFile } from '@/lib/rename-engine/types';
import type { AppState } from '@/lib/app-state';

// ---------------------------------------------------------------------------
// applySearch
// ---------------------------------------------------------------------------

/**
 * Filter files whose `original` OR `newName` contains `query` (case-insensitive).
 * Returns all files when `query` is empty or whitespace-only.
 */
export function applySearch(files: WorkspaceFile[], query: string): WorkspaceFile[] {
  const q = query.trim().toLowerCase();
  if (!q) return files;
  return files.filter((f) => {
    const inOriginal = f.original.toLowerCase().includes(q);
    const inNew = f.newName ? f.newName.toLowerCase().includes(q) : false;
    return inOriginal || inNew;
  });
}

// ---------------------------------------------------------------------------
// applyExtFilter
// ---------------------------------------------------------------------------

/**
 * Filter files whose `extension` exactly matches `extFilter` (e.g. `.pdf`).
 * Returns all files when `extFilter` is empty.
 * The comparison is case-insensitive.
 */
export function applyExtFilter(files: WorkspaceFile[], extFilter: string): WorkspaceFile[] {
  const ext = extFilter.trim().toLowerCase();
  if (!ext) return files;
  return files.filter((f) => f.extension.toLowerCase() === ext);
}

// ---------------------------------------------------------------------------
// getDistinctExtensions
// ---------------------------------------------------------------------------

/**
 * Return a sorted list of distinct file extensions present in `files`.
 * Extensions are lower-cased and include the leading dot (e.g. `.pdf`).
 */
export function getDistinctExtensions(files: WorkspaceFile[]): string[] {
  const set = new Set<string>();
  for (const f of files) {
    if (f.extension) set.add(f.extension.toLowerCase());
  }
  return Array.from(set).sort();
}

// ---------------------------------------------------------------------------
// getVisibleFiles
// ---------------------------------------------------------------------------

/**
 * Compose search + extension filter using the current AppState ui slice.
 * Returns the subset of `state.files` that are currently visible.
 */
export function getVisibleFiles(state: AppState): WorkspaceFile[] {
  const { searchQuery, extFilter } = state.ui;
  let result = state.files;
  result = applySearch(result, searchQuery);
  result = applyExtFilter(result, extFilter);
  return result;
}
