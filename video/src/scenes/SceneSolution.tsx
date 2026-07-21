import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { BrandMark } from '../components/BrandMark';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic, softSpring } from '../lib/easing';

const CHIPS = ['BIM', 'Juridique', 'Finance', 'RH', 'Santé', 'Industrie', 'Immobilier'];

export function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = softSpring({ frame, fps, delay: 6 });
  const taglineOpacity = interpolate(frame, [28, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 28,
            padding: 80,
          }}
        >
          <div style={{ transform: `scale(${0.65 + 0.35 * logoScale})`, opacity: logoScale }}>
            <BrandMark size="xl" inverted showWordmark />
          </div>

          <div style={{ opacity: taglineOpacity, textAlign: 'center' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: fonts.sans,
                fontWeight: 800,
                fontSize: 48,
                letterSpacing: '-0.035em',
                color: colors.inkOnDark,
                maxWidth: 980,
                lineHeight: 1.1,
              }}
            >
              La même convention de nommage,{' '}
              <span style={{ color: colors.cyan }}>appliquée sans improviser.</span>
            </h2>
            <p
              style={{
                margin: '18px 0 0',
                color: colors.inkSoftOnDark,
                fontFamily: fonts.sans,
                fontSize: 22,
              }}
            >
              Local-first · multi-métiers · Free pour tester · Team pour l’illimité
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 960,
              marginTop: 8,
            }}
          >
            {CHIPS.map((label, i) => {
              const t = softSpring({ frame, fps, delay: 70 + i * 5 });
              return (
                <div
                  key={label}
                  style={{
                    transform: `scale(${t})`,
                    opacity: t,
                    padding: '10px 16px',
                    borderRadius: 999,
                    border: '1px solid rgba(103, 232, 249, .28)',
                    background: 'rgba(103, 232, 249, .08)',
                    color: colors.cyan,
                    fontFamily: fonts.sans,
                    fontWeight: 650,
                    fontSize: 16,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
