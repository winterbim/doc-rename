import { describe, expect, it } from 'vitest';
import {
  INDUSTRY_PROFILES,
  createDefaultFieldsForProfile,
  getActiveFieldsForProfile,
  getIndustryProfile,
  getProfileFieldDefinitions,
  normalizeFieldValuesForGeneration,
} from '..';

function labels(profileId: Parameters<typeof getIndustryProfile>[0]): string[] {
  return getIndustryProfile(profileId).documentTypes.map((item) => item.label);
}

describe('industry profiles', () => {
  it('keeps document types separated by domain', () => {
    expect(labels('finance')).not.toContain('Fichier IFC');
    expect(labels('hr')).not.toContain('Maquette numerique');
    expect(labels('bim-construction')).not.toContain('Fiche de paie');
    expect(labels('healthcare')).not.toContain('Grand livre');
    expect(labels('legal')).not.toContain('Rapport BIM');
  });

  it('exposes BIM regression templates', () => {
    const ids = getIndustryProfile('bim-construction').templates.map((template) => template.id);
    expect(ids).toEqual(expect.arrayContaining(['iso19650', 'swiss-bim', 'french-bim', 'cde-delivery']));
  });

  it('creates default fields from the selected profile template', () => {
    expect(createDefaultFieldsForProfile('finance').activeFieldIds).toEqual([
      'entity',
      'year',
      'month',
      'docType',
      'reference',
      'status',
    ]);
    expect(createDefaultFieldsForProfile('bim-construction').activeFieldIds).toEqual([
      'project',
      'building',
      'workLot',
      'docType',
      'company',
      'sequence',
    ]);
  });

  it('shows only fields belonging to the active profile', () => {
    const fieldsState = createDefaultFieldsForProfile('finance');
    const fields = getActiveFieldsForProfile(fieldsState, 'finance');
    expect(fields.map((field) => field.id)).toEqual([
      'entity',
      'year',
      'month',
      'docType',
      'reference',
      'status',
    ]);
    expect(getProfileFieldDefinitions('finance').some((field) => field.id === 'workLot')).toBe(false);
  });

  it('merges imported BIM companies with the built-in company catalog', () => {
    const fields = getProfileFieldDefinitions('bim-construction', [
      {
        id: 'bim-construction:ACME_BIM',
        code: 'ACME_BIM',
        label: 'Acme BIM Conseil',
      },
    ]);
    const companyOptions = fields.find((field) => field.id === 'company')?.options;

    expect(Array.isArray(companyOptions)).toBe(true);
    if (!Array.isArray(companyOptions)) return;
    expect(companyOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'BOUYGUES_BATIMENT' }),
        expect.objectContaining({ code: 'ACME_BIM', name: 'ACME_BIM - Acme BIM Conseil' }),
      ]),
    );
  });

  it('adapts generated field values to the selected separator', () => {
    const values = normalizeFieldValuesForGeneration(
      { entity: 'service qualite', docType: 'RAP_QUAL', version: 'v01' },
      'healthcare',
      '-',
    );

    expect(values).toEqual({
      entity: 'SERVICE-QUALITE',
      docType: 'RAP-QUAL',
      version: 'V01',
    });
  });

  it('defines every listed profile with at least one template and one document type', () => {
    for (const profile of INDUSTRY_PROFILES) {
      expect(profile.templates.length, profile.id).toBeGreaterThan(0);
      expect(profile.documentTypes.length, profile.id).toBeGreaterThan(0);
      expect(profile.fields.length, profile.id).toBeGreaterThan(0);
    }
  });

  it('keeps every template field backed by an available field definition', () => {
    for (const profile of INDUSTRY_PROFILES) {
      const available = new Set(getProfileFieldDefinitions(profile.id).map((field) => field.id));
      for (const template of profile.templates) {
        for (const fieldId of template.fields) {
          expect(available.has(fieldId), `${profile.id}/${template.id}/${fieldId}`).toBe(true);
        }
      }
    }
  });
});
