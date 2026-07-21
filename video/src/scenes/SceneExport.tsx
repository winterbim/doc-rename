import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

const TREE = [
  'FICHIERS_RENOMMES/',
  '├── MUSEE_BAT01_ARC_PLAN_AGC_001_P02.pdf',
  '├── MUSEE_BAT01_ARC_PLAN_AGC_002_P01.dwg',
  '├── MUSEE_BAT01_ARC_RAP_AGC_001_P03.docx',
  '└── MUSEE_BAT01_STR_MOD_BET_001_P01.ifc',
];

export function SceneExport() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shell = softSpring({ frame, fps, delay: 2 });
  const progress = interpolate(frame, [30, 120], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const done = progress >= 99;

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ width: 1480, height: 820, opacity: shell, transform: `scale(${0.95 + 0.05 * shell})` }}>
            <AppFrame width="100%" height="100%">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 750, fontSize: 22, color: colors.ink }}>Export ZIP</div>
                  <div style={{ fontSize: 15, color: colors.inkSoft, marginTop: 4 }}>
                    Arborescence intacte · prêt CDE / GED / client
                  </div>
                </div>
                <div
                  style={{
                    padding: '12px 20px',
                    borderRadius: 10,
                    background: done
                      ? 'linear-gradient(135deg, #67E8F9, #6366F1)'
                      : colors.primary,
                    color: done ? '#06121F' : '#fff',
                    fontWeight: 750,
                    fontSize: 15,
                    boxShadow: done ? '0 12px 32px -14px rgba(34,211,238,.65)' : undefined,
                  }}
                >
                  {done ? '✓ FICHIERS_RENOMMES.ZIP' : 'Télécharger tout (ZIP)'}
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  height: 12,
                  borderRadius: 999,
                  background: colors.surface2,
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #67E8F9, #6366F1)',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: 20,
                  borderRadius: 14,
                  background: colors.navy,
                  fontFamily: fonts.mono,
                  fontSize: 18,
                  lineHeight: 1.55,
                  color: colors.inkOnDark,
                }}
              >
                {TREE.map((line, i) => {
                  const t = softSpring({ frame, fps, delay: 40 + i * 8 });
                  return (
                    <div
                      key={line}
                      style={{
                        opacity: t,
                        color: i === 0 ? colors.cyan : colors.inkSoftOnDark,
                        fontWeight: i === 0 ? 700 : 500,
                      }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

            </AppFrame>
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
