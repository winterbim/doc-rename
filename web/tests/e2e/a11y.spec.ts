import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Gate accessibilité de l'audit CX : 0 violation WCAG 2.1 AA sur les pages
 * clés. Exécuté avec axe-core (tags wcag2a/aa + wcag21a/aa).
 */
const ROUTES = ['/', '/app', '/pricing', '/pilot'];

for (const route of ROUTES) {
  test(`axe-core — 0 violation WCAG 2.1 AA sur ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.length,
      help: v.help,
    }));
    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}
