import {
  checkArchiveEntryCount,
  checkArchivePath,
} from '../upload-guard';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const MAX_ZIP_COMMENT_LENGTH = 0xffff;
const EOCD_LENGTH = 22;
const CENTRAL_FILE_HEADER_LENGTH = 46;
const LOCAL_FILE_HEADER_LENGTH = 30;
const UTF8_FLAG = 0x0800;
const ENCRYPTED_FLAG = 0x0001;
const DATA_DESCRIPTOR_FLAG = 0x0008;

export interface SafeZipDirectory {
  readonly entryCount: number;
}

function invalidZip(reason: string): never {
  throw new Error(`Archive ZIP refusée : ${reason}`);
}

function requireRange(
  offset: number,
  length: number,
  end: number,
  reason: string,
): void {
  if (
    !Number.isSafeInteger(offset) ||
    !Number.isSafeInteger(length) ||
    offset < 0 ||
    length < 0 ||
    offset > end ||
    length > end - offset
  ) {
    invalidZip(reason);
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) return false;
  for (let index = 0; index < left.byteLength; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ ((crc & 1) === 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function decodeUtf8(bytes: Uint8Array, entryIndex: number): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return invalidZip(`nom UTF-8 invalide à l’entrée ${entryIndex + 1}.`);
  }
}

function unicodePathFromExtra(
  view: DataView,
  bytes: Uint8Array,
  extraStart: number,
  extraLength: number,
  originalName: Uint8Array,
  entryIndex: number,
): Uint8Array | undefined {
  const extraEnd = extraStart + extraLength;
  let cursor = extraStart;
  let unicodePath: Uint8Array | undefined;

  while (cursor < extraEnd) {
    requireRange(cursor, 4, extraEnd, `champ supplémentaire tronqué à l’entrée ${entryIndex + 1}.`);
    const fieldId = view.getUint16(cursor, true);
    const fieldLength = view.getUint16(cursor + 2, true);
    cursor += 4;
    requireRange(
      cursor,
      fieldLength,
      extraEnd,
      `champ supplémentaire débordant à l’entrée ${entryIndex + 1}.`,
    );

    // The application rejects files above 500 MiB and archives above 5,000
    // entries, so ZIP64 is unnecessary here. Failing closed avoids partial
    // support of its 64-bit offsets and ambiguous local-header resolution.
    if (fieldId === 0x0001) {
      invalidZip('format ZIP64 non pris en charge pour cet import.');
    }

    if (fieldId === 0x7075) {
      if (unicodePath !== undefined) {
        invalidZip(`plusieurs noms Unicode à l’entrée ${entryIndex + 1}.`);
      }
      if (fieldLength < 5) {
        invalidZip(`nom Unicode tronqué à l’entrée ${entryIndex + 1}.`);
      }
      const version = bytes[cursor];
      const expectedCrc = view.getUint32(cursor + 1, true);
      if (version === 1 && expectedCrc === crc32(originalName)) {
        unicodePath = bytes.subarray(cursor + 5, cursor + fieldLength);
      }
    }

    cursor += fieldLength;
  }

  return unicodePath;
}

function decodeEntryPath(
  view: DataView,
  bytes: Uint8Array,
  nameBytes: Uint8Array,
  extraStart: number,
  extraLength: number,
  flags: number,
  entryIndex: number,
): string {
  const unicodePath = unicodePathFromExtra(
    view,
    bytes,
    extraStart,
    extraLength,
    nameBytes,
    entryIndex,
  );
  if ((flags & UTF8_FLAG) !== 0) return decodeUtf8(nameBytes, entryIndex);
  return decodeUtf8(unicodePath ?? nameBytes, entryIndex);
}

function resolveLikeJsZip(path: string): string {
  const result: string[] = [];
  const parts = path.split('/');
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (part === '.' || (part === '' && index !== 0 && index !== parts.length - 1)) {
      continue;
    }
    if (part === '..') result.pop();
    else result.push(part);
  }
  return result.join('/');
}

function findEndOfCentralDirectory(view: DataView): number {
  if (view.byteLength < EOCD_LENGTH) invalidZip('fin du répertoire central introuvable.');

  const earliest = Math.max(0, view.byteLength - EOCD_LENGTH - MAX_ZIP_COMMENT_LENGTH);
  const candidates: number[] = [];
  for (let offset = view.byteLength - EOCD_LENGTH; offset >= earliest; offset -= 1) {
    if (view.getUint32(offset, true) !== EOCD_SIGNATURE) continue;
    const commentLength = view.getUint16(offset + 20, true);
    if (offset + EOCD_LENGTH + commentLength === view.byteLength) candidates.push(offset);
  }

  if (candidates.length === 0) invalidZip('fin du répertoire central introuvable ou données finales inattendues.');
  if (candidates.length > 1) invalidZip('plusieurs fins de répertoire central ambiguës.');
  return candidates[0];
}

/**
 * Validate every raw central-directory path before JSZip can normalize and
 * overwrite colliding entries. This parser intentionally fails closed for
 * multi-volume and ZIP64 archives, which exceed this application's import
 * envelope and need substantially more offset semantics.
 */
export function assertSafeZipCentralDirectory(data: ArrayBuffer): SafeZipDirectory {
  const bytes = new Uint8Array(data);
  const view = new DataView(data);
  const eocdOffset = findEndOfCentralDirectory(view);

  const diskNumber = view.getUint16(eocdOffset + 4, true);
  const centralDirectoryDisk = view.getUint16(eocdOffset + 6, true);
  const entriesOnDisk = view.getUint16(eocdOffset + 8, true);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectorySize = view.getUint32(eocdOffset + 12, true);
  const logicalCentralDirectoryOffset = view.getUint32(eocdOffset + 16, true);

  if (
    diskNumber === 0xffff ||
    centralDirectoryDisk === 0xffff ||
    entriesOnDisk === 0xffff ||
    entryCount === 0xffff ||
    centralDirectorySize === 0xffffffff ||
    logicalCentralDirectoryOffset === 0xffffffff
  ) {
    invalidZip('format ZIP64 non pris en charge pour cet import.');
  }
  if (diskNumber !== 0 || centralDirectoryDisk !== 0 || entriesOnDisk !== entryCount) {
    invalidZip('archives ZIP multi-volume non prises en charge.');
  }

  const countCheck = checkArchiveEntryCount(entryCount);
  if (!countCheck.ok) invalidZip(countCheck.reason ?? 'nombre d’entrées invalide.');
  if (centralDirectorySize > eocdOffset) invalidZip('taille du répertoire central incohérente.');

  const centralDirectoryStart = eocdOffset - centralDirectorySize;
  const prefixLength = centralDirectoryStart - logicalCentralDirectoryOffset;
  if (prefixLength < 0) invalidZip('position du répertoire central incohérente.');

  const exactPaths = new Set<string>();
  const portablePaths = new Set<string>();
  const localOffsets = new Set<number>();
  const localRanges: Array<{ start: number; end: number }> = [];
  let cursor = centralDirectoryStart;

  for (let entryIndex = 0; entryIndex < entryCount; entryIndex += 1) {
    requireRange(
      cursor,
      CENTRAL_FILE_HEADER_LENGTH,
      eocdOffset,
      `en-tête central tronqué à l’entrée ${entryIndex + 1}.`,
    );
    if (view.getUint32(cursor, true) !== CENTRAL_FILE_HEADER_SIGNATURE) {
      invalidZip(`signature centrale invalide à l’entrée ${entryIndex + 1}.`);
    }

    const flags = view.getUint16(cursor + 8, true);
    const compressionMethod = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const uncompressedSize = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const diskStart = view.getUint16(cursor + 34, true);
    const logicalLocalOffset = view.getUint32(cursor + 42, true);

    if ((flags & ENCRYPTED_FLAG) !== 0) invalidZip('archives chiffrées non prises en charge.');
    if (
      compressedSize === 0xffffffff ||
      uncompressedSize === 0xffffffff ||
      diskStart === 0xffff ||
      logicalLocalOffset === 0xffffffff
    ) {
      invalidZip('entrée ZIP64 non prise en charge pour cet import.');
    }
    if (diskStart !== 0) invalidZip('entrée répartie sur plusieurs volumes.');

    const nameStart = cursor + CENTRAL_FILE_HEADER_LENGTH;
    const extraStart = nameStart + nameLength;
    const nextCursor = extraStart + extraLength + commentLength;
    requireRange(
      nameStart,
      nameLength + extraLength + commentLength,
      eocdOffset,
      `entrée centrale débordante à l’entrée ${entryIndex + 1}.`,
    );
    if (nameLength === 0) invalidZip(`nom vide à l’entrée ${entryIndex + 1}.`);

    const centralNameBytes = bytes.subarray(nameStart, nameStart + nameLength);
    const decodedPath = decodeEntryPath(
      view,
      bytes,
      centralNameBytes,
      extraStart,
      extraLength,
      flags,
      entryIndex,
    );
    const validationPath = decodedPath.endsWith('/') ? decodedPath.slice(0, -1) : decodedPath;
    const pathCheck = checkArchivePath(validationPath);
    if (!pathCheck.ok) {
      invalidZip(`chemin dangereux à l’entrée ${entryIndex + 1} (${pathCheck.reason})`);
    }

    const resolvedPath = resolveLikeJsZip(decodedPath).replace(/\/$/, '');
    const portablePath = resolvedPath.normalize('NFC').toLocaleLowerCase('en-US');
    if (exactPaths.has(resolvedPath) || portablePaths.has(portablePath)) {
      invalidZip(`collision de chemins à l’entrée ${entryIndex + 1}.`);
    }
    exactPaths.add(resolvedPath);
    portablePaths.add(portablePath);

    const localOffset = prefixLength + logicalLocalOffset;
    if (localOffsets.has(localOffset)) {
      invalidZip(`en-tête local réutilisé à l’entrée ${entryIndex + 1}.`);
    }
    localOffsets.add(localOffset);
    requireRange(
      localOffset,
      LOCAL_FILE_HEADER_LENGTH,
      centralDirectoryStart,
      `en-tête local invalide à l’entrée ${entryIndex + 1}.`,
    );
    if (view.getUint32(localOffset, true) !== LOCAL_FILE_HEADER_SIGNATURE) {
      invalidZip(`signature locale invalide à l’entrée ${entryIndex + 1}.`);
    }

    const localFlags = view.getUint16(localOffset + 6, true);
    const localCompressionMethod = view.getUint16(localOffset + 8, true);
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const localNameStart = localOffset + LOCAL_FILE_HEADER_LENGTH;
    const dataStart = localNameStart + localNameLength + localExtraLength;
    requireRange(
      localNameStart,
      localNameLength + localExtraLength,
      centralDirectoryStart,
      `en-tête local débordant à l’entrée ${entryIndex + 1}.`,
    );
    requireRange(
      dataStart,
      compressedSize,
      centralDirectoryStart,
      `données compressées débordantes à l’entrée ${entryIndex + 1}.`,
    );

    const relevantFlags = UTF8_FLAG | ENCRYPTED_FLAG | DATA_DESCRIPTOR_FLAG;
    if (
      localCompressionMethod !== compressionMethod ||
      (localFlags & relevantFlags) !== (flags & relevantFlags)
    ) {
      invalidZip(`en-têtes local et central incohérents à l’entrée ${entryIndex + 1}.`);
    }
    const localNameBytes = bytes.subarray(localNameStart, localNameStart + localNameLength);
    if (!bytesEqual(localNameBytes, centralNameBytes)) {
      invalidZip(`noms local et central différents à l’entrée ${entryIndex + 1}.`);
    }

    localRanges.push({ start: localOffset, end: dataStart + compressedSize });
    cursor = nextCursor;
  }

  if (cursor !== eocdOffset) {
    invalidZip('contenu inattendu dans le répertoire central.');
  }

  localRanges.sort((left, right) => left.start - right.start);
  for (let index = 1; index < localRanges.length; index += 1) {
    if (localRanges[index].start < localRanges[index - 1].end) {
      invalidZip('plages de données locales superposées.');
    }
  }

  return { entryCount };
}
