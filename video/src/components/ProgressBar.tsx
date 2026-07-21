import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { colors } from '../lib/tokens';

export function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background: 'rgba(148, 163, 184, 0.18)',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #67E8F9, #6366F1)',
          boxShadow: '0 0 12px rgba(103, 232, 249, .55)',
        }}
      />
    </div>
  );
}
