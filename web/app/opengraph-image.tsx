import { ImageResponse } from 'next/og';

export const alt = 'BIMCHECK-Rename — convention de nommage local-first';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        color: '#E6EDF6',
        background: 'linear-gradient(135deg, #0A0F1E 0%, #152238 70%, #164E63 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: 34, fontWeight: 700 }}>
        <div style={{ display: 'flex', padding: '14px 18px', borderRadius: 14, background: '#67E8F9', color: '#06121F' }}>
          BC
        </div>
        BIMCHECK-Rename
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, maxWidth: 980 }}>
          Des noms de fichiers propres, sans envoyer vos documents.
        </div>
        <div style={{ fontSize: 30, color: '#A8B6CA' }}>
          Aperçu avant/après · traitement navigateur · export ZIP
        </div>
      </div>
    </div>,
    size,
  );
}
