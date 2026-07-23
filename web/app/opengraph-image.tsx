import { OG_SIZE, buildOgImage } from '@/lib/og-template';

export const alt = 'BIMCHECK-Rename — convention de nommage local-first';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return buildOgImage(
    'Des noms de fichiers propres, sans envoyer vos documents.',
    'Aperçu avant/après · traitement navigateur · export ZIP',
  );
}
