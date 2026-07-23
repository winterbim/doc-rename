import { OG_SIZE, buildOgImage } from '@/lib/og-template';

export const alt = 'Pilote 14 jours — BIMCHECK-Rename';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return buildOgImage(
    'Pilote 14 jours, onboarding guidé.',
    'Diagnostic de convention · lots réels · 49 € paiement unique',
  );
}
