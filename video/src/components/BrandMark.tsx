import React from 'react';
import { Img, staticFile } from 'remotion';
import { colors, fonts } from '../lib/tokens';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<
  Size,
  { logoH: number; gap: number; brand: number; maxW: number }
> = {
  sm: { logoH: 36, gap: 12, brand: 18, maxW: 140 },
  md: { logoH: 56, gap: 16, brand: 28, maxW: 220 },
  lg: { logoH: 88, gap: 22, brand: 42, maxW: 340 },
  xl: { logoH: 140, gap: 28, brand: 56, maxW: 520 },
};

/**
 * Official BIMCheck Consulting logo (from bimcheck-consulting.com)
 * + optional BIMCHECK-Rename product wordmark.
 */
export function BrandMark({
  size = 'md',
  showWordmark = true,
  inverted = false,
  logoOnly = false,
  style,
}: {
  size?: Size;
  showWordmark?: boolean;
  inverted?: boolean;
  /** Show only the brand logo asset, no product name. */
  logoOnly?: boolean;
  style?: React.CSSProperties;
}) {
  const dim = SIZES[size];
  const ink = inverted ? colors.paper : colors.ink;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        ...style,
      }}
    >
      <Img
        src={staticFile('brand/bimcheck-logo.png')}
        alt="BIMCheck Consulting"
        style={{
          height: dim.logoH,
          width: 'auto',
          maxWidth: dim.maxW,
          objectFit: 'contain',
          // Light paper logos: invert gently on dark backgrounds for contrast.
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
          display: 'block',
        }}
      />
      {showWordmark && !logoOnly && (
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
          BIMCHECK-Rename
        </span>
      )}
    </div>
  );
}
