import type { FieldDefinition } from '@/lib/rename-engine/types';
import type { FieldsState } from '@/lib/rename-engine/fields';
import { COMPANIES } from '@/lib/rename-engine/config/companies';
import { INDUSTRY_PROFILES } from './industry-profiles';
import { adaptAbbreviationSeparator, normalizeFieldValue } from './normalization';
import type {
  IndustryProfile,
  IndustryProfileId,
  NamingField,
  NamingTemplate,
  ProfileEntity,
} from './types';

export { INDUSTRY_PROFILES } from './industry-profiles';
export type {
  DocumentTypeDefinition,
  EntityTypeDefinition,
  IndustryProfile,
  IndustryProfileId,
  NamingField,
  NamingTemplate,
  ProfileEntitiesById,
  ProfileEntity,
  Separator,
} from './types';
export {
  adaptAbbreviationSeparator,
  findKnownAbbreviation,
  normalizeDocumentName,
  normalizeFieldValue,
  normalizeNameParts,
  stripAccents,
} from './normalization';
export { getProfileEntityStorageKey, importEntitiesFromText, mergeProfileEntities } from './entities';

export const DEFAULT_PROFILE_ID: IndustryProfileId = 'bim-construction';

/**
 * Optional commercial gate. Product truth is multi-industry (all profiles).
 * Set `NEXT_PUBLIC_BIM_ONLY=true` only if a deployment must temporarily expose
 * the BIM profile alone. Default / unset = full multi-métier catalog.
 *
 * Read from `process.env` so Next.js inlines the value at build time.
 */
export const BIM_ONLY = process.env.NEXT_PUBLIC_BIM_ONLY === 'true';

const ALL_PROFILE_OPTIONS = INDUSTRY_PROFILES.map((profile) => ({
  id: profile.id,
  label: profile.label,
  shortLabel: profile.shortLabel,
}));

const BIM_ONLY_PROFILE_OPTIONS = ALL_PROFILE_OPTIONS.filter(
  (option) => option.id === DEFAULT_PROFILE_ID,
);

export const PROFILE_OPTIONS = BIM_ONLY ? BIM_ONLY_PROFILE_OPTIONS : ALL_PROFILE_OPTIONS;

/**
 * Coerce any persisted profileId to BIM when the BIM_ONLY gate is active.
 * Users who selected, say, "finance" in V0 must not see broken UI in V1.
 */
export function coercePublicProfileId(value: IndustryProfileId): IndustryProfileId {
  if (BIM_ONLY && value !== DEFAULT_PROFILE_ID) return DEFAULT_PROFILE_ID;
  return value;
}

export function isIndustryProfileId(value: string): value is IndustryProfileId {
  return INDUSTRY_PROFILES.some((profile) => profile.id === value);
}

export function getIndustryProfile(profileId: IndustryProfileId): IndustryProfile {
  return INDUSTRY_PROFILES.find((profile) => profile.id === profileId) ?? INDUSTRY_PROFILES[0];
}

export function getProfileTemplate(
  profileId: IndustryProfileId,
  templateId: string,
): NamingTemplate | null {
  return getIndustryProfile(profileId).templates.find((template) => template.id === templateId) ?? null;
}

function inputTypeForField(field: NamingField): FieldDefinition['inputType'] {
  if (field.kind === 'date') return 'date';
  if (field.kind === 'number') return 'number';
  if (field.kind === 'document-type' || field.kind === 'status' || field.kind === 'select') return 'select';
  return 'text';
}

function optionsForField(
  profile: IndustryProfile,
  field: NamingField,
  entities: ProfileEntity[],
): FieldDefinition['options'] {
  if (profile.id === 'bim-construction') {
    if (field.id === 'docType') return 'documentTypes';
    if (field.id === 'workLot') return 'workLots';
    if (field.id === 'discipline') return 'disciplines';
    if (field.id === 'company') {
      if (entities.length === 0) return 'companies';

      const options = new Map(
        COMPANIES.map((company) => [
          company.code,
          { code: company.code, name: company.name },
        ]),
      );
      for (const entity of entities) {
        options.set(entity.code, {
          code: entity.code,
          name: `${entity.code} - ${entity.label}`,
        });
      }
      return Array.from(options.values());
    }
  }

  if (field.kind === 'document-type') {
    return profile.documentTypes.map((item) => ({
      code: item.abbreviation,
      name: `${item.abbreviation} - ${item.label}`,
    }));
  }

  if (field.kind === 'status') {
    return profile.statuses.map((item) => ({
      code: item.abbreviation,
      name: `${item.abbreviation} - ${item.label}`,
    }));
  }

  if (field.kind === 'entity' && entities.length > 0) {
    return entities.map((item) => ({
      code: item.code,
      name: `${item.code} - ${item.label}`,
    }));
  }

  return undefined;
}

export function getProfileFieldDefinitions(
  profileId: IndustryProfileId,
  entities: ProfileEntity[] = [],
): FieldDefinition[] {
  const profile = getIndustryProfile(profileId);
  return profile.fields.map((field) => ({
    id: field.id,
    code: field.shortLabel ?? field.id.toUpperCase(),
    name: field.label,
    type:
      field.id === 'docType'
        ? 'docType'
        : field.id === 'date'
          ? 'date'
          : field.id === 'status'
            ? 'status'
            : field.id === 'filename'
              ? 'filename'
              : 'custom',
    inputType: inputTypeForField(field),
    required: field.required,
    placeholder: field.placeholder,
    description: field.description,
    options: optionsForField(profile, field, entities),
    searchable: field.kind === 'entity' || field.kind === 'document-type',
  }));
}

export function getProfileFieldDefinition(
  profileId: IndustryProfileId,
  fieldId: string,
  entities: ProfileEntity[] = [],
): FieldDefinition | null {
  return getProfileFieldDefinitions(profileId, entities).find((field) => field.id === fieldId) ?? null;
}

export function createDefaultFieldsForProfile(profileId: IndustryProfileId): FieldsState {
  const profile = getIndustryProfile(profileId);
  const defaultTemplate = profile.templates[0];
  return {
    activeFieldIds: [...defaultTemplate.fields],
    values: {},
    workLotPart: null,
  };
}

export function getActiveFieldsForProfile(
  fields: FieldsState,
  profileId: IndustryProfileId,
  entities: ProfileEntity[] = [],
): FieldDefinition[] {
  const definitions = getProfileFieldDefinitions(profileId, entities);
  return fields.activeFieldIds
    .map((id) => definitions.find((field) => field.id === id))
    .filter((field): field is FieldDefinition => Boolean(field));
}

export function getInactiveFieldsForProfile(
  fields: FieldsState,
  profileId: IndustryProfileId,
  entities: ProfileEntity[] = [],
): FieldDefinition[] {
  const active = new Set(fields.activeFieldIds);
  return getProfileFieldDefinitions(profileId, entities).filter((field) => !active.has(field.id));
}

export function sanitizeFieldValuesForProfile(
  values: Record<string, string>,
  profileId: IndustryProfileId,
): Record<string, string> {
  const allowed = new Set(getIndustryProfile(profileId).fields.map((field) => field.id));
  return Object.fromEntries(Object.entries(values).filter(([fieldId]) => allowed.has(fieldId)));
}

export function normalizeFieldValuesForGeneration(
  values: Record<string, string>,
  profileId: IndustryProfileId,
  separator: string,
): Record<string, string> {
  const sep = (separator === '-' || separator === '.') ? separator : '_';
  const profile = getIndustryProfile(profileId);
  const fieldsById = new Map(profile.fields.map((field) => [field.id, field]));

  return Object.fromEntries(
    Object.entries(values).map(([fieldId, value]) => {
      const field = fieldsById.get(fieldId);
      if (!value) return [fieldId, value];
      if (field?.kind === 'document-type' || field?.kind === 'status') {
        return [fieldId, adaptAbbreviationSeparator(value, sep)];
      }
      return [fieldId, normalizeFieldValue(value, profileId, sep)];
    }),
  );
}

export function applyProfileTemplate(fields: FieldsState, template: NamingTemplate): FieldsState {
  const allowed = new Set(template.fields);
  return {
    ...fields,
    activeFieldIds: [...template.fields],
    values: Object.fromEntries(Object.entries(fields.values).filter(([fieldId]) => allowed.has(fieldId))),
  };
}
