import { INDUSTRY_PROFILES } from './industry-profiles';
import type { IndustryProfileId, Separator } from './types';

type NormalizeOptions = {
  separator?: Separator;
  profileId?: IndustryProfileId;
  preserveExtension?: boolean;
  applyAbbreviations?: boolean;
};

const DEFAULT_SEPARATOR: Separator = '_';
const STOP_WORDS = new Set(['D', 'L', 'LE', 'LA', 'LES', 'DE', 'DU', 'DES', 'UN', 'UNE', 'ET', 'A', 'AU', 'AUX']);
const WORD_ABBREVIATIONS: Record<string, string> = {
  RAPPORT: 'RAP',
  CONTROLE: 'CTRL',
  COMPTE: 'CR',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripAccents(value: string): string {
  return value
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function adaptAbbreviationSeparator(value: string, separator: Separator = DEFAULT_SEPARATOR): string {
  const sep = escapeRegExp(separator);
  return stripAccents(value)
    .toUpperCase()
    .replace(/[_.-]+/g, separator)
    .replace(new RegExp(`${sep}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${sep}|${sep}$`, 'g'), '');
}

function splitExtension(input: string): { base: string; extension: string } {
  const trimmed = input.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === trimmed.length - 1) return { base: trimmed, extension: '' };
  return { base: trimmed.slice(0, lastDot), extension: trimmed.slice(lastDot) };
}

function normalizeWords(value: string, separator: Separator): string {
  const sep = escapeRegExp(separator);
  const cleaned = stripAccents(value)
    .toUpperCase()
    .replace(/['’]/g, separator)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, separator)
    .replace(/[()[\]{}]/g, separator)
    .replace(/&/g, separator)
    .replace(/[^A-Z0-9_.-]+/g, separator)
    .replace(/[_.-]+/g, separator)
    .replace(new RegExp(`${sep}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${sep}|${sep}$`, 'g'), '');

  return cleaned
    .split(separator)
    .filter((part) => part && !STOP_WORDS.has(part))
    .map((part, index, parts) => {
      if (part === 'RENDU' && parts[index - 1] === 'COMPTE') return '';
      return WORD_ABBREVIATIONS[part] ?? part;
    })
    .filter(Boolean)
    .join(separator)
    .replace(new RegExp(`${sep}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${sep}|${sep}$`, 'g'), '');
}

function lookupKey(value: string): string {
  return normalizeWords(value, '_').replace(/_/g, '');
}

export function findKnownAbbreviation(
  value: string,
  profileId: IndustryProfileId,
  separator: Separator = DEFAULT_SEPARATOR,
): string | null {
  const key = lookupKey(value);
  if (!key) return null;
  const profile = INDUSTRY_PROFILES.find((item) => item.id === profileId);
  if (!profile) return null;

  for (const item of [...profile.documentTypes, ...profile.statuses]) {
    const candidates = [item.label, item.abbreviation, ...(item.aliases ?? [])];
    if (candidates.some((candidate) => lookupKey(candidate) === key)) {
      return adaptAbbreviationSeparator(item.abbreviation, separator);
    }
  }

  return null;
}

export function normalizeDocumentName(input: string, options: NormalizeOptions = {}): string {
  const separator = options.separator ?? DEFAULT_SEPARATOR;
  const preserveExtension = options.preserveExtension ?? true;
  const { base, extension } = preserveExtension ? splitExtension(input) : { base: input, extension: '' };
  const profileId = options.profileId;

  const abbreviated =
    options.applyAbbreviations !== false && profileId
      ? findKnownAbbreviation(base, profileId, separator)
      : null;

  const normalizedBase = abbreviated ?? normalizeWords(base, separator);
  if (!normalizedBase) return extension;
  return `${normalizedBase}${extension}`;
}

export function normalizeNameParts(
  parts: Array<string | null | undefined>,
  separator: Separator = DEFAULT_SEPARATOR,
  profileId?: IndustryProfileId,
): string {
  return parts
    .map((part) =>
      part
        ? normalizeDocumentName(part, {
            separator,
            profileId,
            preserveExtension: false,
            applyAbbreviations: true,
          })
        : '',
    )
    .filter(Boolean)
    .join(separator)
    .replace(new RegExp(`${escapeRegExp(separator)}{2,}`, 'g'), separator)
    .replace(new RegExp(`^${escapeRegExp(separator)}|${escapeRegExp(separator)}$`, 'g'), '');
}

export function normalizeFieldValue(
  value: string,
  profileId: IndustryProfileId,
  separator: Separator = DEFAULT_SEPARATOR,
): string {
  return normalizeDocumentName(value, {
    separator,
    profileId,
    preserveExtension: false,
    applyAbbreviations: true,
  });
}
