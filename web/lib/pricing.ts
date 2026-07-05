/**
 * Stripe Payment Link wiring — "no-backend" V1 monetisation.
 *
 * Each paid plan points at a Stripe Payment Link created in the Stripe
 * dashboard and injected via a `NEXT_PUBLIC_STRIPE_LINK_*` env var (baked at
 * build time). When a link is not configured the CTA falls back to the manual
 * pilot-request flow (`/pilot`) so a button is never dead. No `/api/stripe`,
 * no auth — access is provisioned by hand after payment. See STRIPE_SETUP.md.
 */

const PRO_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_PRO?.trim();
const TEAM_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM?.trim();
const PILOT_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT?.trim();

export const PAID_PILOT_PRICE_CHF = 149;
export const PAID_PILOT_PRICE_LABEL = `${PAID_PILOT_PRICE_CHF} CHF`;

export interface PlanCta {
  /** Destination: Stripe checkout when configured, else the pilot page. */
  readonly href: string;
  /** Button label, reflecting whether it leads to checkout or a request. */
  readonly label: string;
  /** true → external Stripe checkout; false → internal pilot-request fallback. */
  readonly checkout: boolean;
}

function buildCta(
  link: string | undefined,
  checkoutLabel: string,
  fallbackLabel: string,
  fallbackHref = '/pilot',
): PlanCta {
  return link
    ? { href: link, label: checkoutLabel, checkout: true }
    : { href: fallbackHref, label: fallbackLabel, checkout: false };
}

export const proCta = buildCta(PRO_LINK, "S'abonner — Pro", 'Demander le pilote Pro');
export const teamCta = buildCta(TEAM_LINK, "S'abonner — Team", 'Planifier Team');
export const pilotCta = buildCta(
  PILOT_LINK,
  `Réserver le pilote — ${PAID_PILOT_PRICE_LABEL}`,
  `Réserver le pilote — ${PAID_PILOT_PRICE_LABEL}`,
);

/* ---------------------------------------------------------------------------
 * New 2026 monetisation model — Free / Team / Cabinet
 * --------------------------------------------------------------------------- */

const TEAM_EUR_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR?.trim();
const CABINET_EUR_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR?.trim();

export const TEAM_PRICE_EUR = 49;
export const CABINET_PRICE_EUR = 149;

export interface PricingPlan {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly priceUnit: string;
  readonly billing: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly cta: PlanCta;
  readonly highlighted?: boolean;
  readonly badge?: string;
}

export const freePlan: PricingPlan = {
  id: 'free',
  name: 'Free',
  price: 0,
  priceUnit: '€',
  billing: 'pour toujours',
  description: 'Parfait pour tester et pour l’usage ponctuel.',
  features: [
    'Renommage local sans compte',
    'Tous les profils métier',
    'Convention personnalisée illimitée',
    '3 lots par jour',
    'Export ZIP',
  ],
  cta: { href: '/app', label: 'Essayer gratuitement', checkout: false },
};

export const teamPlan: PricingPlan = {
  id: 'team',
  name: 'Team',
  price: TEAM_PRICE_EUR,
  priceUnit: '€',
  billing: '/mois',
  description: 'Pour les équipes qui veulent une convention unique.',
  features: [
    'Tout Free +',
    'Compte équipe jusqu’à 10 personnes',
    'Sync des conventions entre membres',
    'Bibliothèque de templates',
    'Jusqu’à 3 projets',
    'Support email',
  ],
  cta: buildCta(
    TEAM_EUR_LINK,
    'S’abonner — Team',
    'Demander une démo Team',
    '/pilot?plan=team',
  ),
  highlighted: true,
  badge: 'Le plus choisi',
};

export const cabinetPlan: PricingPlan = {
  id: 'cabinet',
  name: 'Cabinet',
  price: CABINET_PRICE_EUR,
  priceUnit: '€',
  billing: '/mois',
  description: 'Pour les cabinets soumis à audit et conformité.',
  features: [
    'Tout Team +',
    'Utilisateurs illimités',
    'Projets illimités',
    'Audit trail complet',
    'Rapport de conformité PDF',
    'Connecteur SharePoint',
    'Support dédié',
  ],
  cta: buildCta(
    CABINET_EUR_LINK,
    'S’abonner — Cabinet',
    'Contacter les ventes',
    '/pilot?plan=cabinet',
  ),
};

export const pricingPlans: readonly PricingPlan[] = [freePlan, teamPlan, cabinetPlan];
