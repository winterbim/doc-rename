import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

/** Real-style before/after rows — product rename step. */
const ROWS = [
  {
    before: 'facade etage 1 FINAL v2.pdf',
    after: 'MUSEE_BAT01_ARC_PLAN_AGC_001_P02.pdf',
  },
  {
    before: 'plan rdc copie.dwg',
    after: 'MUSEE_BAT01_ARC_PLAN_AGC_002_P01.dwg',
  },
  {
    before: 'rapport synthese v3.docx',
    after: 'MUSEE_BAT01_ARC_RAP_AGC_001_P03.docx',
  },
  {
    before: 'maquette structure ifc export.ifc',
    after: 'MUSEE_BAT01_STR_MOD_BET_001_P01.ifc',
  },
];

export function SceneBIM() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shell = softSpring({ frame, fps, delay: 2 });
  const renamed = frame > 90;

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div
            style={{
              width: 1480,
              height: 820,
              opacity: shell,
              transform: `scale(${0.95 + 0.05 * shell})`,
            }}
          >
            <AppFrame
              width="100%"
              height="100%"
              footer={
                <div
                  style={{
                    borderTop: `1px solid ${colors.border}`,
                    background: colors.surface,
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 13, color: colors.inkSoft }}>
                    Free · 4 / 5 lots aujourd’hui
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div
                      style={{
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: `1px solid ${colors.border}`,
                        fontWeight: 650,
                        fontSize: 14,
                        color: colors.ink,
                        background: colors.surface2,
                      }}
                    >
                      Aperçu
                    </div>
                    <div
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        background: renamed
                          ? 'linear-gradient(135deg, #67E8F9, #6366F1)'
                          : colors.primary,
                        color: renamed ? '#06121F' : '#fff',
                        fontWeight: 750,
                        fontSize: 14,
                        boxShadow: renamed ? '0 10px 28px -12px rgba(34,211,238,.6)' : undefined,
                        transform: `scale(${renamed ? 1.02 : 1})`,
                      }}
                    >
                      Renommer tout
                    </div>
                  </div>
                </div>
              }
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: colors.ink }}>
                  Fichiers · Avant / Après
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 650,
                    color: renamed ? colors.ok : colors.inkMute,
                    background: renamed ? '#ECFDF5' : colors.surface2,
                    borderRadius: 999,
                    padding: '6px 12px',
                  }}
                >
                  {renamed ? '4 renommés' : '4 en attente'}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 40px 1fr',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.inkMute,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginTop: 8,
                }}
              >
                <div>Avant</div>
                <div />
                <div>Après</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROWS.map((row, i) => {
                  const t = softSpring({ frame, fps, delay: 20 + i * 10 });
                  const flip = interpolate(frame, [80 + i * 8, 100 + i * 8], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  });
                  return (
                    <div
                      key={row.before}
                      style={{
                        opacity: t,
                        display: 'grid',
                        gridTemplateColumns: '1fr 40px 1fr',
                        gap: 8,
                        alignItems: 'center',
                        padding: '12px 12px',
                        borderRadius: 10,
                        border: `1px solid ${colors.border}`,
                        background: colors.surface,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 14,
                          color: flip > 0.5 ? colors.inkMute : '#B91C1C',
                          textDecoration: flip > 0.5 ? 'line-through' : 'none',
                        }}
                      >
                        {row.before}
                      </div>
                      <div style={{ textAlign: 'center', color: colors.cyanDeep, fontWeight: 800 }}>→</div>
                      <div
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 14,
                          fontWeight: 650,
                          color: flip > 0.4 ? colors.ok : colors.inkMute,
                        }}
                      >
                        {flip > 0.4 ? row.after : '…'}
                      </div>
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
