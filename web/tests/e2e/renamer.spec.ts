import { expect, test } from '@playwright/test';

test('loads the marketing and privacy pages', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BimDoc Renamer/i);
  await expect(page.getByRole('link', { name: /BimDoc Renamer.*accueil/i }).first()).toBeVisible();

  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: /BimDoc Renamer garde vos fichiers/i })).toBeVisible();

  await page.goto('/pilot');
  await expect(page.getByRole('heading', { name: /Pilote BIM 14 jours/i })).toBeVisible();
  await expect(page.getByText(/149 CHF/i).first()).toBeVisible();
  await expect(page.getByLabel(/Email pro/i)).toBeVisible();
});

test('accepts a local file without uploading to a server', async ({ page }) => {
  await page.goto('/app');

  await expect(
    page.getByRole('button', { name: /Zone de depot de fichiers|Zone de dépôt de fichiers/i }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: /Zone de depot de fichiers|Zone de dépôt de fichiers/i })
    .locator('input[type="file"][multiple]')
    .setInputFiles({
      name: 'DOE-PLAN-A101.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n% BimDoc Renamer smoke fixture\n'),
    });

  await expect(page.getByText('DOE-PLAN-A101.pdf', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Renommer tout/i })).toBeEnabled();
  await expect(page.getByText('Prêt').first()).toBeVisible();
});

test('loads a BIM demo lot without customer files', async ({ page }) => {
  await page.goto('/app');

  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  await expect(page.getByText('facade etage 1 FINAL v2.pdf', { exact: true })).toBeVisible();
  await expect(page.getByText('plan rdc copie.dwg', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Renommer tout/i })).toBeEnabled();
});

test('enforces the Free quota and exposes the Pro upgrade path', async ({ page }) => {
  await page.goto('/app');

  await expect(page.getByText(/3 lot\(s\) restant\(s\)/i)).toBeVisible();
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  const renameButton = page.getByRole('button', {
    name: /Renommer tout selon la nomenclature active/i,
  });

  await renameButton.click();
  await expect(page.getByText(/2 lot\(s\) restant\(s\)/i)).toBeVisible();

  await renameButton.click();
  await expect(page.getByText(/1 lot\(s\) restant\(s\)/i)).toBeVisible();

  await renameButton.click();
  await expect(page.getByText(/0 lot\(s\) restant\(s\)/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Limite Free atteinte/i })).toBeDisabled();
  await expect(page.getByRole('link', { name: /Passer Pro/i })).toBeVisible();
});

test('completes a real BIM renaming journey and downloads the ZIP', async ({ page, isMobile }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  const nomenclature = isMobile
    ? page.locator('details').filter({ hasText: 'Configuration de la nomenclature' })
    : page.locator('aside[aria-label="Configuration de la nomenclature"]');

  if (isMobile) {
    await nomenclature.locator('summary').click();
  }

  await nomenclature.getByPlaceholder('PROJET', { exact: true }).fill('MUSEE');
  await nomenclature.getByPlaceholder('BAT', { exact: true }).fill('BAT01');
  await nomenclature.getByRole('combobox', { name: 'Lot', exact: true }).selectOption('ARC');
  await nomenclature.getByPlaceholder('PLAN', { exact: true }).fill('PLAN');
  await nomenclature.getByPlaceholder('ENT', { exact: true }).fill('BOUYGUES_BATIMENT');
  await nomenclature.getByPlaceholder('001', { exact: true }).fill('1');

  await page.getByRole('button', { name: /Renommer tout selon la nomenclature active/i }).click();

  await expect(page.getByText('Renommé', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/MUSEE_BAT01_ARC_PLAN_BOUYGUES_BATIMENT_/).first()).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger tout (ZIP)', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('FICHIERS_RENOMMES.ZIP');
});
