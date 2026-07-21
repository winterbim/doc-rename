import { describe, expect, it } from 'vitest';
import {
  convertFromEur,
  formatMoney,
  FREE_DAILY_LOTS,
  TEAM_PRICE_EUR,
  CABINET_PRICE_EUR,
  PILOT_PRICE_EUR,
  getPricingPlans,
  getPilotPriceLabel,
  getTeamPlan,
  canExposeDirectCheckout,
  isStripePaymentLinkAllowedForMode,
  normalizeStripePaymentLink,
} from '../pricing';

describe('pricing — audit-aligned offer', () => {
  it('keeps entry prices accessible for SMB', () => {
    expect(TEAM_PRICE_EUR).toBeLessThanOrEqual(25);
    expect(CABINET_PRICE_EUR).toBeLessThanOrEqual(60);
    expect(PILOT_PRICE_EUR).toBeLessThanOrEqual(60);
    expect(FREE_DAILY_LOTS).toBeGreaterThanOrEqual(5);
  });

  it('converts EUR base to CHF and USD with rounded amounts', () => {
    expect(convertFromEur(19, 'EUR')).toBe(19);
    expect(convertFromEur(19, 'CHF')).toBe(18); // 19 * 0.95
    expect(convertFromEur(19, 'USD')).toBe(21); // 19 * 1.08
    expect(convertFromEur(49, 'CHF')).toBe(47);
    expect(convertFromEur(49, 'USD')).toBe(53);
  });

  it('formats money per currency', () => {
    expect(formatMoney(0, 'EUR')).toBe('Gratuit');
    expect(formatMoney(19, 'EUR')).toBe('19 €');
    expect(formatMoney(18, 'CHF')).toBe('18 CHF');
    expect(formatMoney(21, 'USD')).toBe('$21');
  });

  it('builds currency-aware team plan', () => {
    const chf = getTeamPlan('CHF');
    expect(chf.price).toBe(18);
    expect(chf.priceEur).toBe(19);
    expect(chf.currency).toBe('CHF');
    expect(chf.highlighted).toBe(true);
  });

  it('exposes three plans in every currency', () => {
    for (const c of ['EUR', 'CHF', 'USD'] as const) {
      const plans = getPricingPlans(c);
      expect(plans).toHaveLength(3);
      expect(plans[0].price).toBe(0);
      expect(plans[1].id).toBe('team');
      expect(plans[2].id).toBe('cabinet');
    }
  });

  it('labels pilot price in selected currency', () => {
    expect(getPilotPriceLabel('EUR')).toBe('49 €');
    expect(getPilotPriceLabel('CHF')).toContain('CHF');
  });

  it('accepts only HTTPS Payment Links hosted by Stripe', () => {
    expect(normalizeStripePaymentLink('https://buy.stripe.com/test_123')).toBe(
      'https://buy.stripe.com/test_123',
    );
    expect(normalizeStripePaymentLink(' https://buy.stripe.com/abc?locale=fr ')).toBe(
      'https://buy.stripe.com/abc?locale=fr',
    );
    expect(normalizeStripePaymentLink('https://evil.example/checkout')).toBeUndefined();
    expect(normalizeStripePaymentLink('http://buy.stripe.com/abc')).toBeUndefined();
    expect(normalizeStripePaymentLink('https://buy.stripe.com.evil.example/abc')).toBeUndefined();
    expect(normalizeStripePaymentLink('not-a-url')).toBeUndefined();
  });

  it('keeps checkout fail-closed until accounts and commercial checkout are both enabled', () => {
    expect(
      canExposeDirectCheckout({
        accountsAvailable: false,
        checkoutEnabled: true,
        hasPaymentLink: true,
      }),
    ).toBe(false);
    expect(
      canExposeDirectCheckout({
        accountsAvailable: true,
        checkoutEnabled: false,
        hasPaymentLink: true,
      }),
    ).toBe(false);
    expect(
      canExposeDirectCheckout({
        accountsAvailable: true,
        checkoutEnabled: true,
        hasPaymentLink: false,
      }),
    ).toBe(false);
    expect(
      canExposeDirectCheckout({
        accountsAvailable: true,
        checkoutEnabled: true,
        hasPaymentLink: true,
      }),
    ).toBe(true);
  });

  it('never mixes Stripe test and live Payment Links', () => {
    const testLink = normalizeStripePaymentLink('https://buy.stripe.com/test_123');
    const liveLink = normalizeStripePaymentLink('https://buy.stripe.com/abc123');
    expect(isStripePaymentLinkAllowedForMode(testLink, 'test')).toBe(true);
    expect(isStripePaymentLinkAllowedForMode(testLink, 'live')).toBe(false);
    expect(isStripePaymentLinkAllowedForMode(liveLink, 'live')).toBe(true);
    expect(isStripePaymentLinkAllowedForMode(liveLink, 'test')).toBe(false);
    expect(isStripePaymentLinkAllowedForMode(testLink, undefined)).toBe(false);
  });
});
