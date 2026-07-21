/**
 * Single source of truth — commercial offer + multi-currency display.
 *
 * Base currency: EUR. CHF / USD are display conversions (rounded).
 * Stripe Payment Links are optional; empty env → CTA falls back to /pilot.
 *
 * Pricing doctrine: docs/product/PRICING_AUDIT.md
 */

/* ---------------------------------------------------------------------------
 * Stripe links (optional)
 * --------------------------------------------------------------------------- */

const TEAM_LINK =
  process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR?.trim() ||
  process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM?.trim() ||
  process.env.NEXT_PUBLIC_STRIPE_LINK_PRO?.trim();

const CABINET_LINK =
  process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR?.trim() ||
  process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET?.trim();

const PILOT_LINK = process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT?.trim();

/** Optional per-currency checkout URLs (override when set). */
const TEAM_LINK_CHF = process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_CHF?.trim();
const TEAM_LINK_USD = process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_USD?.trim();
const CABINET_LINK_CHF = process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_CHF?.trim();
const CABINET_LINK_USD = process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_USD?.trim();
const PILOT_LINK_CHF = process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT_CHF?.trim();
const PILOT_LINK_USD = process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT_USD?.trim();

/* ---------------------------------------------------------------------------
 * Currency
 * --------------------------------------------------------------------------- */

export type CurrencyCode = 'EUR' | 'CHF' | 'USD';

export const DEFAULT_CURRENCY: CurrencyCode = 'EUR';
export const CURRENCY_STORAGE_KEY = 'bimcheck_display_currency';

/** Approximate FX from EUR for display only (not live market rates). */
export interface CurrencyMeta {
  readonly code: CurrencyCode;
  readonly symbol: string;
  /** Multiply EUR amount → display currency (rounded later). */
  readonly fromEur: number;
  readonly label: string;
  readonly locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  EUR: { code: 'EUR', symbol: '€', fromEur: 1, label: 'Euro', locale: 'fr-FR' },
  CHF: { code: 'CHF', symbol: 'CHF', fromEur: 0.95, label: 'Franc suisse', locale: 'fr-CH' },
  USD: { code: 'USD', symbol: '$', fromEur: 1.08, label: 'US Dollar', locale: 'en-US' },
};

export const CURRENCY_OPTIONS: readonly CurrencyCode[] = ['EUR', 'CHF', 'USD'];

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return value === 'EUR' || value === 'CHF' || value === 'USD';
}

/** Convert a EUR base price to display amount in the target currency. */
export function convertFromEur(amountEur: number, currency: CurrencyCode): number {
  if (amountEur === 0) return 0;
  const rate = CURRENCIES[currency].fromEur;
  return Math.max(1, Math.round(amountEur * rate));
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (amount === 0) return 'Gratuit';
  const meta = CURRENCIES[currency];
  if (currency === 'EUR') return `${amount} ${meta.symbol}`;
  if (currency === 'USD') return `${meta.symbol}${amount}`;
  return `${amount} ${meta.symbol}`;
}

/* ---------------------------------------------------------------------------
 * Base prices (EUR) — after pricing audit 2026-07-21
 * --------------------------------------------------------------------------- */

export const FREE_DAILY_LOTS = 5;

/** Entry paid tier — team flat fee, intentionally under 20 €. */
export const TEAM_PRICE_EUR = 19;
/** Multi-team / priority support. */
export const CABINET_PRICE_EUR = 49;
/** One-time guided pilot (low friction). */
export const PILOT_PRICE_EUR = 49;

/** @deprecated aliases — prefer convertFromEur + formatMoney */
export const OFFER_CURRENCY = 'EUR' as const;
export const OFFER_CURRENCY_SYMBOL = '€' as const;
export const PAID_PILOT_PRICE_CHF = PILOT_PRICE_EUR;
export const PAID_PILOT_PRICE_LABEL = formatMoney(PILOT_PRICE_EUR, 'EUR');

export type PlanId = 'free' | 'team' | 'cabinet';

export interface PlanCta {
  readonly href: string;
  readonly label: string;
  readonly checkout: boolean;
}

function buildCta(
  link: string | undefined,
  checkoutLabel: string,
  fallbackLabel: string,
  fallbackHref: string,
): PlanCta {
  return link
    ? { href: link, label: checkoutLabel, checkout: true }
    : { href: fallbackHref, label: fallbackLabel, checkout: false };
}

function teamLinkFor(currency: CurrencyCode): string | undefined {
  if (currency === 'CHF' && TEAM_LINK_CHF) return TEAM_LINK_CHF;
  if (currency === 'USD' && TEAM_LINK_USD) return TEAM_LINK_USD;
  return TEAM_LINK;
}

function cabinetLinkFor(currency: CurrencyCode): string | undefined {
  if (currency === 'CHF' && CABINET_LINK_CHF) return CABINET_LINK_CHF;
  if (currency === 'USD' && CABINET_LINK_USD) return CABINET_LINK_USD;
  return CABINET_LINK;
}

function pilotLinkFor(currency: CurrencyCode): string | undefined {
  if (currency === 'CHF' && PILOT_LINK_CHF) return PILOT_LINK_CHF;
  if (currency === 'USD' && PILOT_LINK_USD) return PILOT_LINK_USD;
  return PILOT_LINK;
}

export const freeCta: PlanCta = {
  href: '/app',
  label: 'Essayer gratuitement',
  checkout: false,
};

export function getTeamCta(currency: CurrencyCode = DEFAULT_CURRENCY): PlanCta {
  return buildCta(
    teamLinkFor(currency),
    'S’abonner — Team',
    'Demander Team',
    '/pilot?plan=team',
  );
}

export function getCabinetCta(currency: CurrencyCode = DEFAULT_CURRENCY): PlanCta {
  return buildCta(
    cabinetLinkFor(currency),
    'S’abonner — Cabinet',
    'Contacter les ventes',
    '/pilot?plan=cabinet',
  );
}

export function getPilotCta(currency: CurrencyCode = DEFAULT_CURRENCY): PlanCta {
  const price = formatMoney(convertFromEur(PILOT_PRICE_EUR, currency), currency);
  return buildCta(
    pilotLinkFor(currency),
    `Réserver le pilote — ${price}`,
    `Réserver le pilote — ${price}`,
    '/pilot',
  );
}

/** Default CTAs (EUR) for server components */
export const teamCta = getTeamCta('EUR');
export const cabinetCta = getCabinetCta('EUR');
export const pilotCta = getPilotCta('EUR');
export const proCta = teamCta;

export interface PricingPlan {
  readonly id: PlanId;
  readonly name: string;
  /** Price in the requested display currency (0 = free). */
  readonly price: number;
  readonly priceEur: number;
  readonly priceUnit: string;
  readonly currency: CurrencyCode;
  readonly billing: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly cta: PlanCta;
  readonly highlighted?: boolean;
  readonly badge?: string;
}

function freeFeatures(): string[] {
  return [
    'Renommage 100 % local (aucun upload fichier)',
    'Tous les profils métier',
    'Convention personnalisée',
    `${FREE_DAILY_LOTS} lots de renommage par jour`,
    'Export ZIP avec arborescence',
    'Aperçu Avant / Après',
  ];
}

export function getFreePlan(currency: CurrencyCode = DEFAULT_CURRENCY): PricingPlan {
  const meta = CURRENCIES[currency];
  return {
    id: 'free',
    name: 'Free',
    price: 0,
    priceEur: 0,
    priceUnit: meta.symbol,
    currency,
    billing: 'pour toujours',
    description: 'Renommage local sans compte. Idéal pour tester sur un lot réel.',
    features: freeFeatures(),
    cta: freeCta,
  };
}

export function getTeamPlan(currency: CurrencyCode = DEFAULT_CURRENCY): PricingPlan {
  const meta = CURRENCIES[currency];
  const price = convertFromEur(TEAM_PRICE_EUR, currency);
  return {
    id: 'team',
    name: 'Team',
    price,
    priceEur: TEAM_PRICE_EUR,
    priceUnit: meta.symbol,
    currency,
    billing: '/mois',
    description: 'Pour l’équipe qui impose une convention unique — prix d’entrée accessible.',
    features: [
      'Tout Free + lots illimités',
      'Compte (Google / GitHub)',
      'Sauvegarde cloud des conventions (JSON, pas les fichiers)',
      'Organisation jusqu’à 10 personnes',
      'Jusqu’à 3 projets',
      'Support email',
    ],
    cta: getTeamCta(currency),
    highlighted: true,
    badge: 'Le plus choisi',
  };
}

export function getCabinetPlan(currency: CurrencyCode = DEFAULT_CURRENCY): PricingPlan {
  const meta = CURRENCIES[currency];
  const price = convertFromEur(CABINET_PRICE_EUR, currency);
  return {
    id: 'cabinet',
    name: 'Cabinet',
    price,
    priceEur: CABINET_PRICE_EUR,
    priceUnit: meta.symbol,
    currency,
    billing: '/mois',
    description: 'Multi-équipes, projets illimités, support prioritaire.',
    features: [
      'Tout Team +',
      'Utilisateurs et projets illimités',
      'Support prioritaire',
      'Onboarding assisté sur demande',
      'Facturation sur devis / virement possible',
    ],
    cta: getCabinetCta(currency),
  };
}

export function getPricingPlans(currency: CurrencyCode = DEFAULT_CURRENCY): readonly PricingPlan[] {
  return [getFreePlan(currency), getTeamPlan(currency), getCabinetPlan(currency)];
}

/** @deprecated static EUR snapshots — prefer get*Plan(currency) */
export const freePlan = getFreePlan('EUR');
export const teamPlan = getTeamPlan('EUR');
export const cabinetPlan = getCabinetPlan('EUR');
export const pricingPlans = getPricingPlans('EUR');

export const planComparisonRows: readonly {
  feature: string;
  free: boolean | string;
  team: boolean | string;
  cabinet: boolean | string;
}[] = [
  { feature: 'Renommage local (fichiers hors serveur)', free: true, team: true, cabinet: true },
  { feature: 'Tous les profils métier', free: true, team: true, cabinet: true },
  { feature: 'Convention personnalisée', free: true, team: true, cabinet: true },
  {
    feature: 'Lots de renommage / jour',
    free: String(FREE_DAILY_LOTS),
    team: 'Illimité',
    cabinet: 'Illimité',
  },
  { feature: 'Compte utilisateur', free: false, team: true, cabinet: true },
  { feature: 'Sync cloud des conventions', free: false, team: true, cabinet: true },
  { feature: 'Membres organisation', free: '—', team: 'Jusqu’à 10', cabinet: 'Illimité' },
  { feature: 'Projets', free: 'Local', team: '3', cabinet: 'Illimités' },
  { feature: 'Support', free: 'Docs', team: 'Email', cabinet: 'Prioritaire' },
];

export function formatPlanPrice(plan: PricingPlan): string {
  if (plan.price === 0) return 'Gratuit';
  return `${formatMoney(plan.price, plan.currency)}${plan.billing}`;
}

export function getPilotPriceLabel(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatMoney(convertFromEur(PILOT_PRICE_EUR, currency), currency);
}
