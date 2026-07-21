import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

const PROFILES = [
  { id: 'BIM', active: true },
  { id: 'Juridique', active: false },
  { id: 'Finance', active: false },
  { id: 'RH', active: false },
  { id: 'Santé', active: false },
];

const FIELDS = [
  { label: 'Projet', value: 'MUSEE', active: true },
  { label: 'Bâtiment', value: 'BAT01', active: true },
  { label: 'Lot', value: 'ARC', active: true },
  { label: 'Type', value: 'PLAN', active: true },
  { label: 'Émetteur', value: 'AGC', active: true },
  { label: 'Révision', value: 'P02', active: false },
];

export function SceneNomenclature() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shell = softSpring({ frame, fps, delay: 2 });

  const preview = FIELDS.filter((f) => f.active)
    .map((f) => f.value)
    .join('_');

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
              leftPane={
                <>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: colors.inkMute,
                        marginBottom: 10,
                      }}
                    >
                      Profil métier
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {PROFILES.map((p, i) => {
                        const t = softSpring({ frame, fps, delay: 12 + i * 4 });
                        return (
                          <div
                            key={p.id}
                            style={{
                              opacity: t,
                              padding: '8px 12px',
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 650,
                              border: p.active
                                ? `1px solid ${colors.cyanDeep}`
                                : `1px solid ${colors.border}`,
                              background: p.active ? colors.primarySoft : colors.surface2,
                              color: p.active ? colors.primary : colors.inkSoft,
                            }}
                          >
                            {p.id}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: colors.inkMute,
                        marginBottom: 10,
                      }}
                    >
                      Champs actifs
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {FIELDS.map((field, i) => {
                        const t = softSpring({ frame, fps, delay: 30 + i * 6 });
                        return (
                          <div
                            key={field.label}
                            style={{
                              opacity: t,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `1px solid ${colors.border}`,
                              background: field.active ? colors.surface : colors.surface2,
                            }}
                          >
                            <span style={{ fontSize: 13, color: colors.inkMute, fontWeight: 600 }}>
                              {field.label}
                            </span>
                            <span
                              style={{
                                fontFamily: fonts.mono,
                                fontSize: 14,
                                fontWeight: 700,
                                color: field.active ? colors.ink : colors.inkMute,
                              }}
                            >
                              {field.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      padding: 12,
                      borderRadius: 10,
                      background: colors.navy,
                      color: colors.inkOnDark,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.inkMuteOnDark, marginBottom: 6 }}>
                      Aperçu live
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.cyan, fontWeight: 600 }}>
                      {preview}_….pdf
                    </div>
                  </div>
                </>
              }
            >
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontWeight: 700,
                  fontSize: 22,
                  color: colors.ink,
                  marginBottom: 6,
                }}
              >
                Composez votre convention
              </div>
              <p style={{ margin: 0, color: colors.inkSoft, fontSize: 16, lineHeight: 1.5 }}>
                Templates métier prêts à l’emploi. Importez entreprises / lots en CSV ou Excel.
                Séparateur, ordre des champs, abréviations — tout est ajustable avant renommage.
              </p>

              <div
                style={{
                  marginTop: 18,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                {['ISO 19650 (UK NA)', 'SIA 2051', 'Convention maison', 'Import CSV entités'].map(
                  (card, i) => {
                    const t = softSpring({ frame, fps, delay: 50 + i * 8 });
                    return (
                      <div
                        key={card}
                        style={{
                          opacity: t,
                          transform: `translateY(${(1 - t) * 16}px)`,
                          padding: 16,
                          borderRadius: 12,
                          border: `1px solid ${colors.border}`,
                          background: colors.surface,
                          fontWeight: 650,
                          fontSize: 16,
                          color: colors.ink,
                        }}
                      >
                        {card}
                      </div>
                    );
                  },
                )}
              </div>
            </AppFrame>
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
