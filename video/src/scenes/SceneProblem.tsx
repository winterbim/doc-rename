import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic, softSpring } from '../lib/easing';

const MESSY = [
  'acte cession final v2.pdf',
  'piece 3 signee.pdf',
  'CR reunion 0507.docx',
  'plan rdc copie.dwg',
  'rapport - client A FINAL.pdf',
  'maquette structure ifc export.ifc',
];

export function SceneProblem() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = softSpring({ frame, fps, delay: 4 });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 120px',
            gap: 40,
          }}
        >
          <div style={{ opacity: titleIn, transform: `translateY(${(1 - titleIn) * 24}px)` }}>
            <p
              style={{
                margin: 0,
                color: colors.cyan,
                fontFamily: fonts.sans,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Le vrai problème
            </p>
            <h1
              style={{
                margin: '14px 0 0',
                fontFamily: fonts.sans,
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                color: colors.inkOnDark,
                maxWidth: 900,
              }}
            >
              Chacun renomme{' '}
              <span style={{ color: colors.cyan }}>à sa façon.</span>
            </h1>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              maxWidth: 1100,
            }}
          >
            {MESSY.map((name, i) => {
              const t = softSpring({ frame, fps, delay: 18 + i * 6 });
              const shake = interpolate(
                Math.sin((frame + i * 9) / 7),
                [-1, 1],
                [-1.5, 1.5],
              );
              return (
                <div
                  key={name}
                  style={{
                    opacity: t,
                    transform: `translateY(${(1 - t) * 18}px) translateX(${shake}px)`,
                    background: colors.navy2,
                    border: '1px solid rgba(148,163,184,.16)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    fontFamily: fonts.mono,
                    fontSize: 20,
                    color: '#FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <span style={{ color: colors.danger, fontWeight: 700 }}>✗</span>
                  {name}
                </div>
              );
            })}
          </div>

          <p
            style={{
              margin: 0,
              opacity: interpolate(frame, [90, 120], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: easeOutCubic,
              }),
              color: colors.inkSoftOnDark,
              fontFamily: fonts.sans,
              fontSize: 22,
              maxWidth: 720,
            }}
          >
            Temps perdu, erreurs avant dépôt, image désordonnée auprès des clients.
          </p>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
