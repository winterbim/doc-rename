import { describe, expect, it } from 'vitest';
import { isPaidSaasEnabled } from './paidFeature';

describe('paid SaaS server gate', () => {
  it('fails closed unless the value is exactly true', () => {
    expect(isPaidSaasEnabled(undefined)).toBe(false);
    expect(isPaidSaasEnabled('')).toBe(false);
    expect(isPaidSaasEnabled('TRUE')).toBe(false);
    expect(isPaidSaasEnabled('false')).toBe(false);
    expect(isPaidSaasEnabled('true')).toBe(true);
  });
});
