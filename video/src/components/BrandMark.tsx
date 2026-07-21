import React from 'react';
import { Img, staticFile } from 'remotion';
import { colors, fonts } from '../lib/tokens';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<
  Size,
  { logoH: number; gap: number; brand: number; maxW: number; mark: number }
> = {
  sm: { logoH: 28, gap: 10, brand: 16, maxW: 120, mark: 32 },
  md: { logoH: 48, gap: 14, brand: 26, maxW: 200, mark: 44 },
  lg: { logoH: 72, gap: 18, brand: 36, maxW: 280, mark: 64 },
  xl: { logoH: 110, gap: 24, brand: 48, maxW: 420, mark: 88 },
};

/**
 * Official BIMCheck logo + product name as on the live site.
 * `mode="app"` uses the cyan/indigo BC tile like the real Header.
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
                fontSize: dim.brand * 0.72,
                letterSpacing: '-0.02em',
                color: ink,
                lineHeight: 1,
              }}
            >
              BIMCHECK-Rename
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: Math.max(11, dim.brand * 0.32),
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

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: dim.gap, ...style }}>
      <Img
        src={staticFile('brand/bimcheck-logo.png')}
        alt="BIMCheck Consulting"
        style={{
          height: dim.logoH,
          width: 'auto',
          maxWidth: dim.maxW,
          objectFit: 'contain',
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
          display: 'block',
        }}
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: dim.brand,
            letterSpacing: '-0.02em',
            color: inverted ? colors.inkOnDark : colors.ink,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: inverted ? colors.inkOnDark : colors.ink }}>BIMCHECK</span>
          <span style={{ color: inverted ? colors.cyan : colors.cyanDeep, fontWeight: 600 }}> Rename</span>
        </span>
      )}
    </div>
  );
}
