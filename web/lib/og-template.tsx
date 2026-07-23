import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/** Logo BIMCheck officiel (cube BIM + check qualité) dessiné en vectoriel. */
function BrandMark({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <rect width="200" height="200" rx="24" fill="#DC2626" />
      <g transform="translate(35, 25)">
        <path d="M65 25 L65 105 L15 130 L15 50 Z" fill="white" opacity="0.95" />
        <path d="M65 25 L115 50 L115 130 L65 105 Z" fill="white" opacity="0.8" />
        <path d="M15 50 L65 25 L115 50 L65 75 Z" fill="white" />
      </g>
      <circle cx="160" cy="160" r="30" fill="#059669" />
      <path
        d="M145 160 L155 170 L175 148"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Template OG partagé (1200×630) — même identité sur toutes les pages,
 * titre/sous-titre spécifiques par route.
 */
export function buildOgImage(title: string, subtitle: string): ImageResponse {
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
        <BrandMark />
        BIMCHECK-Rename
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ fontSize: 64, lineHeight: 1.08, fontWeight: 700, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ fontSize: 30, color: '#A8B6CA' }}>{subtitle}</div>
      </div>
    </div>,
    OG_SIZE,
  );
}
