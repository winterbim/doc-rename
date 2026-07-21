import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';
import { SITE_URL } from '../lib/tokens';

export function SceneCTA() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = softSpring({ frame, fps, delay: 2 });
  const head = softSpring({ frame, fps, delay: 14 });
  const button = softSpring({ frame, fps, delay: 32 });
  const glow = interpolate(Math.sin((frame / fps) * Math.PI * 1.8), [-1, 1], [0.3, 0.65]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at 70% 20%, rgba(34, 211, 238, .12), transparent 26rem),
          radial-gradient(circle at 20% 80%, rgba(99, 102, 241, .14), transparent 28rem),
          ${colors.navy}
        `,
        color: colors.inkOnDark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 28,
          maxWidth: 1100,
        }}
      >
        <div style={{ transform: `scale(${logo})`, opacity: logo }}>
          <BrandMark size="xl" inverted showWordmark={false} />
        </div>

        <h2
          style={{
            margin: 0,
            opacity: head,
            transform: `translateY(${(1 - head) * 18}px)`,
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: '-0.035em',
            lineHeight: 1.08,
            color: colors.inkOnDark,
          }}
        >
          Du lot brut au ZIP propre.
          <br />
          <span style={{ color: colors.cyan }}>Dans un même atelier local.</span>
        </h2>

        <p
          style={{
            margin: 0,
            opacity: head,
            color: colors.inkSoftOnDark,
            fontFamily: fonts.sans,
            fontSize: 22,
            maxWidth: 760,
            lineHeight: 1.5,
          }}
        >
          Free sans compte. Team 19 €/mois — licence activée automatiquement après paiement Stripe.
        </p>

        <div
          style={{
            transform: `scale(${button})`,
            opacity: button,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '18px 34px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #67E8F9, #6366F1)',
            color: '#06121F',
            fontFamily: fonts.sans,
            fontWeight: 750,
            fontSize: 22,
            boxShadow: `0 0 60px rgba(103, 232, 249, ${glow})`,
          }}
        >
          Essayer sans compte
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14m0 0l-5-5m5 5l-5 5"
              stroke="#06121F"
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
            color: colors.inkMuteOnDark,
            fontFamily: fonts.mono,
            fontSize: 18,
          }}
        >
          {SITE_URL}
        </p>
      </div>
    </AbsoluteFill>
  );
}
