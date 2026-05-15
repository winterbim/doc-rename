/**
 * BIM Supported File Extensions
 * Ported 1:1 from extension/js/config.js — CONFIG.SUPPORTED_EXTENSIONS
 */

import type { FileCategory } from '../types';

export const SUPPORTED_EXTENSIONS: Record<FileCategory, string[]> = {
  documents: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'],
  cad: ['.dwg', '.dxf', '.dgn'],
  bim: ['.ifc', '.rvt', '.rfa', '.nwd', '.nwc', '.nwf', '.bcf'],
  images: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.svg'],
  archives: ['.zip'],
  other: ['*'],
};

/** Build a reverse-lookup map: lowercase extension -> category */
const _extMap: Map<string, FileCategory> = new Map();
for (const [cat, exts] of Object.entries(SUPPORTED_EXTENSIONS) as [FileCategory, string[]][]) {
  for (const ext of exts) {
    if (ext !== '*') {
      _extMap.set(ext.toLowerCase(), cat);
    }
  }
}

/**
 * Returns the FileCategory for a given file extension.
 * Extension should include the leading dot (e.g. '.pdf').
 * Returns 'other' for unknown extensions.
 */
export function getCategoryForExt(ext: string): FileCategory {
  return _extMap.get(ext.toLowerCase()) ?? 'other';
}
