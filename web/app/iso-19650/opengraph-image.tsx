import { OG_SIZE, buildOgImage } from '@/lib/og-template';

export const alt = 'Guide ISO 19650 — nommage des livrables BIM';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return buildOgImage(
    'Nommer ses livrables BIM selon ISO 19650.',
    'Champs, exemples avant/après et modèle téléchargeable',
  );
}
