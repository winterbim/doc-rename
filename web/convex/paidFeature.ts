/** Server-only release gate for unfinished org / multi-user SaaS flows. */
export function isPaidSaasEnabled(value = process.env.PAID_SAAS_ENABLED): boolean {
  return value === 'true';
}

export function requirePaidSaasEnabled(): void {
  if (!isPaidSaasEnabled()) {
    throw new Error('Paid account features are not enabled');
  }
}

/**
 * Stripe billing / automatic browser licenses.
 * Independent of OAuth org SaaS — only requires STRIPE_MODE=test|live.
 */
export function isStripeBillingEnabled(value = process.env.STRIPE_MODE): boolean {
  const mode = value?.trim();
  return mode === 'test' || mode === 'live';
}

export function requireStripeBillingEnabled(): void {
  if (!isStripeBillingEnabled()) {
    throw new Error('Stripe billing is not enabled');
  }
}
