/**
 * Smart detection patterns for document-type fuzzy matching.
 * Ported 1:1 from extension/js/files.js — FilesManager.DETECTION_PATTERNS
 *
 * Key   = document type code (e.g. 'RAP-CVC')
 * Value = { patterns: string[], label: string }
 *   patterns — substrings (case-insensitive) that trigger this type
 *   label    — human-readable French label
 */
export interface DetectionPattern {
  patterns: readonly string[];
  label: string;
}

export const DETECTION_PATTERNS: Readonly<Record<string, DetectionPattern>> = {
  'RAP-MPR': { patterns: ['mise en pression', 'mep', 'pression'], label: 'Rapport mise en pression' },
  'RAP-ESS': { patterns: ['essai', 'test'], label: 'Rapport essai' },
  'RAP-CTR': { patterns: ['controle', 'contrôle', 'verification', 'vérification'], label: 'Rapport contrôle' },
  'RAP-REC': { patterns: ['reception', 'réception', 'recette'], label: 'Rapport réception' },
  'RAP-THE': { patterns: ['thermique', 'thermographie'], label: 'Rapport thermique' },
  'RAP-ACO': { patterns: ['acoustique', 'bruit', 'sonore'], label: 'Rapport acoustique' },
  'RAP-ELE': { patterns: ['electrique', 'électrique', 'elec'], label: 'Rapport électrique' },
  'RAP-CVC': { patterns: ['cvc', 'hvac', 'climatisation', 'ventilation'], label: 'Rapport CVC' },
  'RAP-PLB': { patterns: ['plomberie', 'sanitaire'], label: 'Rapport plomberie' },
  'RAP-SPK': { patterns: ['sprinkler', 'extinction'], label: 'Rapport sprinkler' },
  'RAP-SSI': { patterns: ['ssi', 'incendie', 'feu'], label: 'Rapport SSI' },
  'PV':      { patterns: ['pv', 'proces verbal', 'procès-verbal'], label: 'Procès-verbal' },
  'PV-REU':  { patterns: ['reunion', 'réunion', 'meeting'], label: 'PV réunion' },
  'PV-CHA':  { patterns: ['chantier', 'site'], label: 'PV chantier' },
  'CER':     { patterns: ['certificat', 'attestation', 'conformite', 'conformité'], label: 'Certificat' },
  'FIC-TEC': { patterns: ['fiche technique', 'datasheet', 'spec'], label: 'Fiche technique' },
  'PLA':     { patterns: ['plan', 'layout'], label: 'Plan' },
  'SCH':     { patterns: ['schema', 'schéma', 'diagram'], label: 'Schéma' },
  'PHO':     { patterns: ['photo', 'img', 'image'], label: 'Photo' },
  'TST':     { patterns: ['test', 'essai'], label: 'Test' },
  'MES':     { patterns: ['mesure', 'measure', 'relevé'], label: 'Mesure' },
  'DEV':     { patterns: ['devis', 'quote', 'offre'], label: 'Devis' },
  'FAC':     { patterns: ['facture', 'invoice'], label: 'Facture' },
};

/**
 * File category definitions — extension → category key.
 * Ported 1:1 from FilesManager.FILE_CATEGORIES.
 */
export interface FileCategoryDef {
  label: string;
  extensions: readonly string[];
}

export const FILE_CATEGORIES: Readonly<Record<string, FileCategoryDef>> = {
  documents: {
    label: '📄 Documents',
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf'],
  },
  cad: {
    label: '📐 CAD',
    extensions: ['.dwg', '.dxf', '.dgn'],
  },
  bim: {
    label: '🏗️ BIM',
    extensions: ['.ifc', '.rvt', '.rfa', '.nwd', '.nwc', '.nwf', '.bcf'],
  },
  images: {
    label: '🖼️ Images',
    extensions: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.svg'],
  },
  archives: {
    label: '🗜️ Archives',
    extensions: ['.zip', '.7z', '.tar', '.gz', '.rar'],
  },
};
