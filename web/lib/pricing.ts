/**
 * Single source of truth — commercial offer + multi-currency display.
 *
 * Base currency: EUR. CHF / USD are display conversions (rounded).
 * Stripe Payment Links are optional; empty env → CTA falls back to /pilot.
 *
 * Pricing doctrine: docs/product/PRICING_AUDIT.md
 */

import { PAID_ACCOUNTS_ENABLED } from './features';

/* ---------------------------------------------------------------------------
 * Stripe links (optional)
 * --------------------------------------------------------------------------- */

/**
 * Accept only Stripe-hosted Payment Links. This prevents a deployment typo or
 * poisoned environment variable from turning a pricing CTA into an open
 * redirect to an arbitrary host.
 */
export function normalizeStripePaymentLink(raw: string | null | undefined): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'buy.stripe.com' ||
      url.username ||
      url.password
    ) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function isStripePaymentLinkAllowedForMode(
  link: string | undefined,
  mode: string | undefined,
): boolean {
  if (!link) return false;
  try {
    const url = new URL(link);
    if (url.protocol !== 'https:' || url.hostname !== 'buy.stripe.com') return false;
    const isTestLink = url.pathname.startsWith('/test_');
    return (mode === 'test' && isTestLink) || (mode === 'live' && !isTestLink);
  } catch {
    return false;
  }
}

/**
 * Resolve which Stripe Payment Link family may be exposed.
 * Production deploys (Vercel production) are live-only: test links are never accepted.
 * Preview/local may use mode=test for QA only.
 */
export function resolvePublicStripeMode(
  rawMode: string | null | undefined = process.env.NEXT_PUBLIC_STRIPE_MODE,
  vercelEnv: string | null | undefined = process.env.VERCEL_ENV,
): 'test' | 'live' | undefined {
  const isVercelProduction = vercelEnv === 'production';
  if (isVercelProduction) return 'live';
  const mode = rawMode?.trim();
  if (mode === 'test' || mode === 'live') return mode;
  return undefined;
}

const PUBLIC_STRIPE_MODE = resolvePublicStripeMode();

const firstStripeLink = (...values: Array<string | undefined>): string | undefined => {
  for (const value of values) {
    const link = normalizeStripePaymentLink(value);
    if (link && isStripePaymentLinkAllowedForMode(link, PUBLIC_STRIPE_MODE)) return link;
  }
  return undefined;
};

const TEAM_LINK = firstStripeLink(
  process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR,
  process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM,
  process.env.NEXT_PUBLIC_STRIPE_LINK_PRO,
);

const CABINET_LINK = firstStripeLink(
  process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR,
  process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET,
);

const PILOT_LINK = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT);

/** Optional per-currency checkout URLs (override when set). */
const TEAM_LINK_CHF = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_CHF);
const TEAM_LINK_USD = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_TEAM_USD);
const CABINET_LINK_CHF = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_CHF);
const CABINET_LINK_USD = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_CABINET_USD);
const PILOT_LINK_CHF = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT_CHF);
const PILOT_LINK_USD = firstStripeLink(process.env.NEXT_PUBLIC_STRIPE_LINK_PILOT_USD);

/**
 * Paid collaboration is a separate launch decision from OAuth itself. Both
 * switches are required so enabling a login provider cannot advertise an
 * unfinished organisation/licensing workflow.
 */
export const PAID_ACCOUNTS_AVAILABLE =
  PAID_ACCOUNTS_ENABLED;

/**
 * Checkout is independent of OAuth/org SaaS. Revenue uses Stripe Payment Links
 * with automatic browser license activation after payment.
 * Fail-closed: requires an explicit commercial switch AND at least one valid
 * live (or, off production, test) Payment Link for the resolved mode.
 */
export function canExposeDirectCheckout(options: {
  checkoutEnabled: boolean;
  hasPaymentLink: boolean;
}): boolean {
  return options.checkoutEnabled && options.hasPaymentLink;
}

const HAS_CONFIGURED_PAYMENT_LINK = Boolean(
  TEAM_LINK ||
  CABINET_LINK ||
  PILOT_LINK ||
  TEAM_LINK_CHF ||
  TEAM_LINK_USD ||
  CABINET_LINK_CHF ||
  CABINET_LINK_USD ||
  PILOT_LINK_CHF ||
  PILOT_LINK_USD,
);

/** True when paid checkout is commercially opened and links are configured for the mode. */
export const HAS_DIRECT_CHECKOUT = canExposeDirectCheckout({
  checkoutEnabled: process.env.NEXT_PUBLIC_PAID_CHECKOUT_ENABLED === 'true',
  hasPaymentLink: HAS_CONFIGURED_PAYMENT_LINK,
});

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
    HAS_DIRECT_CHECKOUT ? teamLinkFor(currency) : undefined,
    'S’abonner — Team',
    'Demander Team',
    '/pilot?plan=team',
  );
}

export function getCabinetCta(currency: CurrencyCode = DEFAULT_CURRENCY): PlanCta {
  return buildCta(
    HAS_DIRECT_CHECKOUT ? cabinetLinkFor(currency) : undefined,
    'S’abonner — Cabinet',
    'Contacter les ventes',
    '/pilot?plan=cabinet',
  );
}

export function getPilotCta(currency: CurrencyCode = DEFAULT_CURRENCY): PlanCta {
  const price = formatMoney(convertFromEur(PILOT_PRICE_EUR, currency), currency);
  return buildCta(
    HAS_DIRECT_CHECKOUT ? pilotLinkFor(currency) : undefined,
    `Réserver le pilote — ${price}`,
    `Demander le pilote — tarif annoncé ${price}`,
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
  const selling = HAS_DIRECT_CHECKOUT;
  return {
    id: 'team',
    name: 'Team',
    price,
    priceEur: TEAM_PRICE_EUR,
    priceUnit: meta.symbol,
    currency,
    billing: '/mois',
    description: selling
      ? 'Lots illimités pour l’équipe — licence activée automatiquement après paiement.'
      : 'Offre Team — ouverture commerciale dès encaissement Stripe live.',
    features: selling
      ? [
          'Tout Free + lots de renommage illimités',
          'Licence activée automatiquement après paiement',
          'Support email',
          PAID_ACCOUNTS_AVAILABLE
            ? 'Compte + sync cloud des conventions (JSON)'
            : 'Sans compte obligatoire (export JSON inclus)',
          'Sans upload de vos fichiers',
        ]
      : [
          'Lots illimités après activation',
          'Support email',
          'Export conventions JSON',
          'Paiement en ligne dès configuration Stripe live',
        ],
    cta: getTeamCta(currency),
    highlighted: true,
    badge: 'Petites équipes',
  };
}

export function getCabinetPlan(currency: CurrencyCode = DEFAULT_CURRENCY): PricingPlan {
  const meta = CURRENCIES[currency];
  const price = convertFromEur(CABINET_PRICE_EUR, currency);
  const selling = HAS_DIRECT_CHECKOUT;
  return {
    id: 'cabinet',
    name: 'Cabinet',
    price,
    priceEur: CABINET_PRICE_EUR,
    priceUnit: meta.symbol,
    currency,
    billing: '/mois',
    description: selling
      ? 'Volume et support prioritaire — licence activée automatiquement après paiement.'
      : 'Offre Cabinet — ouverture commerciale dès encaissement Stripe live.',
    features: selling
      ? [
          'Tout Team +',
          'Support prioritaire',
          'Onboarding assisté sur demande',
          PAID_ACCOUNTS_AVAILABLE
            ? 'Jusqu’à 1 000 utilisateurs et projets'
            : 'Périmètre multi-équipes (activation auto de licence)',
          'Facture Stripe / devis possible',
        ]
      : [
          'Tout Team + support prioritaire',
          'Onboarding assisté sur demande',
          'Paiement en ligne dès configuration Stripe live',
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
    team: HAS_DIRECT_CHECKOUT || PAID_ACCOUNTS_AVAILABLE ? 'Illimité' : 'Sur activation',
    cabinet: HAS_DIRECT_CHECKOUT || PAID_ACCOUNTS_AVAILABLE ? 'Illimité' : 'Sur activation',
  },
  {
    feature: 'Compte utilisateur',
    free: false,
    team: PAID_ACCOUNTS_AVAILABLE,
    cabinet: PAID_ACCOUNTS_AVAILABLE,
  },
  {
    feature: 'Sync cloud des conventions',
    free: false,
    team: PAID_ACCOUNTS_AVAILABLE,
    cabinet: PAID_ACCOUNTS_AVAILABLE,
  },
  {
    feature: 'Membres organisation',
    free: '—',
    team: PAID_ACCOUNTS_AVAILABLE ? 'Jusqu’à 10' : 'Non ouvert',
    cabinet: PAID_ACCOUNTS_AVAILABLE ? 'Jusqu’à 1 000' : 'Non ouvert',
  },
  {
    feature: 'Projets',
    free: 'Local',
    team: PAID_ACCOUNTS_AVAILABLE ? '3' : 'Non ouvert',
    cabinet: PAID_ACCOUNTS_AVAILABLE ? 'Jusqu’à 1 000' : 'Non ouvert',
  },
  {
    feature: 'Support',
    free: 'Documentation',
    team: PAID_ACCOUNTS_AVAILABLE ? 'Email' : 'Sur demande',
    cabinet: PAID_ACCOUNTS_AVAILABLE ? 'Prioritaire' : 'Sur demande',
  },
];

export function formatPlanPrice(plan: PricingPlan): string {
  if (plan.price === 0) return 'Gratuit';
  return `${formatMoney(plan.price, plan.currency)}${plan.billing}`;
}

export function getPilotPriceLabel(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatMoney(convertFromEur(PILOT_PRICE_EUR, currency), currency);
}
