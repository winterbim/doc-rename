import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { colors } from '../lib/tokens';

/**
 * Thin top-of-frame gold progress bar. Subtle but professional —
 * gives viewers a sense of duration without being noisy.
 */
export function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ratio = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: 4,
        width: `${ratio * 100}%`,
        background: colors.gold,
        opacity: 0.85,
      }}
    />
  );
}
