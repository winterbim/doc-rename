import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

const FILES = [
  { name: 'facade etage 1 FINAL v2.pdf', type: 'PDF' },
  { name: 'plan rdc copie.dwg', type: 'DWG' },
  { name: 'rapport synthese v3.docx', type: 'DOCX' },
  { name: 'maquette structure ifc export.ifc', type: 'IFC' },
  { name: 'bordereau diffusion revA.csv', type: 'CSV' },
];

export function SceneImport() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shell = softSpring({ frame, fps, delay: 4 });
  const dropPulse = interpolate(Math.sin(frame / 8), [-1, 1], [0.92, 1]);

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 48,
          }}
        >
          <div
            style={{
              width: 1480,
              height: 820,
              opacity: shell,
              transform: `scale(${0.94 + 0.06 * shell}) translateY(${(1 - shell) * 24}px)`,
            }}
          >
            <AppFrame width="100%" height="100%">
              <div
                style={{
                  border: `2px dashed ${colors.cyanDeep}`,
                  borderRadius: 14,
                  background: `linear-gradient(180deg, ${colors.primarySoft}, ${colors.surface})`,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transform: `scale(${dropPulse})`,
                  boxShadow: 'inset 0 0 0 1px rgba(103,232,249,.15)',
                }}
              >
                <div style={{ fontSize: 36 }}>⬇</div>
                <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 22, color: colors.ink }}>
                  Déposez fichiers ou ZIP
                </div>
                <div style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.inkMute }}>
                  PDF · DOCX · DWG · IFC · RVT · images · archives — 100 % local
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {FILES.map((file, i) => {
                  const t = softSpring({ frame, fps, delay: 40 + i * 8 });
                  return (
                    <div
                      key={file.name}
                      style={{
                        opacity: t,
                        transform: `translateX(${(1 - t) * 40}px)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: `1px solid ${colors.border}`,
                        background: colors.surface,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          color: colors.primary,
                          background: colors.primarySoft,
                          borderRadius: 6,
                          padding: '4px 8px',
                          minWidth: 48,
                          textAlign: 'center',
                        }}
                      >
                        {file.type}
                      </span>
                      <span
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 16,
                          color: colors.inkSoft,
                          flex: 1,
                        }}
                      >
                        {file.name}
                      </span>
                      <span style={{ color: colors.ok, fontWeight: 700, fontSize: 14 }}>importé</span>
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
