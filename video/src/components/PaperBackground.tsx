import React from 'react';
import { AbsoluteFill } from 'remotion';
import { colors } from '../lib/tokens';

/**
 * Landing-like dark canvas with the same soft cyan / indigo glows as production.
 */
export function PaperBackground({
  children,
  variant = 'dark',
}: {
  children?: React.ReactNode;
  variant?: 'dark' | 'app';
}) {
  if (variant === 'app') {
    return (
      <AbsoluteFill style={{ background: colors.bg }}>
        {children}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at 78% 12%, rgba(34, 211, 238, .10), transparent 28rem),
          radial-gradient(circle at 8% 80%, rgba(99, 102, 241, .12), transparent 30rem),
          ${colors.navy}
        `,
        color: colors.inkOnDark,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
