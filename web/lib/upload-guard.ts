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
export const MAX_BATCH_SIZE = 1 * 1024 * 1024 * 1024;  // 1 GiB

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

const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f]/;
const TRAVERSAL = /(^|[/\\])\.\.([/\\]|$)/;

export function checkFilename(name: string): GuardResult {
  if (!name) return { ok: false, reason: 'Nom de fichier vide.' };
  if (name.length > 255) return { ok: false, reason: 'Nom trop long (255 caractères maximum).' };
  if (CONTROL_CHARS.test(name)) return { ok: false, reason: 'Caractères invisibles interdits dans le nom.' };
  if (TRAVERSAL.test(name)) return { ok: false, reason: 'Chemin relatif interdit dans le nom (..).' };
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
