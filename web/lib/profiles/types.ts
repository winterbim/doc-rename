export type Separator = '_' | '-' | '.';

export type TextCaseMode = 'uppercase';

export type IndustryProfileId =
  | 'bim-construction'
  | 'finance'
  | 'healthcare'
  | 'hr'
  | 'administration'
  | 'legal'
  | 'industry'
  | 'real-estate'
  | 'custom';

export type NamingFieldKind =
  | 'free-text'
  | 'select'
  | 'date'
  | 'number'
  | 'entity'
  | 'document-type'
  | 'status'
  | 'revision'
  | 'version';

export type NamingField = {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  kind: NamingFieldKind;
  required?: boolean;
  placeholder?: string;
  examples?: string[];
};

export type DocumentTypeDefinition = {
  id: string;
  label: string;
  abbreviation: string;
  description?: string;
  category?: string;
  aliases?: string[];
};

export type EntityTypeDefinition = {
  id: string;
  label: string;
  pluralLabel: string;
  description?: string;
  examples?: string[];
};

export type NamingTemplate = {
  id: string;
  label: string;
  description: string;
  fields: string[];
  defaultSeparator: Separator;
  example: string;
  disclaimer?: string;
};

export type IndustryProfile = {
  id: IndustryProfileId;
  label: string;
  shortLabel: string;
  description: string;
  recommendedFor: string[];
  entityTypes: EntityTypeDefinition[];
  fields: NamingField[];
  documentTypes: DocumentTypeDefinition[];
  statuses: DocumentTypeDefinition[];
  templates: NamingTemplate[];
  defaultSeparator: Separator;
  entityImportLabel: string;
  disclaimers?: string[];
};

export type ProfileEntity = {
  id: string;
  code: string;
  label: string;
  typeId?: string;
};

export type ProfileEntitiesById = Partial<Record<IndustryProfileId, ProfileEntity[]>>;
