/** Public support / commercial contact — same mailbox as bimcheck-consulting.com */
export const CONTACT_EMAIL = 'bimcheck-consulting@proton.me';

/**
 * Publisher identity aligned with the main BIMCheck Consulting site
 * (Winter Fernandes). Keep legal pages, metadata and copyright in sync.
 */
export const PUBLISHER_NAME = 'Winter Fernandes';
export const PUBLISHER_BRAND = 'BIMCHECK-Rename';
export const PUBLISHER_LABEL = `${PUBLISHER_BRAND} — ${PUBLISHER_NAME}`;

/** Honest free-beta legal note until company registration is finalized. */
export const LEGAL_ENTITY_STATUS =
  'Éditeur individuel / projet BIMCHECK-Rename (statut d’entreprise en cours de finalisation). Identification complète communiquée sur facture et sur demande écrite. Aucune commande payante n’est acceptée en ligne tant que l’immatriculation et la facturation ne sont pas finalisées.';

export function buildContactMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  return `mailto:${CONTACT_EMAIL}${query ? `?${query}` : ''}`;
}
