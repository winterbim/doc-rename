/** Public support / commercial contact — same mailbox as bimcheck-consulting.com */
export const CONTACT_EMAIL = 'bimcheck-consulting@proton.me';

/** Public commitment displayed next to the contact email. */
export const CONTACT_RESPONSE_TIME = 'Réponse sous 24 h ouvrées';

/**
 * Publisher identity aligned with the main BIMCheck Consulting site
 * (Winter Fernandes). Keep legal pages, metadata and copyright in sync.
 */
export const PUBLISHER_NAME = 'Winter Fernandes';
export const PUBLISHER_LEGAL_NAME = 'Winter Kily Fernandes';
export const PUBLISHER_BRAND = 'BIMCHECK-Rename';
export const PUBLISHER_LABEL = `${PUBLISHER_BRAND} — ${PUBLISHER_NAME}`;

/**
 * Identification légale officielle (attestation RNE du 22/07/2026).
 * Ne jamais publier : date de naissance, mention « ambulant », ni aucune
 * donnée personnelle non requise par l'art. 6-III de la LCEN.
 */
export const LEGAL_FORM = 'Entrepreneur individuel (EI)';
export const LEGAL_SIREN = '492 849 088';
export const LEGAL_SIRET = '492 849 088 00058';
export const LEGAL_RNE =
  'Immatriculé au Registre national des entreprises (RNE) le 21/07/2026 · non inscrit au RCS (activité libérale non réglementée)';
export const LEGAL_APE = '71.12B — Ingénierie, études techniques';
export const LEGAL_ADDRESS = '59 rue de Ponthieu, 75008 Paris, France';
export const LEGAL_DOMICILIATION = 'Domiciliation : Source (SIREN 848 506 861)';
export const LEGAL_VAT = 'TVA non applicable, art. 293 B du CGI';
export const LEGAL_ACTIVITY =
  'Conseil et audit indépendant en BIM : contrôle qualité IFC, conformité IDS/ISO 19650, rapports BCF, digital handover, formation';

/** Statut affiché sur les pages légales (remplace l'ancien statut provisoire). */
export const LEGAL_ENTITY_STATUS = `${LEGAL_FORM} — ${LEGAL_RNE}.`;

/** Ligne discrète pour les footers, près du copyright. */
export const LEGAL_FOOTER_LINE = `${PUBLISHER_BRAND} — ${PUBLISHER_NAME} EI · SIREN ${LEGAL_SIREN}`;

export function buildContactMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${CONTACT_EMAIL}${query ? `?${query}` : ''}`;
}
