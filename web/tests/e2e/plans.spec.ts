import { expect, test, type Page } from '@playwright/test';

/**
 * Échelle produit Free / Team / Cabinet — les licences doivent être
 * réellement distinctes au niveau des fonctionnalités :
 * - Free    : rapport verrouillé, bibliothèque en teaser.
 * - Team    : rapport TXT, bibliothèque toujours en teaser.
 * - Cabinet : rapport CSV + bibliothèque de conventions multi-clients.
 */
async function seedPlan(page: Page, plan: 'team' | 'cabinet') {
  // La licence locale est validée côté serveur — on mocke le statut.
  await page.route('**/api/license/status', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ active: true, plan, expiresAt: null }),
    }),
  );
  await page.addInitScript((p: string) => {
    localStorage.setItem(
      'bimcheck_license_v1',
      JSON.stringify({
        licenseKey: `bcr_e2e_${p}`,
        plan: p,
        activatedAt: Date.now(),
      }),
    );
  }, plan);
}

test('Déjà client ? — réactivation d’une licence sur ce poste (bascule)', async ({ page }) => {
  // Backend mocké : la réactivation réussit et renvoie une licence Team.
  await page.route('**/api/license/reactivate', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        activated: true,
        licenseKey: 'bcr_e2e_reactivated_0001',
        plan: 'team',
        email: 'client@societe.fr',
        expiresAt: null,
        seats: 1,
      }),
    }),
  );
  await page.goto('/app');

  // Plan Free au départ, lien « Déjà client ? » visible dans la pastille
  await page.getByRole('button', { name: 'Déjà client ?' }).click();
  const input = page.getByLabel('Clé de licence ou email de paiement');
  await input.fill('bcr_e2e_reactivated_0001');
  await page.getByRole('button', { name: 'Réactiver', exact: true }).click();

  // La licence est écrite et le plan bascule immédiatement sur Team
  await expect(page.getByText(/Licence Team réactivée sur ce poste/i)).toBeVisible();
  const planPill = page.locator("div[aria-live='polite']").filter({ hasText: 'lots illimités' });
  await expect(planPill.getByText('Team', { exact: true })).toBeVisible();
});

test('Free — rapport verrouillé et bibliothèque en teaser Cabinet', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByRole('button', { name: /Rapport de renommage — disponible avec/i })).toBeVisible();
  await expect(page.getByText('Conventions clients')).toBeVisible();
  await expect(page.getByRole('link', { name: /Découvrir Cabinet/i })).toBeVisible();
  // Le badge de plan affiche Free
  await expect(page.getByText('Free', { exact: true })).toBeVisible();
});

test('Team — rapport TXT actif, lots illimités, bibliothèque encore verrouillée', async ({ page }) => {
  await seedPlan(page, 'team');
  await page.goto('/app');
  const planPill = page.locator("div[aria-live='polite']").filter({ hasText: 'lots illimités' });
  await expect(planPill.getByText('Team', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /rapport de renommage TXT/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Découvrir Cabinet/i })).toBeVisible();
});

test('Cabinet — rapport CSV + bibliothèque de conventions fonctionnelle', async ({ page }) => {
  await seedPlan(page, 'cabinet');
  await page.goto('/app');
  await expect(page.getByText('Cabinet', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /rapport CSV d’audit/i })).toBeVisible();

  // La bibliothèque est active : enregistrer la convention BIM sous « DUPONT »
  await expect(page.getByRole('link', { name: /Découvrir Cabinet/i })).toHaveCount(0);
  await page.getByLabel('Nom de la nouvelle convention').fill('DUPONT');
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await expect(page.getByText(/Convention « DUPONT » enregistrée/i)).toBeVisible();

  // Basculer sur le profil Juridique puis recharger DUPONT (BIM)
  await page.getByRole('radio', { name: 'Juridique' }).click();
  await expect(page.getByText('Juridique', { exact: true }).first()).toBeVisible();

  await page.getByLabel('Convention enregistrée').selectOption({ label: 'DUPONT' });
  await page.getByRole('button', { name: 'Charger', exact: true }).click();
  await expect(page.getByText(/Convention « DUPONT » chargée/i)).toBeVisible();
  // Le profil BIM est restauré dans le bandeau du sélecteur
  await expect(
    page.locator("div[aria-live='polite']").getByText('BIM / Construction'),
  ).toBeVisible();

  // Rapport CSV : après un renommage démo, le clic télécharge un CSV
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();
  await expect(page.getByText(/5 fichiers ajoutés/i)).toBeVisible();
  await page.getByRole('button', { name: /Renommer tout/i }).click();
  await expect(page.getByText(/5\/5 fichier\(s\) renommé\(s\)/i)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /rapport CSV d’audit/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('RAPPORT_RENOMMAGE.CSV');
});
