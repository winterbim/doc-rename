import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { BrandMark } from '../components/BrandMark';
import { Chip } from '../components/Chip';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic, softSpring } from '../lib/easing';

/**
 * Scene 2 — Solution / Brand reveal (10–20 s).
 * Logo grows in, tagline below, profile chips bloom.
 */
export function SceneSolution() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = softSpring({ frame, fps, delay: 6 });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const taglineY = interpolate(frame, [30, 50], [22, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const chipsOpacity = interpolate(frame, [80, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
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
            gap: 36,
            padding: 80,
          }}
        >
          <div style={{ transform: `scale(${0.6 + 0.4 * logoScale})`, opacity: logoScale }}>
            <BrandMark size="xl" />
          </div>
          <div
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${taglineY}px)`,
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: fonts.sans,
                color: colors.inkSoft,
                fontSize: 30,
                fontWeight: 500,
                letterSpacing: '-0.005em',
              }}
            >
              Renommage documentaire{' '}
              <em
                style={{
                  fontFamily: fonts.serif,
                  fontStyle: 'italic',
                  color: colors.brick,
                  fontWeight: 460,
                }}
              >
                professionnel
              </em>
              .
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: fonts.sans,
                color: colors.muted,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              Multi-métiers · Local-first · Convention claire
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 920,
              opacity: chipsOpacity,
            }}
          >
            {['BIM', 'Finance', 'RH', 'Juridique', 'Santé', 'Industrie', 'Immobilier', 'Convention maison'].map(
              (label, i) => {
                const t = softSpring({ frame, fps, delay: 80 + i * 4 });
                return (
                  <div key={label} style={{ transform: `scale(${t})`, opacity: t }}>
                    <Chip label={label} />
                  </div>
                );
              },
            )}
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
