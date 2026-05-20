import { FPS, SCENE_FRAMES, sceneStartFrames } from './tokens';

/**
 * Subtitle cues for the silent master.
 * `start`/`end` are absolute frames @ 30fps from the start of the master comp.
 *
 * V1 BIM-only — every cue uses the BIM/CDE vocabulary (ISO 19650, SIA,
 * livrable, CDE) that the target audience uses every day.
 *
 * Lines are intentionally short (≤ 60 chars) so they remain legible on
 * smaller players and on the 9:16 crop.
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
 * Master subtitle track (≈ 82 s — V1 BIM).
 * Scene boundaries in seconds:
 *   problem 0-10 · solution 10-20 · import 20-32 · nomen 32-48 ·
 *   bim 48-60 · exportZip 60-72 · privacy 72-80 · cta 80-84
 */
export const subtitles: Cue[] = [
  // Scene 1 — Problem 0 → 10 s
  cue(0.4, 4.0, 'Renommer un lot BIM avant dépôt CDE :\n30 minutes par livrable.'),
  cue(4.2, 7.0, 'Et une convention qui dérive à chaque projet.'),
  cue(7.2, 9.8, 'Erreurs, doublons, livrables non conformes.'),

  // Scene 2 — Solution 10 → 20 s
  cue(10.2, 14.4, 'BimDoc Renamer.'),
  cue(14.6, 19.8, 'Convention ISO 19650 ou SIA, appliquée en 60 secondes.'),

  // Scene 3 — Import 20 → 32 s
  cue(20.3, 24.8, 'Importez votre lot : plans, IFC, DWG, PDF, ZIP DOE.'),
  cue(25.0, 28.6, 'Lecture 100 % navigateur — aucun upload.'),
  cue(28.8, 31.8, 'Tout reste sur votre poste.'),

  // Scene 4 — Nomenclature 32 → 48 s
  cue(32.3, 36.4, 'Composez votre convention BIM.'),
  cue(36.6, 41.8, 'Projet · Phase · Lot · Zone · Niveau · Type · Révision.'),
  cue(42.0, 47.8, 'Templates ISO 19650, SIA 2051, ou maison.'),

  // Scene 5 — BIM Before/After 48 → 60 s
  cue(48.3, 53.0, 'Aperçu Avant / Après ligne par ligne.'),
  cue(53.2, 59.8, 'Vous corrigez à la main si besoin.'),

  // Scene 6 — Export CDE 60 → 72 s
  cue(60.3, 65.4, 'Exportez un ZIP propre, arborescence intacte.'),
  cue(65.6, 71.8, 'Prêt pour Autodesk Docs, Trimble Connect ou Kroqi.'),

  // Scene 7 — Privacy 72 → 80 s
  cue(72.3, 76.4, 'Aucun fichier ne quitte votre navigateur.'),
  cue(76.6, 79.8, 'Vérifiable dans DevTools > Réseau.'),

  // Scene 8 — CTA 80 → 84 s
  cue(80.3, 83.8, 'Essayer sans compte — bimdoc-renamer.com'),
];

/**
 * Short variant (30 s) subtitle track — BIM-only.
 * Beats: problem → product → nomen → before/after → CTA.
 */
export const subtitlesShort: Cue[] = [
  cue(0.4, 3.6, 'Renommer un lot BIM avant dépôt CDE :\n30 minutes.'),
  cue(4.0, 7.5, 'BimDoc Renamer — convention ISO 19650 en 60 secondes.'),
  cue(8.0, 12.5, 'Importez. Composez votre convention BIM.'),
  cue(13.0, 18.0, 'Projet · Phase · Lot · Type · Zone · Révision.'),
  cue(18.5, 23.0, 'Renommez tout un lot en quelques secondes.'),
  cue(23.5, 27.0, 'ZIP propre, prêt pour Autodesk Docs / Trimble / Kroqi.'),
  cue(27.5, 29.8, 'Sans compte — bimdoc-renamer.com'),
];

/** Convenience export so the layout layer can re-use scene frame map. */
export const sceneStarts = starts;
export const sceneFrames = SCENE_FRAMES;
