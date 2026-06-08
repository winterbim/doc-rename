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
export const pilotCta = buildCta(PILOT_LINK, 'Démarrer le pilote 14 j', 'Demander un pilote');
