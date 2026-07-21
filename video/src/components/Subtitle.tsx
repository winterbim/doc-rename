import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import type { Cue } from '../lib/script';
import { colors, fonts } from '../lib/tokens';

export function Subtitle({
  cues,
  vertical = false,
}: {
  cues: Cue[];
  vertical?: boolean;
}) {
  const frame = useCurrentFrame();
  const fadeFrames = 6;
  const active = cues.find((c) => frame >= c.start - fadeFrames && frame <= c.end + fadeFrames);
  if (!active) return null;

  const opacity = interpolate(
    frame,
    [active.start - fadeFrames, active.start, active.end, active.end + fadeFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    },
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: vertical ? 240 : 88,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 60px',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div
        style={{
          background: 'rgba(10, 15, 30, 0.92)',
          color: colors.inkOnDark,
          padding: vertical ? '20px 32px' : '16px 26px',
          borderRadius: 12,
          fontFamily: fonts.sans,
          fontWeight: 600,
          fontSize: vertical ? 42 : 32,
          lineHeight: 1.28,
          letterSpacing: '-0.01em',
          maxWidth: vertical ? 920 : 1480,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          border: '1px solid rgba(103, 232, 249, 0.22)',
          boxShadow: '0 16px 40px -20px rgba(0,0,0,.55)',
        }}
      >
        {active.text}
      </div>
    </div>
  );
}
