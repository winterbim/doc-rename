import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { Chip } from '../components/Chip';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic, softSpring } from '../lib/easing';

const AVAILABLE_FIELDS = [
  'Projet',
  'Bâtiment',
  'Lot',
  'Type de document',
  'Entreprise',
  'Séquence',
  'Révision',
  'Statut',
  'Date',
];

/** Frame at which each field "snaps" into the active row, in scene-local frames. */
const ACTIVE_TIMELINE: { field: string; at: number }[] = [
  { field: 'Projet', at: 30 },
  { field: 'Bâtiment', at: 60 },
  { field: 'Lot', at: 90 },
  { field: 'Type de document', at: 120 },
  { field: 'Entreprise', at: 150 },
  { field: 'Séquence', at: 180 },
  { field: 'Révision', at: 210 },
];

const SEPARATORS = ['_', '-', '.'];

/**
 * Scene 4 — Nomenclature builder (32–48 s).
 * Show available fields on the left, drag/snap them into the active sequence,
 * and update a live preview filename in real time.
 */
export function SceneNomenclature() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerA = softSpring({ frame, fps, delay: 4 });

  // Build the active list — each field is "active" once frame ≥ its at.
  const activeNow = ACTIVE_TIMELINE.filter((f) => frame >= f.at);
  // Build preview string
  const previewParts = activeNow.map((f) => mockValue(f.field));
  const preview = previewParts.length > 0 ? previewParts.join('_') + '.PDF' : 'PROJET_PLAN_PDF';

  // Cursor pulse on the preview when a new field arrives
  const lastFieldAt = activeNow.at(-1)?.at ?? 0;
  const pulse = interpolate(frame, [lastFieldAt, lastFieldAt + 10, lastFieldAt + 22], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '60px 100px' }}>
          <div
            style={{
              opacity: headerA,
              transform: `translateY(${(1 - headerA) * 16}px)`,
              marginBottom: 22,
              fontFamily: fonts.sans,
              fontSize: 22,
              fontWeight: 700,
              color: colors.inkSoft,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Étape 2 · Construire la convention
          </div>
          <AppFrame
            url="doc-rename.com/app"
            width="100%"
            height="86%"
            leftPane={
              <>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: colors.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                  }}
                >
                  Champs disponibles
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {AVAILABLE_FIELDS.map((field, i) => {
                    const isActive = activeNow.some((a) => a.field === field);
                    const t = softSpring({ frame, fps, delay: 10 + i * 4 });
                    return (
                      <div
                        key={field}
                        style={{
                          opacity: t * (isActive ? 0.35 : 1),
                          transform: `translateX(${(1 - t) * -12}px)`,
                          padding: '10px 14px',
                          border: `1px solid ${colors.line}`,
                          borderRadius: 8,
                          fontFamily: fonts.sans,
                          fontSize: 16,
                          fontWeight: 600,
                          color: isActive ? colors.muted : colors.ink,
                          background: isActive ? colors.paperSoft : '#FFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          textDecoration: isActive ? 'line-through' : 'none',
                          textDecorationColor: colors.moss,
                        }}
                      >
                        <span>{field}</span>
                        <span style={{ color: colors.muted, fontSize: 14 }}>⋮⋮</span>
                      </div>
                    );
                  })}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 8,
                    background: colors.paperSoft,
                    border: `1px solid ${colors.line}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      color: colors.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Séparateur
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {SEPARATORS.map((sep) => (
                      <div
                        key={sep}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: sep === '_' ? colors.ink : '#FFF',
                          color: sep === '_' ? colors.paper : colors.ink,
                          border: `1px solid ${sep === '_' ? colors.ink : colors.lineStrong}`,
                          fontFamily: fonts.mono,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {sep}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
              <div>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: colors.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    marginBottom: 14,
                  }}
                >
                  Convention active (glisser pour réordonner)
                </div>
                <div
                  style={{
                    minHeight: 76,
                    border: `1.5px dashed ${activeNow.length === 0 ? colors.lineStrong : colors.moss}`,
                    borderRadius: 10,
                    background: '#FFFAF0',
                    padding: 14,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {activeNow.length === 0 && (
                    <span style={{ color: colors.muted, fontStyle: 'italic', fontFamily: fonts.sans, fontSize: 16 }}>
                      Aucun champ — déposez ici.
                    </span>
                  )}
                  {activeNow.map((f, i) => {
                    const local = frame - f.at;
                    const opacity = interpolate(local, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                    const dy = interpolate(local, [0, 14], [-12, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic });
                    return (
                      <React.Fragment key={f.field}>
                        {i > 0 && (
                          <span style={{ color: colors.muted, fontFamily: fonts.mono, opacity }}>_</span>
                        )}
                        <div style={{ opacity, transform: `translateY(${dy}px)` }}>
                          <Chip label={f.field} active tone="brick" />
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: colors.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Aperçu en direct
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${colors.line}`,
                    background: '#FFF',
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 28,
                      color: colors.ink,
                      fontWeight: 700,
                      letterSpacing: '-0.005em',
                      filter: `drop-shadow(0 0 ${4 * pulse}px rgba(192, 145, 63, ${0.5 * pulse}))`,
                    }}
                  >
                    {preview}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontFamily: fonts.sans,
                      color: colors.muted,
                      fontSize: 14,
                    }}
                  >
                    Majuscules · accents supprimés · séparateur « _ »
                  </div>
                </div>
              </div>
            </div>
          </AppFrame>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}

function mockValue(field: string): string {
  switch (field) {
    case 'Projet':
      return 'PROJET';
    case 'Bâtiment':
      return 'BAT';
    case 'Lot':
      return 'CVC';
    case 'Type de document':
      return 'PLAN';
    case 'Entreprise':
      return 'ENT';
    case 'Séquence':
      return '001';
    case 'Révision':
      return 'B';
    case 'Statut':
      return 'BPE';
    case 'Date':
      return '20260520';
    default:
      return field.toUpperCase();
  }
}
