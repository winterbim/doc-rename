import { expect, test } from '@playwright/test';

/**
 * P0-2 — Le lot exemple doit démontrer la convention, pas la casse.
 * P1-1 — Le lot exemple ne consomme pas le quota Free.
 *
 * Critères d'acceptation de l'audit CX du 2026-07-23 :
 * - chaque nom généré matche le pattern du modèle actif (séparateur, zéro espace)
 * - aucun nom ne se réduit à upper(nom_original)
 * - le compteur Free reste à 5 après la démo
 */
test.describe('lot exemple', () => {
  test('produit des noms structurés conformes au modèle et ne consomme pas le quota', async ({
    page,
  }) => {
    await page.goto('/app');

    // Charger le lot exemple
    await page.getByRole('button', { name: /Charger un lot exemple/i }).click();
    await expect(page.getByText(/5 fichiers ajoutés/i)).toBeVisible();

    // Compteur avant renommage
    await expect(page.getByText(/5 lot\(s\) restant\(s\)/i)).toBeVisible();

    // Renommer tout
    await page.getByRole('button', { name: /Renommer tout/i }).click();
    await expect(page.getByText(/5\/5 fichier\(s\) renommé\(s\)/i)).toBeVisible();

    // P1-1 : le quota est inchangé (toast explicite + compteur toujours à 5)
    await expect(page.getByText(/non décompté de votre quota/i)).toBeVisible();
    await expect(page.getByText(/5 lot\(s\) restant\(s\)/i)).toBeVisible();

    // P0-2 : les nouveaux noms suivent le modèle BIM par défaut (Livraison CDE) :
    // PROJET_BAT_CVC_PLAN_ENT_<seq>_<original nettoyé>.<EXT>
    // — préfixe de champs présent, séparateur _, zéro espace, jamais upper(original).
    const originals = [
      'facade etage 1 FINAL v2.pdf',
      'plan rdc copie.dwg',
      'rapport synthese v3.docx',
      'maquette structure ifc export.ifc',
      'bordereau diffusion revA.csv',
    ];

    // Les nouveaux noms sont rendus dans un <p title={newName}> — on lit le title.
    // Pattern complet : champs du modèle + séquence + nom original nettoyé + extension.
    const pattern = /^PROJET_BAT_CVC_PLAN_ENT_\d{3}_[A-Z0-9_.-]+\.[A-Z0-9]+$/;

    const nameEls = page.locator('p[title^="PROJET_"]');
    await expect(nameEls.first()).toBeVisible();
    const generated = (
      await nameEls.evaluateAll((els) => els.map((el) => el.getAttribute('title') ?? ''))
    )
      // Exclure l'aperçu live (placeholder NOM_FICHIER) et l'exemple du modèle
      // (sans suffixe de fichier) : seuls les vrais fichiers renommés comptent.
      .filter((name) => !name.includes('NOM_FICHIER') && pattern.test(name));
    expect(generated.length).toBe(originals.length);

    for (const name of generated) {
      expect(name, `pas d'espace dans ${name}`).not.toMatch(/\s/);
    }

    // Jamais un simple upper(nom_original)
    for (const original of originals) {
      const upperOriginal = original.toUpperCase();
      expect(generated).not.toContain(upperOriginal);
    }
  });

  test('local-first prouvable : aucune requête sortante pendant importer → renommer → ZIP', async ({
    page,
  }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // On observe le réseau UNIQUEMENT pendant le flux de renommage.
    const outgoing: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      const local =
        url.hostname === 'localhost' || url.hostname === '127.0.0.1';
      const inert = ['data:', 'blob:', 'about:'].some((s) =>
        request.url().startsWith(s),
      );
      if (!local && !inert) outgoing.push(request.url());
    });

    await page.getByRole('button', { name: /Charger un lot exemple/i }).click();
    await expect(page.getByText(/5 fichiers ajoutés/i)).toBeVisible();
    await page.getByRole('button', { name: /Renommer tout/i }).click();
    await expect(page.getByText(/5\/5 fichier\(s\) renommé\(s\)/i)).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Télécharger tout \(ZIP\)/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.zip$/i);

    expect(outgoing, `Requêtes sortantes détectées : ${outgoing.join(', ')}`).toEqual([]);
  });
});
