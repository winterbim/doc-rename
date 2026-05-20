import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import type { Cue } from '../lib/script';
import { colors, fonts } from '../lib/tokens';

/**
 * Always-on subtitle bar at the bottom-center of the frame.
 * Each cue fades in/out around its window.
 *
 * `vertical=true` switches positioning + font sizes for the 9:16 crop
 * (bigger text, slightly higher position so it never crowds the bottom).
 */
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
        bottom: vertical ? 240 : 96,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 60px',
        pointerEvents: 'none',
        opacity,
      }}
    >
      <div
        style={{
          background: 'rgba(36, 31, 25, 0.92)',
          color: colors.paper,
          padding: vertical ? '20px 32px' : '18px 28px',
          borderRadius: 10,
          fontFamily: fonts.sans,
          fontWeight: 600,
          fontSize: vertical ? 44 : 34,
          lineHeight: 1.25,
          letterSpacing: '-0.005em',
          maxWidth: vertical ? 920 : 1500,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          textShadow: '0 1px 0 rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          border: `1px solid rgba(247, 243, 234, 0.12)`,
        }}
      >
        {active.text}
      </div>
    </div>
  );
}
