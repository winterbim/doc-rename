import { FPS, SCENE_FRAMES, sceneStartFrames } from './tokens';

/**
 * Subtitle cues for the silent master explaining the SaaS product.
 * `start`/`end` are absolute frames @ 30fps from the start of the master comp.
 */
export type Cue = {
  start: number;
  end: number;
  text: string;
};

const starts = sceneStartFrames();
const s = (sec: number) => Math.round(sec * FPS);

const cue = (fromSec: number, toSec: number, text: string): Cue => ({
  start: s(fromSec),
  end: s(toSec),
  text,
});

/**
 * Master subtitle track (≈ 84 s) — how BIMCHECK-Rename works.
 * Scene boundaries in seconds:
 *   problem 0-10 · solution 10-20 · import 20-32 · nomen 32-48 ·
 *   bim 48-60 · exportZip 60-72 · privacy 72-80 · cta 80-84
 */
export const subtitles: Cue[] = [
  // Scene 1 — Problem 0 → 10 s
  cue(0.4, 4.0, 'Chaque équipe renomme à sa façon.'),
  cue(4.2, 7.2, 'Erreurs, pertes de temps, livrables non conformes.'),
  cue(7.4, 9.8, 'Avant dépôt CDE, archive ou partage client.'),

  // Scene 2 — Solution 10 → 20 s
  cue(10.2, 13.8, 'BIMCHECK-Rename.'),
  cue(14.0, 17.2, 'La même convention de nommage, appliquée sans improviser.'),
  cue(17.4, 19.8, 'BIM, Juridique, Finance, RH, Santé, Industrie…'),

  // Scene 3 — Import 20 → 32 s
  cue(20.3, 24.4, '1. Importez votre lot : PDF, IFC, DWG, ZIP…'),
  cue(24.6, 28.2, 'Lecture 100 % navigateur — aucun upload fichier.'),
  cue(28.4, 31.8, 'Tout reste sur votre poste.'),

  // Scene 4 — Nomenclature 32 → 48 s
  cue(32.3, 36.4, '2. Composez votre convention.'),
  cue(36.6, 41.6, 'Templates métier + champs, abréviations, séparateur.'),
  cue(41.8, 47.8, 'Importez vos entités (CSV / Excel) si besoin.'),

  // Scene 5 — Before/After 48 → 60 s
  cue(48.3, 53.0, '3. Contrôlez l’aperçu Avant / Après.'),
  cue(53.2, 59.8, 'Corrigez une ligne, renommez tout le lot.'),

  // Scene 6 — Export 60 → 72 s
  cue(60.3, 65.4, '4. Exportez un ZIP propre, arborescence intacte.'),
  cue(65.6, 71.8, 'Prêt pour CDE, GED ou partage client.'),

  // Scene 7 — Privacy + plans 72 → 80 s
  cue(72.3, 76.0, 'Local-first : vérifiable dans DevTools > Réseau.'),
  cue(76.2, 79.8, 'Free · Team 19 €/mois · licence activée automatiquement.'),

  // Scene 8 — CTA 80 → 84 s
  cue(80.3, 83.8, 'Essayer sans compte — rename.bimcheck-consulting.com'),
];

/**
 * Short variant (30 s) — product how-it-works.
 */
export const subtitlesShort: Cue[] = [
  cue(0.4, 3.4, 'Convention de nommage en équipe :\nplus de chaos avant dépôt.'),
  cue(3.6, 7.2, 'BIMCHECK-Rename — local-first, multi-métiers.'),
  cue(7.4, 12.0, 'Importez. Composez. Contrôlez. Exportez.'),
  cue(12.2, 17.0, 'Aucun fichier ne quitte le navigateur.'),
  cue(17.2, 22.4, 'Free pour tester. Team 19 €/mois, licence auto.'),
  cue(22.6, 26.8, 'ZIP propre, prêt pour votre CDE / GED.'),
  cue(27.0, 29.8, 'rename.bimcheck-consulting.com'),
];

/** Convenience export so the layout layer can re-use scene frame map. */
export const sceneStarts = starts;
export const sceneFrames = SCENE_FRAMES;
