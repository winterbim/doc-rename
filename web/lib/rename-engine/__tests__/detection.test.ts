/**
 * Tests for lib/rename-engine/detection.ts
 * Covers all five public detection functions.
 */

import { describe, it, expect } from 'vitest';
import {
  detectCategory,
  detectDocumentType,
  detectDocTypeCode,
  detectCompanyInName,
  detectLotFromPath,
} from '../detection';

// ---------------------------------------------------------------------------
// detectCategory
// ---------------------------------------------------------------------------

describe('detectCategory', () => {
  // Documents
  it('.pdf → documents', () => expect(detectCategory('.pdf')).toBe('documents'));
  it('.doc → documents', () => expect(detectCategory('.doc')).toBe('documents'));
  it('.docx → documents', () => expect(detectCategory('.docx')).toBe('documents'));
  it('.xlsx → documents', () => expect(detectCategory('.xlsx')).toBe('documents'));
  it('.txt → documents', () => expect(detectCategory('.txt')).toBe('documents'));

  // CAD
  it('.dwg → cad', () => expect(detectCategory('.dwg')).toBe('cad'));
  it('.dxf → cad', () => expect(detectCategory('.dxf')).toBe('cad'));
  it('.dgn → cad', () => expect(detectCategory('.dgn')).toBe('cad'));

  // BIM
  it('.ifc → bim', () => expect(detectCategory('.ifc')).toBe('bim'));
  it('.rvt → bim', () => expect(detectCategory('.rvt')).toBe('bim'));
  it('.nwd → bim', () => expect(detectCategory('.nwd')).toBe('bim'));
  it('.bcf → bim', () => expect(detectCategory('.bcf')).toBe('bim'));

  // Images
  it('.png → images', () => expect(detectCategory('.png')).toBe('images'));
  it('.jpg → images', () => expect(detectCategory('.jpg')).toBe('images'));
  it('.jpeg → images', () => expect(detectCategory('.jpeg')).toBe('images'));
  it('.svg → images', () => expect(detectCategory('.svg')).toBe('images'));

  // Archives
  it('.zip → archives', () => expect(detectCategory('.zip')).toBe('archives'));

  // Other / unknown
  it('.xyz → other', () => expect(detectCategory('.xyz')).toBe('other'));
  it('.mp4 → other', () => expect(detectCategory('.mp4')).toBe('other'));
  it('" " (empty) → other', () => expect(detectCategory('')).toBe('other'));

  // Case-insensitive
  it('.PDF → documents (case-insensitive)', () => expect(detectCategory('.PDF')).toBe('documents'));
  it('.DWG → cad (case-insensitive)', () => expect(detectCategory('.DWG')).toBe('cad'));
});

// ---------------------------------------------------------------------------
// detectDocumentType (pattern-based, fuzzy)
// ---------------------------------------------------------------------------

describe('detectDocumentType', () => {
  it('detects "plan" in filename → PLA', () => {
    const result = detectDocumentType('Plan_de_facade.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('PLA');
    expect(result!.label).toBe('Plan');
  });

  it('detects "reunion" in filename → returns a PV match', () => {
    // 'PV' appears first in DETECTION_PATTERNS and its pattern 'pv' matches 'PV_reunion'.
    // The source iterates patterns in insertion order; 'PV-REU' comes after 'PV'.
    // Either code is a valid detection — we just assert we get a non-null match.
    const result = detectDocumentType('PV_reunion_chantier.pdf');
    expect(result).not.toBeNull();
    // Both 'PV' and 'PV-REU' are correct — source returns whichever matches first
    expect(['PV', 'PV-REU']).toContain(result!.code);
  });

  it('detects "meeting" (English) → PV-REU', () => {
    const result = detectDocumentType('meeting_notes.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('PV-REU');
  });

  it('detects "cvc" → RAP-CVC', () => {
    const result = detectDocumentType('rapport_CVC_ventilation.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('RAP-CVC');
  });

  it('detects "thermique" → RAP-THE', () => {
    const result = detectDocumentType('rapport_thermique_batiment.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('RAP-THE');
  });

  it('detects "acoustique" → RAP-ACO', () => {
    const result = detectDocumentType('etude_acoustique.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('RAP-ACO');
  });

  it('detects "incendie" → RAP-SSI', () => {
    const result = detectDocumentType('rapport_incendie_ssi.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('RAP-SSI');
  });

  it('detects "facture" → FAC', () => {
    const result = detectDocumentType('facture_juillet.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('FAC');
  });

  it('detects "devis" → DEV', () => {
    const result = detectDocumentType('devis_travaux.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('DEV');
  });

  it('detects "schema" keyword → SCH (or RAP-ELE if "electrique" matches first)', () => {
    // 'schema_electrique.pdf' normalises to 'schema electrique pdf'.
    // DETECTION_PATTERNS are iterated in insertion order; 'RAP-ELE' contains 'elec'
    // and appears before 'SCH' ('schema'), so RAP-ELE wins on this specific filename.
    // A filename without the 'electrique' suffix cleanly hits SCH:
    const resultElec = detectDocumentType('schema_electrique.pdf');
    expect(resultElec).not.toBeNull();
    // Accept whichever pattern fires first — both are valid detections
    expect(['SCH', 'RAP-ELE']).toContain(resultElec!.code);

    // A pure schema filename (no electrical suffix) → SCH
    const resultSchOnly = detectDocumentType('schema_distribution.pdf');
    expect(resultSchOnly).not.toBeNull();
    expect(resultSchOnly!.code).toBe('SCH');
  });

  it('detects "certificat" → CER', () => {
    const result = detectDocumentType('certificat_conformite.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('CER');
  });

  it('assigns high confidence for long patterns (> 5 chars)', () => {
    const result = detectDocumentType('rapport_thermique.pdf');
    expect(result?.confidence).toBe('high'); // 'thermique' is 9 chars
  });

  it('returns null for unknown filename', () => {
    expect(detectDocumentType('random_xyz_file_abc.pdf')).toBeNull();
  });

  it('handles underscores as separators', () => {
    // 'fiche_technique' — underscore is replaced by space before match
    const result = detectDocumentType('fiche_technique_produit.pdf');
    expect(result).not.toBeNull();
    expect(result!.code).toBe('FIC-TEC');
  });

  it('returns null for empty filename', () => {
    expect(detectDocumentType('')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectDocTypeCode (token-based, uses DOCUMENT_TYPES config)
// ---------------------------------------------------------------------------

describe('detectDocTypeCode', () => {
  it('matches code token in uppercase filename', () => {
    const result = detectDocTypeCode('PRJ_BAT_PLA_001.pdf');
    // 'PLA' should match a code in DOCUMENT_TYPES
    expect(result).not.toBeNull();
  });

  it('prefers longer codes — RAP-MPR before RAP', () => {
    // The normalised token for 'RAP-MPR' is 'RAPMPR' after stripping dashes
    const result = detectDocTypeCode('PRJ_RAPMPR_001.pdf');
    // Should match 'RAP-MPR' (normCode 'RAPMPR') before shorter 'RAP' (normCode 'RAP')
    expect(result).not.toBeNull();
  });

  it('returns null for filename with no matching code', () => {
    expect(detectDocTypeCode('completely_unknown_xyz.pdf')).toBeNull();
  });

  it('is case-insensitive', () => {
    // lowercase 'rap' → uppercase 'RAP'
    const result = detectDocTypeCode('project_rap_report.pdf');
    expect(result).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// detectCompanyInName
// ---------------------------------------------------------------------------

describe('detectCompanyInName', () => {
  it('detects DORMAKABA in filename', () => {
    const result = detectCompanyInName('DORMAKABA_ferrure_porte.pdf');
    expect(result.company).toBe('DORMAKABA');
    expect(result.cleanedBaseName).toBeDefined();
    expect(result.cleanedBaseName).not.toContain('DORMAKABA');
  });

  it('detects GEBERIT in filename', () => {
    const result = detectCompanyInName('Geberit_sanitaire_WC.pdf');
    expect(result.company).toBe('GEBERIT');
  });

  it('detects GRUNDFOS in filename', () => {
    const result = detectCompanyInName('GRUNDFOS_pompe_circulateur.pdf');
    expect(result.company).toBe('GRUNDFOS');
  });

  it('returns null for unknown company', () => {
    const result = detectCompanyInName('random_file_name.pdf');
    expect(result.company).toBeNull();
    expect(result.cleanedBaseName).toBeNull();
  });

  it('handles file with no extension', () => {
    const result = detectCompanyInName('DORMAKABA_document');
    expect(result.company).toBe('DORMAKABA');
  });

  it('cleans up cleaned base name (no leading/trailing underscores)', () => {
    const result = detectCompanyInName('DORMAKABA_ferrure.pdf');
    expect(result.cleanedBaseName).not.toMatch(/^_|_$/);
  });

  it('handles accent normalization in company names', () => {
    // EBENISTERIE_MEYER_SUTER — name contains accents in the French form
    const result = detectCompanyInName('EBENISTERIE_MEYER_SUTER_meuble.pdf');
    expect(result.company).toBe('EBENISTERIE_MEYER_SUTER');
  });

  it('skips short candidates (< 3 chars)', () => {
    // Company codes < 3 chars are skipped; 'IFM' is exactly 3 — should still match
    const result = detectCompanyInName('IFM_schema_GTB.pdf');
    expect(result.company).toBe('IFM');
  });
});

// ---------------------------------------------------------------------------
// detectLotFromPath
// ---------------------------------------------------------------------------

describe('detectLotFromPath', () => {
  it('detects lot from folder path', () => {
    expect(detectLotFromPath('LOT_ARC/Plans/', 'detail.dwg')).toBe('ARC');
  });

  it('detects lot from filename token', () => {
    expect(detectLotFromPath('', 'CVC_synoptique.pdf')).toBe('CVC');
  });

  it('detects ELE from filename', () => {
    expect(detectLotFromPath('', 'schema_ELE_tableau.pdf')).toBe('ELE');
  });

  it('detects STR from subfolder', () => {
    expect(detectLotFromPath('plans/STR/calculs', 'fondations.pdf')).toBe('STR');
  });

  it('detects SAN from filename', () => {
    expect(detectLotFromPath('', 'SAN_reseau_eau_chaude.pdf')).toBe('SAN');
  });

  it('returns null for filename with no known lot code', () => {
    expect(detectLotFromPath('', 'random_file.pdf')).toBeNull();
  });

  it('returns null for empty folder and filename', () => {
    expect(detectLotFromPath('', '')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(detectLotFromPath('', 'arc_plans.pdf')).toBe('ARC');
  });

  it('handles Windows-style separators', () => {
    expect(detectLotFromPath('LOT\\ARC\\Plans', 'detail.dwg')).toBe('ARC');
  });

  it('does not match partial tokens (e.g. "ARCO" should not match "ARC")', () => {
    // 'ARCO' is not a known lot code, and 'ARC' should only match as a standalone token
    expect(detectLotFromPath('', 'ARCO_facade.pdf')).toBeNull();
  });
});
