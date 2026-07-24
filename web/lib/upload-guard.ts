/**
 * Upload boundary sanitization.
 *
 * Every file dropped into the renamer is passed through these pure validators
 * before being read or stored. Each function is total: never throws, always
 * returns { ok, reason? }.
 *
 * Defense-in-depth:
 *   1. Filename hygiene (control chars, traversal, length)
 *   2. Per-file size cap
 *   3. Batch total size cap
 *   4. ZIP magic-bytes check (refuse files that lie about their extension)
 */

export const MAX_FILE_SIZE = 500 * 1024 * 1024;        // 500 MiB
// Plafond TECHNIQUE absolu — doit couvrir la plus grande offre commerciale
// (Cabinet : 2 Go/lot, voir lib/plan-features.ts). Les plafonds par plan
// s'appliquent en dessous, dans useFileIngestion.
export const MAX_BATCH_SIZE = 2 * 1024 * 1024 * 1024;  // 2 GiB
export const MAX_EXTRACTED_BATCH_SIZE = 500 * 1024 * 1024; // 500 MiB of inflated data
export const MAX_ARCHIVE_ENTRIES = 5_000;

function formatMiB(bytes: number): number {
  return bytes / 1024 / 1024;
}

function formatGiB(bytes: number): number {
  return bytes / 1024 / 1024 / 1024;
}

export interface GuardResult {
  readonly ok: boolean;
  readonly reason?: string;
}

/** Mutable counter shared by every archive/direct file in one import action. */
export interface ArchiveEntryBudget {
  entries: number;
}

const CONTROL_CHARS = /[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/;
const TRAVERSAL = /(^|[/\\])\.\.([/\\]|$)/;
const ABSOLUTE_PATH = /^(?:[/\\]|[A-Za-z]:[/\\])/;

export function checkFilename(name: string): GuardResult {
  if (!name) return { ok: false, reason: 'Nom de fichier vide.' };
  if (new TextEncoder().encode(name).byteLength > 255) {
    return { ok: false, reason: 'Nom trop long (255 octets maximum).' };
  }
  if (CONTROL_CHARS.test(name)) return { ok: false, reason: 'Caractères invisibles interdits dans le nom.' };
  if (TRAVERSAL.test(name)) return { ok: false, reason: 'Chemin relatif interdit dans le nom (..).' };
  if (/[. ]$/.test(name)) return { ok: false, reason: 'Point ou espace final interdit dans le nom.' };
  return { ok: true };
}

/** Validate a full path supplied by an archive before extracting its bytes. */
export function checkArchivePath(path: string): GuardResult {
  if (!path) return { ok: false, reason: 'Chemin d’archive vide.' };
  if (path.length > 1_024) return { ok: false, reason: 'Chemin d’archive trop long.' };
  if (CONTROL_CHARS.test(path)) {
    return { ok: false, reason: 'Caractères invisibles interdits dans le chemin.' };
  }
  if (path.includes('\\')) return { ok: false, reason: 'Séparateur de chemin interdit dans l’archive.' };
  if (ABSOLUTE_PATH.test(path)) return { ok: false, reason: 'Chemin absolu interdit dans l’archive.' };
  if (TRAVERSAL.test(path)) return { ok: false, reason: 'Chemin relatif interdit dans l’archive (..).' };

  const parts = path.split('/');
  if (parts.some((part) => !part || part === '.')) {
    return { ok: false, reason: 'Segment vide ou « . » interdit dans l’archive.' };
  }
  if (parts.some((part) => new TextEncoder().encode(part).byteLength > 255)) {
    return { ok: false, reason: 'Nom trop long dans le chemin d’archive.' };
  }
  return { ok: true };
}

export function checkSize(size: number): GuardResult {
  if (!Number.isFinite(size) || size < 0) return { ok: false, reason: 'Taille de fichier invalide.' };
  if (size > MAX_FILE_SIZE) {
    return { ok: false, reason: `Fichier trop volumineux (${formatMiB(MAX_FILE_SIZE)} Mo maximum).` };
  }
  return { ok: true };
}

export function checkBatchSize(totalBytes: number): GuardResult {
  if (totalBytes > MAX_BATCH_SIZE) {
    return { ok: false, reason: `Lot trop volumineux (${formatGiB(MAX_BATCH_SIZE)} Go maximum).` };
  }
  return { ok: true };
}

export function checkExtractedBatchSize(totalBytes: number): GuardResult {
  if (!Number.isFinite(totalBytes) || totalBytes < 0) {
    return { ok: false, reason: 'Taille extraite invalide.' };
  }
  if (totalBytes > MAX_EXTRACTED_BATCH_SIZE) {
    return {
      ok: false,
      reason: `Archive décompressée trop volumineuse (${formatMiB(MAX_EXTRACTED_BATCH_SIZE)} Mo maximum).`,
    };
  }
  return { ok: true };
}

export function checkArchiveEntryCount(count: number): GuardResult {
  if (!Number.isInteger(count) || count < 0) return { ok: false, reason: 'Nombre d’entrées invalide.' };
  if (count > MAX_ARCHIVE_ENTRIES) {
    return { ok: false, reason: `Archive trop volumineuse (${MAX_ARCHIVE_ENTRIES} entrées maximum).` };
  }
  return { ok: true };
}

/**
 * Atomically reserve parsed entries against the import-wide cap. The counter is
 * changed only on success, so callers can safely stop after a rejected archive.
 */
export function reserveArchiveEntries(
  budget: ArchiveEntryBudget,
  additionalEntries: number,
): GuardResult {
  if (!Number.isInteger(budget.entries) || budget.entries < 0) {
    return { ok: false, reason: 'Budget d’entrées invalide.' };
  }
  if (!Number.isInteger(additionalEntries) || additionalEntries < 0) {
    return { ok: false, reason: 'Nombre d’entrées invalide.' };
  }
  const result = checkArchiveEntryCount(budget.entries + additionalEntries);
  if (result.ok) budget.entries += additionalEntries;
  return result;
}

/** ZIP local file header: PK\x03\x04 (regular), \x05\x06 (empty), \x07\x08 (spanned). */
export async function checkZipMagic(blob: Blob): Promise<GuardResult> {
  if (blob.size < 4) return { ok: false, reason: 'Archive ZIP trop petite pour être valide.' };
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (head[0] !== 0x50 || head[1] !== 0x4b) {
    return { ok: false, reason: 'Archive ZIP invalide : signature PK manquante.' };
  }
  const v = (head[2] << 8) | head[3];
  if (v !== 0x0304 && v !== 0x0506 && v !== 0x0708) {
    return { ok: false, reason: 'Archive ZIP invalide : signature non reconnue.' };
  }
  return { ok: true };
}
