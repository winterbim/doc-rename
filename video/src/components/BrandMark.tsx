import React from 'react';
import { colors, fonts } from '../lib/tokens';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, { box: number; type: number; gap: number; brand: number }> = {
  sm: { box: 34, type: 14, gap: 12, brand: 18 },
  md: { box: 56, type: 22, gap: 18, brand: 32 },
  lg: { box: 96, type: 38, gap: 26, brand: 56 },
  xl: { box: 180, type: 72, gap: 40, brand: 120 },
};

/**
 * The "DR" tile + DOC-RENAME wordmark, reproducing the landing header.
 */
export function BrandMark({
  size = 'md',
  showWordmark = true,
  inverted = false,
  style,
}: {
  size?: Size;
  showWordmark?: boolean;
  inverted?: boolean;
  style?: React.CSSProperties;
}) {
  const dim = SIZES[size];
  const bg = inverted ? colors.paper : colors.ink;
  const fg = inverted ? colors.ink : colors.paper;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        ...style,
      }}
    >
      <div
        style={{
          width: dim.box,
          height: dim.box,
          borderRadius: dim.box * 0.22,
          background: bg,
          color: fg,
          fontFamily: fonts.sans,
          fontWeight: 700,
          fontSize: dim.type,
          letterSpacing: '-0.04em',
          display: 'grid',
          placeItems: 'center',
          border: `1px solid ${inverted ? colors.lineStrong : colors.ink}`,
        }}
      >
        DR
      </div>
      {showWordmark && (
        <span
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: dim.brand,
            letterSpacing: '-0.02em',
            color: inverted ? colors.paper : colors.ink,
          }}
        >
          DOC-RENAME
        </span>
      )}
    </div>
  );
}
