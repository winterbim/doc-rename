import { describe, expect, it } from 'vitest';
import { isPaidSaasEnabled, isStripeBillingEnabled } from './paidFeature';

describe('paid SaaS server gate', () => {
  it('fails closed unless the value is exactly true', () => {
    expect(isPaidSaasEnabled(undefined)).toBe(false);
    expect(isPaidSaasEnabled('')).toBe(false);
    expect(isPaidSaasEnabled('TRUE')).toBe(false);
    expect(isPaidSaasEnabled('false')).toBe(false);
    expect(isPaidSaasEnabled('true')).toBe(true);
  });
});

describe('Stripe billing gate', () => {
  it('enables only for explicit test or live mode', () => {
    expect(isStripeBillingEnabled(undefined)).toBe(false);
    expect(isStripeBillingEnabled('')).toBe(false);
    expect(isStripeBillingEnabled('prod')).toBe(false);
    expect(isStripeBillingEnabled('test')).toBe(true);
    expect(isStripeBillingEnabled('live')).toBe(true);
  });
});
