import React from 'react';
import { Img, staticFile } from 'remotion';
import { colors, fonts } from '../lib/tokens';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<
  Size,
  { logoH: number; gap: number; brand: number; maxW: number; mark: number }
> = {
  sm: { logoH: 36, gap: 10, brand: 15, maxW: 200, mark: 32 },
  md: { logoH: 56, gap: 14, brand: 22, maxW: 320, mark: 44 },
  lg: { logoH: 88, gap: 16, brand: 28, maxW: 480, mark: 64 },
  xl: { logoH: 150, gap: 18, brand: 34, maxW: 720, mark: 88 },
};

/**
 * Official BIMCheck Consulting logo (transparent PNG variants).
 * - inverted (dark scenes): white mark on transparent — never CSS invert
 * - light scenes: full colour mark
 * - mode="app": matches production Header (BC gradient tile)
 */
export function BrandMark({
  size = 'md',
  showWordmark = true,
  inverted = false,
  mode = 'logo',
  style,
}: {
  size?: Size;
  showWordmark?: boolean;
  inverted?: boolean;
  mode?: 'logo' | 'app';
  style?: React.CSSProperties;
}) {
  const dim = SIZES[size];
  const ink = inverted ? colors.inkOnDark : colors.ink;

  if (mode === 'app') {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: dim.gap * 0.7, ...style }}>
        <div
          style={{
            width: dim.mark,
            height: dim.mark,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #67E8F9, #6366F1)',
            color: '#06121F',
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: dim.mark * 0.36,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 10px 28px -12px rgba(34, 211, 238, .65)',
          }}
        >
          BC
        </div>
        {showWordmark && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontFamily: fonts.sans,
                fontWeight: 700,
                fontSize: dim.brand * 0.85,
                letterSpacing: '-0.02em',
                color: colors.ink,
                lineHeight: 1,
              }}
            >
              BIMCHECK-Rename
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: Math.max(11, dim.brand * 0.42),
                color: colors.inkMute,
                fontWeight: 500,
              }}
            >
              Convention de nommage local-first
            </span>
          </div>
        )}
      </div>
    );
  }

  const src = inverted
    ? staticFile('brand/logo-white.png')
    : staticFile('brand/logo-color.png');

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: dim.gap,
        ...style,
      }}
    >
      <Img
        src={src}
        alt="BIMCheck Consulting"
        style={{
          height: dim.logoH,
          width: 'auto',
          maxWidth: dim.maxW,
          objectFit: 'contain',
          display: 'block',
          // No CSS filter — assets are pre-processed for light/dark.
        }}
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: dim.brand,
            letterSpacing: '-0.02em',
            color: ink,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: ink }}>Produit </span>
          <span style={{ color: inverted ? colors.cyan : colors.cyanDeep }}>BIMCHECK-Rename</span>
        </span>
      )}
    </div>
  );
}
