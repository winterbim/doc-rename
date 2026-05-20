import { FPS, SCENE_FRAMES, sceneStartFrames } from './tokens';

/**
 * Subtitle cues for the silent master.
 * `start`/`end` are absolute frames @ 30fps from the start of the master comp.
 *
 * Lines are intentionally short (≤ 60 chars) so they remain legible at
 * smaller players and on the 9:16 crop.
 */
export type Cue = {
  start: number;
  end: number;
  /** Up to two lines — anything longer hurts readability. */
  text: string;
};

const starts = sceneStartFrames();
const s = (sec: number) => Math.round(sec * FPS);

/** Helper: build a cue from absolute seconds (master timeline). */
const cue = (fromSec: number, toSec: number, text: string): Cue => ({
  start: s(fromSec),
  end: s(toSec),
  text,
});

/**
 * Master subtitle track.
 * Numbers in comments below are the seconds boundary of the *scene* they
 * belong to (mirrors the brief).
 */
export const subtitles: Cue[] = [
  // Scene 1 — 0 → 10 s
  cue(0.4, 3.6, 'Des fichiers mal nommés\nralentissent vos projets.'),
  cue(3.8, 7.0, 'Perte de temps, erreurs, doublons.'),
  cue(7.2, 9.8, 'Des livrables difficiles à contrôler.'),

  // Scene 2 — 10 → 20 s
  cue(10.2, 14.8, 'DOC-RENAME'),
  cue(15.0, 19.8, 'Renommage documentaire professionnel.'),

  // Scene 3 — 20 → 32 s
  cue(20.3, 24.8, 'Importez vos fichiers ou vos archives.'),
  cue(25.0, 28.6, 'PDF, DOCX, images, tableurs, ZIP…'),
  cue(28.8, 31.8, 'Tout reste dans votre navigateur.'),

  // Scene 4 — 32 → 48 s
  cue(32.3, 36.4, 'Construisez votre convention.'),
  cue(36.6, 41.8, 'Champs métier, ordre, séparateur.'),
  cue(42.0, 47.8, 'Une règle claire, appliquée à tous les fichiers.'),

  // Scene 5 — 48 → 60 s
  cue(48.3, 53.0, 'Cas d’usage : BIM / Construction'),
  cue(53.2, 59.8, 'Plans, DOE, rapports, livrables CDE.'),

  // Scene 6 — 60 → 72 s
  cue(60.3, 65.4, 'Finance · RH · Juridique · Administratif.'),
  cue(65.6, 71.8, 'Le même principe, adapté à chaque métier.'),

  // Scene 7 — 72 → 82 s
  cue(72.3, 76.6, 'Exportez tout en ZIP personnalisé.'),
  cue(76.8, 81.8, 'Un livrable propre, prêt à transmettre.'),

  // Scene 8 — 82 → 90 s
  cue(82.3, 86.4, 'Vos fichiers restent dans votre navigateur.'),
  cue(86.6, 89.8, 'Aucun contenu document envoyé au serveur.'),

  // Scene 9 — 90 → 94 s
  cue(90.3, 93.8, 'Renommez. Normalisez. Exportez.'),
];

/**
 * Short variant (30 s) subtitle track.
 * Scenes condensed: problem → product → nomen → before/after → CTA.
 */
export const subtitlesShort: Cue[] = [
  cue(0.4, 3.6, 'Des fichiers mal nommés\nralentissent vos projets.'),
  cue(4.0, 7.5, 'DOC-RENAME — renommage documentaire pro.'),
  cue(8.0, 12.5, 'Importez. Construisez une convention métier.'),
  cue(13.0, 18.0, 'Champs : Projet · Bâtiment · Lot · Type · Rév.'),
  cue(18.5, 23.0, 'Renommez tout un lot en quelques secondes.'),
  cue(23.5, 27.0, 'Exportez un ZIP propre. Local au navigateur.'),
  cue(27.5, 29.8, 'Essayez maintenant — doc-rename.com'),
];

/** Convenience export so the layout layer can re-use scene frame map. */
export const sceneStarts = starts;
export const sceneFrames = SCENE_FRAMES;
