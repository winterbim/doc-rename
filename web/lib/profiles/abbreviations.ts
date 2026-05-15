import { getIndustryProfile } from './index';
import type { IndustryProfileId } from './types';

export function getAbbreviationsForProfile(profileId: IndustryProfileId) {
  const profile = getIndustryProfile(profileId);
  return [...profile.documentTypes, ...profile.statuses].map((item) => ({
    label: item.label,
    abbreviation: item.abbreviation,
    aliases: item.aliases ?? [],
  }));
}
