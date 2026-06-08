import { describe, expect, it } from 'vitest';
import {
  adaptAbbreviationSeparator,
  findKnownAbbreviation,
  normalizeDocumentName,
  normalizeNameParts,
} from '../normalization';
import { importEntitiesFromText, getProfileEntityStorageKey } from '../entities';

describe('profile normalization', () => {
  it('removes accents, uppercases and replaces spaces with the selected separator', () => {
    expect(normalizeDocumentName('equipe batiment / controle qualite', { separator: '_' })).toBe(
      'EQUIPE_BATIMENT_CTRL_QUALITE',
    );
    expect(normalizeDocumentName("rapport d'audit", { separator: '-' })).toBe('RAP-AUDIT');
    expect(normalizeDocumentName("rapport d'audit", { separator: '.' })).toBe('RAP.AUDIT');
  });

  it('collapses repeated separators and trims boundaries', () => {
    expect(normalizeDocumentName('__controle---qualite.. ', { separator: '_' })).toBe(
      'CTRL_QUALITE',
    );
  });

  it('preserves file extensions', () => {
    expect(
      normalizeDocumentName("rapport d'audit.pdf", {
        separator: '_',
      }),
    ).toBe('RAP_AUDIT.pdf');
  });

  it('ignores empty fields when composing names', () => {
    expect(normalizeNameParts(['CLIENT', '', 'rapport financier', undefined, 'V01'], '_', 'finance')).toBe(
      'CLIENT_RAPFIN_V01',
    );
  });

  it('removes dangerous filename characters', () => {
    expect(normalizeDocumentName('service:qualite/rapport*final?', { separator: '_' })).toBe(
      'SERVICE_QUALITE_RAP_FINAL',
    );
  });

  it('adapts compound abbreviations to the selected separator', () => {
    expect(adaptAbbreviationSeparator('RAP_QUAL', '_')).toBe('RAP_QUAL');
    expect(adaptAbbreviationSeparator('RAP_QUAL', '-')).toBe('RAP-QUAL');
    expect(adaptAbbreviationSeparator('RAP_QUAL', '.')).toBe('RAP.QUAL');
  });

  it('applies abbreviations per profile', () => {
    expect(findKnownAbbreviation('documents techniques', 'bim-construction', '_')).toBe('DOCTECH');
    expect(findKnownAbbreviation('fiche de paie', 'hr', '_')).toBe('FDP');
    expect(findKnownAbbreviation('rapport financier', 'finance', '_')).toBe('RAPFIN');
    expect(findKnownAbbreviation('procedure', 'healthcare', '_')).toBe('PROC');
    expect(findKnownAbbreviation('contrat', 'legal', '_')).toBe('CTR');
    expect(findKnownAbbreviation('fiche technique', 'industry', '_')).toBe('FT');
    expect(findKnownAbbreviation('etat des lieux', 'real-estate', '_')).toBe('EDL');
  });
});

describe('profile entities', () => {
  it('imports pasted entities, normalizes them and removes duplicates', () => {
    const entities = importEntitiesFromText('Service qualite\nservice qualite\nBureau etudes\tignored', 'industry');

    expect(entities).toEqual([
      { id: 'industry:SERVICE_QUALITE', code: 'SERVICE_QUALITE', label: 'Service qualite' },
      { id: 'industry:BUREAU_ETUDES', code: 'BUREAU_ETUDES', label: 'Bureau etudes' },
    ]);
  });

  it('imports spreadsheet-like company lists and skips common headers', () => {
    const entities = importEntitiesFromText(
      'Entreprise\tCode\nEntreprise generale;ignored\nBureau controle,ignored',
      'bim-construction',
    );

    expect(entities).toEqual([
      {
        id: 'bim-construction:ENTREPRISE_GENERALE',
        code: 'ENTREPRISE_GENERALE',
        label: 'Entreprise generale',
      },
      {
        id: 'bim-construction:BUREAU_CTRL',
        code: 'BUREAU_CTRL',
        label: 'Bureau controle',
      },
    ]);
  });

  it('uses profile-scoped storage keys', () => {
    expect(getProfileEntityStorageKey('bim-construction')).toBe('entities:bim-construction');
    expect(getProfileEntityStorageKey('finance')).toBe('entities:finance');
  });
});
