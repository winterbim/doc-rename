import { getIndustryProfile } from './index';
import type { IndustryProfileId } from './types';

export function getTemplatesForProfile(profileId: IndustryProfileId) {
  return getIndustryProfile(profileId).templates;
}
