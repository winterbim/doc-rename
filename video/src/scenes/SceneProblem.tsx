import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { Panel, SubPanel } from '../components/Panel';
import { FileRow } from '../components/FileRow';
import { colors, fonts } from '../lib/tokens';
import { liftIn } from '../lib/easing';

const MESSY_FILES = [
  'plan final.pdf',
  'copie rapport.docx',
  'scan client 2.pdf',
  'facade été.dwg',
  'DOE_v3_final.zip',
  'IMG_2049 - Copy (3).jpg',
  'sans titre 4.xlsx',
];

/**
 * Scene 1 — Problème (0–10 s).
 * Messy desktop pile of badly named files.
 */
export function SceneProblem() {
  const frame = useCurrentFrame();
  const headline = liftIn({ frame, start: 6 });
  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '90px 110px', display: 'flex', flexDirection: 'row', gap: 80, alignItems: 'center' }}>
          <div style={{ flex: 1, opacity: headline.opacity, transform: `translateY(${headline.translateY}px)` }}>
            <span
              style={{
                fontFamily: fonts.sans,
                color: colors.brick,
                fontSize: 18,
                fontWeight: 720,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Le problème
            </span>
            <h1
              style={{
                margin: '14px 0 0',
                fontFamily: fonts.sans,
                color: colors.ink,
                fontSize: 86,
                fontWeight: 540,
                lineHeight: 0.95,
                letterSpacing: '-0.045em',
                maxWidth: 720,
              }}
            >
              Des fichiers mal nommés{' '}
              <em
                style={{
                  fontFamily: fonts.serif,
                  fontStyle: 'italic',
                  color: colors.brick,
                  fontWeight: 460,
                }}
              >
                ralentissent vos projets.
              </em>
            </h1>
            <p
              style={{
                marginTop: 24,
                maxWidth: 620,
                fontFamily: fonts.sans,
                color: colors.inkSoft,
                fontSize: 22,
                lineHeight: 1.5,
              }}
            >
              Perte de temps, doublons, livrables difficiles à contrôler.
            </p>
          </div>
          <div style={{ flexBasis: 700, flexShrink: 0, position: 'relative' }}>
            <Panel traffic style={{ height: 540 }}>
              <SubPanel title="Mes documents — désordre">
                {MESSY_FILES.map((name, i) => {
                  // Deterministic pseudo-random tilt per row (no Math.random — would jitter each frame).
                  const tiltMag = (i * 37) % 100 < 50 ? 0.4 : 0.8;
                  const rotation = (i % 2 === 0 ? -1 : 1) * tiltMag;
                  const a = liftIn({ frame, start: 10 + i * 6, duration: 14, distance: 22 });
                  return (
                    <div
                      key={name}
                      style={{
                        transform: `translateY(${a.translateY}px) rotate(${rotation * a.opacity}deg)`,
                        opacity: a.opacity,
                      }}
                    >
                      <FileRow name={name} kind="old" />
                    </div>
                  );
                })}
              </SubPanel>
            </Panel>
            {/* Subtle "X" mark on the pile to show frustration */}
            <div
              style={{
                position: 'absolute',
                top: 38,
                right: -28,
                width: 96,
                height: 96,
                borderRadius: 999,
                background: colors.brick,
                color: '#FFF',
                display: 'grid',
                placeItems: 'center',
                fontFamily: fonts.serif,
                fontStyle: 'italic',
                fontSize: 64,
                fontWeight: 700,
                boxShadow: '0 18px 42px -22px rgba(165, 72, 53, 0.7)',
                transform: `scale(${interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
              }}
            >
              ?
            </div>
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
