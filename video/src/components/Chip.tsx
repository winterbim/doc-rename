import React from 'react';
import { colors, fonts } from '../lib/tokens';

/**
 * Pill used for profile / category labels (BIM, Finance, RH…).
 */
export function Chip({
  label,
  active = false,
  tone = 'neutral',
  style,
}: {
  label: string;
  active?: boolean;
  tone?: 'neutral' | 'brick' | 'moss' | 'gold' | 'blue';
  style?: React.CSSProperties;
}) {
  const palette: Record<'neutral' | 'brick' | 'moss' | 'gold' | 'blue', { bg: string; fg: string; border: string }> = {
    neutral: { bg: '#FBF7EE', fg: colors.inkSoft, border: colors.lineStrong },
    brick: { bg: colors.brick, fg: '#FFF', border: colors.brick },
    moss: { bg: colors.moss, fg: '#FFF', border: colors.moss },
    gold: { bg: colors.gold, fg: colors.ink, border: colors.gold },
    blue: { bg: colors.blue, fg: '#FFF', border: colors.blue },
  };
  const p = active ? palette[tone === 'neutral' ? 'brick' : tone] : palette.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: p.bg,
        color: p.fg,
        border: `1px solid ${p.border}`,
        borderRadius: 999,
        padding: '8px 14px',
        fontFamily: fonts.sans,
        fontSize: 16,
        fontWeight: 600,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {label}
    </span>
  );
}
