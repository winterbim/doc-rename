import type { FileCategory } from './rename-engine/types';

const MEBIBYTE = 1024 * 1024;

export const PREVIEW_SIZE_LIMITS = {
  pdf: 100 * MEBIBYTE,
  office: 25 * MEBIBYTE,
  spreadsheet: 25 * MEBIBYTE,
  dxf: 25 * MEBIBYTE,
  image: 50 * MEBIBYTE,
} as const;

export interface PreviewGuardResult {
  readonly ok: boolean;
  readonly maxBytes?: number;
  readonly reason?: string;
}

const OFFICE_EXTENSIONS = new Set(['.doc', '.docx']);
const SPREADSHEET_EXTENSIONS = new Set([
  '.csv',
  '.ods',
  '.tsv',
  '.xls',
  '.xlsb',
  '.xlsm',
  '.xlsx',
]);
const IMAGE_EXTENSIONS = new Set(['.gif', '.jpeg', '.jpg', '.png', '.webp']);

function previewLimit(extension: string, category: FileCategory): number | undefined {
  const ext = extension.toLowerCase();
  if (ext === '.pdf') return PREVIEW_SIZE_LIMITS.pdf;
  if (OFFICE_EXTENSIONS.has(ext)) return PREVIEW_SIZE_LIMITS.office;
  if (SPREADSHEET_EXTENSIONS.has(ext)) return PREVIEW_SIZE_LIMITS.spreadsheet;
  if (ext === '.dxf') return PREVIEW_SIZE_LIMITS.dxf;
  if (IMAGE_EXTENSIONS.has(ext) || category === 'images') return PREVIEW_SIZE_LIMITS.image;
  return undefined;
}

/**
 * Protect expensive browser preview parsers without rejecting the source file.
 * Files over these limits remain available to rename and download.
 */
export function checkPreviewSize(
  extension: string,
  category: FileCategory,
  size: number,
): PreviewGuardResult {
  if (!Number.isFinite(size) || size < 0) {
    return { ok: false, reason: 'Taille de fichier invalide pour l’aperçu.' };
  }

  const maxBytes = previewLimit(extension, category);
  if (maxBytes === undefined || size <= maxBytes) return { ok: true, maxBytes };

  return {
    ok: false,
    maxBytes,
    reason: `Aperçu limité aux fichiers de ${maxBytes / MEBIBYTE} Mo maximum.`,
  };
}
