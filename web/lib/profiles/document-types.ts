import { getIndustryProfile } from './index';
import type { IndustryProfileId } from './types';

export function getDocumentTypesForProfile(profileId: IndustryProfileId) {
  return getIndustryProfile(profileId).documentTypes;
}
