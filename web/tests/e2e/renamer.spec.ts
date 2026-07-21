import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';
import { expect, test, type Page } from '@playwright/test';

function uploadInput(page: Page) {
  return page
    .getByRole('button', {
      name: /Glissez vos fichiers ou un ZIP ici, ou cliquez pour parcourir/i,
    })
    .locator('..')
    .locator('input[type="file"][multiple]');
}

test('loads the marketing and privacy pages', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/BIMCHECK-Rename/i);
  await expect(page.getByRole('link', { name: /BIMCHECK-Rename.*accueil|BIMCHECK.*Rename/i }).first()).toBeVisible();

  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: /BIMCHECK-Rename garde vos fichiers/i })).toBeVisible();

  await page.goto('/pilot');
  await expect(page.getByRole('heading', { level: 1, name: /pilote de 14 jours/i })).toBeVisible();
  await expect(page.getByText(/49\s*€/i).first()).toBeVisible();
  await expect(page.getByLabel(/Email pro/i)).toBeVisible();
});

test('keeps every public route honest in manual or Stripe test mode', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const serverErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
  });

  for (const route of ['/', '/pricing', '/pilot', '/privacy', '/mentions-legales', '/conditions', '/security']) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(400);
  }

  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://rename.bimcheck-consulting.com',
  );
  const robots = await page.request.get('/robots.txt');
  expect(await robots.text()).toContain(
    'Sitemap: https://rename.bimcheck-consulting.com/sitemap.xml',
  );
  const sitemap = await page.request.get('/sitemap.xml');
  expect(await sitemap.text()).toContain('<loc>https://rename.bimcheck-consulting.com</loc>');

  await page.goto('/pricing');
  const directTeamCheckout = page.getByRole('link', { name: /S’abonner — Team/i }).first();
  if (await directTeamCheckout.count()) {
    await expect(directTeamCheckout).toHaveAttribute(
      'href',
      /^https:\/\/buy\.stripe\.com\/test_[A-Za-z0-9]+\?locale=fr$/,
    );
    await expect(page.getByRole('link', { name: /S’abonner — Cabinet/i }).first()).toHaveAttribute(
      'href',
      /^https:\/\/buy\.stripe\.com\/test_[A-Za-z0-9]+\?locale=fr$/,
    );
    await page.goto('/pilot');
    await expect(page.getByRole('link', { name: /Réserver le pilote/i }).first()).toHaveAttribute(
      'href',
      /^https:\/\/buy\.stripe\.com\/test_[A-Za-z0-9]+\?locale=fr$/,
    );
  } else {
    await expect(page.getByText(/aucun prélèvement en ligne/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Demander Team/i }).first()).toHaveAttribute(
      'href',
      /\/pilot\?plan=team/,
    );
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /comptes équipe ne sont pas encore ouverts/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Google|GitHub/i })).toHaveCount(0);

  await page.goto('/account');
  await expect(page.getByRole('heading', { name: /comptes équipe ne sont pas encore ouverts/i })).toBeVisible();

  const missing = await page.goto('/cette-route-n-existe-pas');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Page introuvable/i })).toBeVisible();

  expect(runtimeErrors).toEqual([]);
  expect(serverErrors).toEqual([]);
});

test('keeps filename and file content local through import, rename and ZIP download', async ({ page }) => {
  const fixtureMarker = 'BIMCHECK_LOCAL_CONTENT_7F48A9C2';
  const privateFilename = 'CLIENT_CONFIDENTIEL_7F48A9C2.pdf';
  const encodedFilename = encodeURIComponent(privateFilename);
  const contentBase64 = Buffer.from(fixtureMarker).toString('base64');
  const filenameBase64 = Buffer.from(privateFilename).toString('base64');
  const leaks: Array<{ url: string; token: string }> = [];
  page.on('request', (request) => {
    const body = request.postDataBuffer();
    const haystack = [
      request.url(),
      JSON.stringify(request.headers()),
      body?.toString('utf8') ?? '',
      body?.toString('base64') ?? '',
    ].join('\n');
    for (const token of [
      fixtureMarker,
      privateFilename,
      encodedFilename,
      contentBase64,
      filenameBase64,
    ]) {
      if (haystack.includes(token)) leaks.push({ url: request.url(), token });
    }
  });

  await page.goto('/app');

  const chooseFilesButton = page.getByRole('button', { name: 'Choisir des fichiers', exact: true });
  const renameButton = page.getByRole('button', { name: /Renommer tout selon la nomenclature active/i });
  await expect(chooseFilesButton).toBeEnabled();
  await expect(chooseFilesButton).toHaveText(/Choisir des fichiers/i);
  await expect(renameButton).toBeDisabled();

  await expect(page.getByRole('button', { name: /Glissez vos fichiers ou un ZIP ici/i })).toBeVisible();

  await uploadInput(page).setInputFiles({
      name: privateFilename,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`%PDF-1.4\n% ${fixtureMarker}\n`),
    });

  await expect(page.getByText(privateFilename, { exact: true })).toBeVisible();
  await expect(renameButton).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Ajouter des fichiers', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Prêt').first()).toBeVisible();

  await renameButton.click();
  await expect(page.getByText('Renommé', { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger tout (ZIP)', exact: true }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const archive = await JSZip.loadAsync(await readFile(downloadPath!));
  const entries = Object.values(archive.files).filter((entry) => !entry.dir);
  expect(entries).toHaveLength(1);
  expect(await entries[0]!.async('string')).toContain(fixtureMarker);
  expect(leaks).toEqual([]);
});

test('supports a real drag-and-drop import', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'One-browser DOM drag-and-drop smoke test');
  await page.goto('/app');
  const dropTrigger = page.getByRole('button', { name: /Glissez vos fichiers ou un ZIP ici/i });
  await expect(dropTrigger).toBeVisible();
  await dropTrigger.evaluate((trigger) => {
    const dropZone = trigger.parentElement;
    if (!dropZone) throw new Error('Drop zone not found');
    const transfer = new DataTransfer();
    transfer.items.add(
      new File(['ISO-10303-21;\nEND-ISO-10303-21;\n'], 'glisser-deposer.ifc', {
        type: 'application/octet-stream',
      }),
    );
    dropZone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: transfer }));
    dropZone.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: transfer }));
    dropZone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
  });
  await expect(page.getByText('glisser-deposer.ifc', { exact: true })).toBeVisible();
  await expect(page.getByText('Prêt', { exact: true })).toBeVisible();
});

test('records a pilot request only after the API confirms persistence', async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/pilot-requests', async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({ accepted: true, reference: 'AUDIT-UI-20260721' }),
    });
  });
  await page.goto('/pilot?plan=team');
  await page.getByLabel('Email pro').fill('audit-ui@example.test');
  await page.getByLabel('Organisation').fill('Organisation de test');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  await expect(page.getByRole('status')).toContainText('AUDIT-UI-20260721');
  expect(submitted).toMatchObject({
    email: 'audit-ui@example.test',
    company: 'Organisation de test',
    offer: 'team',
    consent: true,
  });
});

test('never claims a failed pilot request was sent', async ({ page }) => {
  await page.route('**/api/pilot-requests', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Réception temporairement indisponible.' }),
    });
  });
  await page.goto('/pilot');
  await page.getByLabel('Email pro').fill('audit-ui@example.test');
  await page.getByLabel('Organisation').fill('Organisation de test');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Envoyer la demande' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('temporairement indisponible');
  await expect(page.getByText(/Demande transmise et enregistrée/i)).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Envoyer plutôt un email/i })).toHaveAttribute(
    'href',
    /^mailto:/,
  );
});

test('makes the full pricing comparison accessible on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-specific comparison behavior');
  await page.goto('/pricing');

  await expect(page.getByText(/Faites glisser le tableau/i)).toBeVisible();
  const comparison = page.getByRole('region', {
    name: /Comparaison détaillée des offres tarifaires/i,
  });
  await expect(comparison).toBeVisible();
  await expect(comparison.getByRole('columnheader', { name: 'Cabinet' })).toBeAttached();

  const canScroll = await comparison.evaluate(
    (element) => element.scrollWidth > element.clientWidth,
  );
  expect(canScroll).toBe(true);
});

test('loads a BIM demo lot without customer files', async ({ page }) => {
  await page.goto('/app');

  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  await expect(page.getByText('facade etage 1 FINAL v2.pdf', { exact: true })).toBeVisible();
  await expect(page.getByText('plan rdc copie.dwg', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Renommer tout/i })).toBeEnabled();

  await page.getByRole('button', { name: /Supprimer tous les fichiers/i }).click();
  await expect(page.getByText('facade etage 1 FINAL v2.pdf', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Renommer tout selon la nomenclature active/i })).toBeDisabled();
});

test('keeps the manual name editor usable and inside its modal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'One-browser modal regression test');
  await page.goto('/app');
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();
  await page
    .getByRole('button', { name: /Modifier le nom de facade etage 1 FINAL v2\.pdf/i })
    .click();

  const dialog = page.getByRole('dialog', { name: 'Modifier le nom' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('list', { name: 'Segments du nom de fichier' })).toBeVisible();
  const firstSegment = dialog.getByRole('textbox', { name: 'Segment 1', exact: true });
  await expect(firstSegment).toBeVisible();
  await firstSegment.fill('NOM_MANUEL');
  await dialog.getByRole('button', { name: 'Appliquer' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Télécharger NOM_MANUEL.PDF' })).toBeVisible();
});

test('has no global horizontal overflow at the configured viewport', async ({ page }) => {
  for (const route of ['/', '/app', '/pricing', '/pilot']) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 5)
        .map((element) => ({
          tag: element.tagName,
          className: element.className,
          text: element.textContent?.trim().slice(0, 80),
          right: Math.round(element.getBoundingClientRect().right),
        })),
    }));
    expect(dimensions.content, `${route}: ${JSON.stringify(dimensions.offenders)}`).toBeLessThanOrEqual(
      dimensions.viewport + 1,
    );
  }
});

test('remains usable in mobile portrait and landscape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Viewport-switching smoke test');
  for (const viewport of [
    { width: 412, height: 915 },
    { width: 915, height: 412 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/app');
    await expect(page.getByRole('button', { name: /Choisir des fichiers/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Charger un lot exemple/i })).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasOverflow, JSON.stringify(viewport)).toBe(false);
  }
});

test('explains the JavaScript requirement without scripting', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Single no-JavaScript rendering check');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noScriptPage = await context.newPage();
  try {
    const baseURL = String(testInfo.project.use.baseURL ?? 'http://127.0.0.1:3000');
    await noScriptPage.goto(new URL('/app', baseURL).href);
    await expect(
      noScriptPage.getByRole('heading', { name: /JavaScript est requis/i }),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test('enforces the Free quota and exposes the Team upgrade path', async ({ page }) => {
  await page.goto('/app');

  await expect(page.getByText(/5 lot\(s\) restant\(s\)/i)).toBeVisible();
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  const renameButton = page.getByRole('button', {
    name: /Renommer tout selon la nomenclature active/i,
  });

  // Burn the free daily quota (5 lots)
  for (let remaining = 4; remaining >= 0; remaining -= 1) {
    await renameButton.click();
    await expect(page.getByText(new RegExp(`${remaining} lot\\(s\\) restant`, 'i'))).toBeVisible();
  }

  await expect(page.getByRole('button', { name: /Limite Free atteinte/i })).toBeDisabled();
  await expect(page.getByRole('link', { name: /Voir Team/i }).last()).toBeVisible();
});

test('completes a real BIM renaming journey and downloads the ZIP', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: /Charger un lot exemple/i }).click();

  const compactNomenclature = page
    .locator('details')
    .filter({ hasText: 'Configuration de la nomenclature' });
  const usesCompactNomenclature = await compactNomenclature.isVisible().catch(() => false);
  const nomenclature = usesCompactNomenclature
    ? compactNomenclature
    : page.locator('aside[aria-label="Configuration de la nomenclature"]');

  if (usesCompactNomenclature) await nomenclature.locator('summary').click();

  await nomenclature.getByPlaceholder('PROJET', { exact: true }).fill('MUSEE');
  await nomenclature.getByPlaceholder('BAT', { exact: true }).fill('BAT01');
  await nomenclature.getByRole('combobox', { name: 'Lot', exact: true }).selectOption('ARC');
  await nomenclature.getByPlaceholder('PLAN', { exact: true }).fill('PLAN');
  await nomenclature.getByPlaceholder('ENT', { exact: true }).fill('BOUYGUES_BATIMENT');
  await nomenclature.getByPlaceholder('001', { exact: true }).fill('1');

  await page.getByRole('button', { name: /Renommer tout selon la nomenclature active/i }).click();

  await expect(page.getByText('Renommé', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/MUSEE_BAT01_ARC_PLAN_BOUYGUES_BATIMENT_/).first()).toBeVisible();
  await expect(page.getByText(/Lot prêt à déposer/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /Demander le pilote/i })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger tout (ZIP)', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('FICHIERS_RENOMMES.ZIP');
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const archive = await JSZip.loadAsync(await readFile(downloadPath!));
  const entryNames = Object.values(archive.files)
    .filter((entry) => !entry.dir)
    .map((entry) => entry.name)
    .sort();
  const previewedNames = await page.locator('li p[title]').evaluateAll((elements) =>
    elements
      .map((element) => element.getAttribute('title'))
      .filter((name): name is string => Boolean(name?.startsWith('MUSEE_')))
      .sort(),
  );
  expect(entryNames).toEqual(previewedNames);
  expect(entryNames).toHaveLength(5);
  const pdfEntry = Object.values(archive.files).find(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.pdf'),
  );
  const csvEntry = Object.values(archive.files).find(
    (entry) => !entry.dir && entry.name.toLowerCase().endsWith('.csv'),
  );
  expect(pdfEntry).toBeDefined();
  expect(csvEntry).toBeDefined();
  expect(await pdfEntry!.async('string')).toContain('BIMCHECK demo fixture');
  expect(await csvEntry!.async('string')).toContain('Lot;Emetteur;Discipline');
});
