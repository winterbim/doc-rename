import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

/**
 * Scene 9 — Final CTA (~90 s → end).
 * Ink-colored panel that mirrors the landing .final section:
 *   logo · headline · tagline · primary button.
 */
export function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = softSpring({ frame, fps, delay: 2 });
  const head = softSpring({ frame, fps, delay: 14 });
  const trio = softSpring({ frame, fps, delay: 28 });
  const button = softSpring({ frame, fps, delay: 40 });

  const buttonGlow = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.8),
    [-1, 1],
    [0.25, 0.55],
  );

  return (
    <AbsoluteFill
      style={{
        background: colors.ink,
        color: colors.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 100,
      }}
    >
      {/* Subtle gold rule top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: colors.gold }} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 36,
          maxWidth: 1200,
        }}
      >
        <div style={{ transform: `scale(${logo})`, opacity: logo }}>
          <BrandMark size="xl" inverted showWordmark />
        </div>

        <div
          style={{
            transform: `translateY(${(1 - head) * 20}px)`,
            opacity: head,
            display: 'flex',
            gap: 36,
            fontFamily: fonts.sans,
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          {['Renommez.', 'Normalisez.', 'Exportez.'].map((word, i) => {
            const t = softSpring({ frame, fps, delay: 24 + i * 6 });
            return (
              <span
                key={word}
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 16}px)`,
                  color: i === 1 ? colors.goldSoft : colors.paper,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <p
          style={{
            opacity: trio,
            transform: `translateY(${(1 - trio) * 14}px)`,
            margin: 0,
            color: 'rgba(247, 243, 234, 0.78)',
            fontFamily: fonts.sans,
            fontSize: 22,
            maxWidth: 820,
            lineHeight: 1.55,
          }}
        >
          Importez · Composez · Contrôlez · Exportez.
          <br />
          Local-first · Free ou Team 19 €/mois · licence activée automatiquement.
        </p>

        <div
          role="presentation"
          style={{
            transform: `scale(${button})`,
            opacity: button,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '20px 38px',
            borderRadius: 999,
            background: colors.gold,
            color: colors.ink,
            fontFamily: fonts.sans,
            fontWeight: 720,
            fontSize: 24,
            letterSpacing: '0.005em',
            border: `1px solid ${colors.gold}`,
            boxShadow: `0 0 60px rgba(192, 145, 63, ${buttonGlow})`,
          }}
        >
          Essayer maintenant
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14m0 0l-5-5m5 5l-5 5"
              stroke={colors.ink}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p
          style={{
            opacity: button,
            margin: 0,
            color: 'rgba(247, 243, 234, 0.65)',
            fontFamily: fonts.mono,
            fontSize: 18,
            letterSpacing: '0.01em',
          }}
        >
          rename.bimcheck-consulting.com
        </p>
      </div>
    </AbsoluteFill>
  );
}
