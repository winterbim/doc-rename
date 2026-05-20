import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { easeOutCubic } from '../lib/easing';

/**
 * Simple cursor svg that interpolates between two positions over a
 * `[start, end]` frame range. Used to "click" on UI hotspots.
 */
export function Cursor({
  from,
  to,
  start,
  end,
  click,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  start: number;
  end: number;
  click?: number;
}) {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start, end], [from.x, to.x], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const y = interpolate(frame, [start, end], [from.y, to.y], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const opacity = interpolate(frame, [start - 4, start, end + 12, end + 22], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Click ripple
  const clickT = click ?? -1;
  const ripple = interpolate(frame, [clickT, clickT + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rippleOpacity = interpolate(frame, [clickT, clickT + 14], [0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg
      width={36}
      height={42}
      viewBox="0 0 36 42"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))',
      }}
    >
      {click !== undefined && (
        <circle
          cx={6}
          cy={6}
          r={ripple * 22}
          fill="none"
          stroke="#241F19"
          strokeWidth={2}
          opacity={rippleOpacity}
        />
      )}
      <path
        d="M2 2 L2 28 L10 22 L15 32 L19 30 L14 20 L24 20 Z"
        fill="#FFFFFF"
        stroke="#241F19"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}
