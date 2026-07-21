/**
 * Public release switches, frozen into the browser bundle at build time.
 * Keep authentication off until every configured provider has working
 * production credentials; the local-first Free workspace remains available.
 */
export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true';

/**
 * Paid account screens are a separate, fail-closed release switch. OAuth may
 * be tested without exposing unfinished licensing or organisation features.
 */
export const PAID_ACCOUNTS_ENABLED =
  AUTH_ENABLED && process.env.NEXT_PUBLIC_PAID_ACCOUNTS_ENABLED === 'true';
