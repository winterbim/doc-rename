import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../lib/tokens';

/**
 * Warm-paper background with the same subtle dot/line grid used on
 * the landing page (web/app/page.tsx).
 */
export function PaperBackground({
  children,
  tint = colors.paper,
  showGrid = true,
}: {
  children?: React.ReactNode;
  tint?: string;
  showGrid?: boolean;
}) {
  const gridLayer = showGrid
    ? `
        linear-gradient(90deg, rgba(36,31,25,.045) 1px, transparent 1px),
        linear-gradient(rgba(36,31,25,.035) 1px, transparent 1px),
      `
    : '';
  return (
    <AbsoluteFill
      style={{
        background: `${gridLayer}${tint}`,
        backgroundSize: '44px 44px',
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
