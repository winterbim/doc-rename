/** Server-only release gate for unfinished paid account and entitlement flows. */
export function isPaidSaasEnabled(value = process.env.PAID_SAAS_ENABLED): boolean {
  return value === 'true';
}

export function requirePaidSaasEnabled(): void {
  if (!isPaidSaasEnabled()) {
    throw new Error('Paid account features are not enabled');
  }
}
