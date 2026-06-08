import { normalizeDocumentName } from './normalization';
import type { IndustryProfileId, ProfileEntity } from './types';

export function getProfileEntityStorageKey(profileId: IndustryProfileId): string {
  return `entities:${profileId}`;
}

export function importEntitiesFromText(
  text: string,
  profileId: IndustryProfileId,
): ProfileEntity[] {
  const seen = new Set<string>();
  const entities: ProfileEntity[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const cells = rawLine
      .split(/\t|;|,/)
      .map((part) => part.trim())
      .filter(Boolean);
    const label = cells[0];
    if (!label) continue;

    const normalizedLabel = normalizeDocumentName(label, {
      separator: '_',
      profileId,
      preserveExtension: false,
      applyAbbreviations: false,
    });
    if (['CODE', 'ID', 'NOM', 'NAME', 'ENTREPRISE', 'COMPANY', 'SOCIETE'].includes(normalizedLabel)) {
      continue;
    }

    const code = normalizeDocumentName(label, {
      separator: '_',
      profileId,
      preserveExtension: false,
      applyAbbreviations: false,
    });
    if (!code || seen.has(code)) continue;
    seen.add(code);
    entities.push({
      id: `${profileId}:${code}`,
      code,
      label,
    });
  }

  return entities;
}

export function mergeProfileEntities(
  existing: ProfileEntity[],
  incoming: ProfileEntity[],
): ProfileEntity[] {
  const byCode = new Map(existing.map((item) => [item.code, item]));
  for (const item of incoming) {
    byCode.set(item.code, item);
  }
  return Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code));
}
