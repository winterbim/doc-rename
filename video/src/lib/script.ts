import { FPS, sceneStartFrames, SCENE_FRAMES } from './tokens';

export type Cue = {
  start: number;
  end: number;
  text: string;
};

const s = (sec: number) => Math.round(sec * FPS);

const cue = (fromSec: number, toSec: number, text: string): Cue => ({
  start: s(fromSec),
  end: s(toSec),
  text,
});

/**
 * Master (~90 s) — parcours réel du SaaS.
 * 0–10 problem · 10–20 product · 20–32 import · 32–46 convention ·
 * 46–60 rename · 60–72 export · 72–82 privacy+pricing · 82–90 CTA
 */
export const subtitles: Cue[] = [
  cue(0.4, 4.0, 'Chaque équipe renomme à sa façon.'),
  cue(4.2, 7.2, 'Versions, abréviations, erreurs avant dépôt.'),
  cue(7.4, 9.8, 'Temps perdu. Image brouillée auprès des clients.'),

  cue(10.2, 13.6, 'BIMCHECK-Rename.'),
  cue(13.8, 17.2, 'La même convention, appliquée sans improviser.'),
  cue(17.4, 19.8, 'BIM · Juridique · Finance · RH · Santé · Industrie'),

  cue(20.3, 24.2, 'Ouvrez /app — sans compte.'),
  cue(24.4, 28.0, 'Importez PDF, DWG, IFC, DOCX, ZIP…'),
  cue(28.2, 31.8, 'Aucun fichier n’est uploadé. Tout reste local.'),

  cue(32.3, 36.4, 'Choisissez un profil métier.'),
  cue(36.6, 41.4, 'Composez les champs de votre convention.'),
  cue(41.6, 45.8, 'Aperçu live pendant que vous ajustez.'),

  cue(46.3, 51.0, 'Avant / Après, ligne par ligne.'),
  cue(51.2, 55.6, 'Corrigez une entrée, puis renommez le lot.'),
  cue(55.8, 59.8, 'Free : 3 lots par jour. Team : illimité.'),

  cue(60.3, 65.0, 'Téléchargez le ZIP, arborescence intacte.'),
  cue(65.2, 71.8, 'Prêt pour CDE, GED ou partage client.'),

  cue(72.3, 76.2, 'Local-first : vérifiable dans DevTools > Réseau.'),
  cue(76.4, 81.8, 'Team 19 €/mois — licence activée automatiquement après paiement.'),

  cue(82.3, 86.4, 'Essayer sans compte.'),
  cue(86.6, 89.8, 'rename.bimcheck-consulting.com'),
];

export const subtitlesShort: Cue[] = [
  cue(0.3, 3.2, 'Des noms de fichiers chaotiques ?'),
  cue(3.4, 7.0, 'BIMCHECK-Rename — convention multi-métiers.'),
  cue(7.2, 12.0, 'Importez. Composez. Contrôlez. Exportez.'),
  cue(12.2, 16.8, '100 % navigateur — aucun upload fichier.'),
  cue(17.0, 22.2, 'Free 3 lots/jour · Team 19 € · licence auto.'),
  cue(22.4, 26.6, 'ZIP propre, prêt à déposer.'),
  cue(26.8, 29.8, 'rename.bimcheck-consulting.com'),
];

export const sceneStarts = sceneStartFrames();
export const sceneFrames = SCENE_FRAMES;
