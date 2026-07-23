import { OG_SIZE, buildOgImage } from '@/lib/og-template';

export const alt = 'Tarifs BIMCHECK-Rename — Free, Team, Cabinet';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return buildOgImage(
    'Rentabilisé dès le premier jalon.',
    'Free 3 lots/jour · Team 19 €/mois · Cabinet 49 €/mois',
  );
}
