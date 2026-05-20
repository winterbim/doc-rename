import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { colors, fonts, radii, shadows } from '../lib/tokens';
import { easeOutCubic, softSpring } from '../lib/easing';

/**
 * Scene 8 — Privacy (82–90 s).
 * Two-node diagram:  [Browser (Mon poste)]  →  [Export ZIP local]
 * A crossed-out "Serveur" sits BEHIND with low opacity, making it obvious
 * that the files do NOT travel to a backend.
 */
export function ScenePrivacy() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const browser = softSpring({ frame, fps, delay: 4 });
  const lock = softSpring({ frame, fps, delay: 24 });
  const arrow = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic });
  const zip = softSpring({ frame, fps, delay: 60 });
  const crossOut = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill
          style={{
            padding: '70px 100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 60,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: fonts.sans,
              fontSize: 76,
              fontWeight: 540,
              letterSpacing: '-0.045em',
              color: colors.ink,
              textAlign: 'center',
              maxWidth: 1100,
              lineHeight: 0.98,
            }}
          >
            Vos fichiers restent dans{' '}
            <em style={{ fontFamily: fonts.serif, fontStyle: 'italic', color: colors.brick, fontWeight: 460 }}>
              votre navigateur.
            </em>
          </h1>

          <div
            style={{
              width: '100%',
              maxWidth: 1480,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 36,
            }}
          >
            {/* Left node: Browser */}
            <div
              style={{
                transform: `scale(${browser})`,
                opacity: browser,
                width: 360,
                background: '#FFF',
                border: `1px solid ${colors.lineStrong}`,
                borderRadius: radii.lg,
                padding: 22,
                boxShadow: shadows.cardSoft,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: colors.brick }} />
                <span style={{ width: 10, height: 10, borderRadius: 999, background: colors.gold }} />
                <span style={{ width: 10, height: 10, borderRadius: 999, background: colors.moss }} />
              </div>
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: colors.muted,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                Votre poste
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: fonts.sans,
                  fontSize: 24,
                  fontWeight: 700,
                  color: colors.ink,
                  letterSpacing: '-0.015em',
                }}
              >
                Navigateur
              </div>
              <div
                style={{
                  marginTop: 14,
                  fontFamily: fonts.mono,
                  fontSize: 14,
                  color: colors.inkSoft,
                  lineHeight: 1.6,
                }}
              >
                contrat.pdf
                <br />
                rapport.docx
                <br />
                facture.xlsx
              </div>
              {/* lock badge */}
              <div
                style={{
                  position: 'absolute',
                  top: -22,
                  right: -22,
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: colors.moss,
                  color: '#FFF',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 28,
                  boxShadow: shadows.cardSoft,
                  transform: `scale(${lock})`,
                }}
              >
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 10V8a6 6 0 1112 0v2m-12 0h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z"
                    stroke="#FFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="100%" height={6} viewBox="0 0 600 6" preserveAspectRatio="none">
                <line
                  x1={0}
                  y1={3}
                  x2={600 * arrow}
                  y2={3}
                  stroke={colors.moss}
                  strokeWidth={3}
                  strokeDasharray="10 6"
                />
              </svg>
              <span
                style={{
                  position: 'absolute',
                  background: colors.paper,
                  padding: '4px 12px',
                  border: `1px solid ${colors.lineStrong}`,
                  borderRadius: 999,
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  color: colors.moss,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: arrow,
                }}
              >
                traitement local
              </span>
            </div>

            {/* Right node: ZIP */}
            <div
              style={{
                transform: `scale(${zip})`,
                opacity: zip,
                width: 280,
                background: colors.ink,
                color: colors.paper,
                borderRadius: radii.lg,
                padding: 26,
                boxShadow: shadows.card,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  background: colors.gold,
                  color: colors.ink,
                  fontFamily: fonts.sans,
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                ZIP
              </span>
              <span style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: 22, letterSpacing: '-0.015em' }}>
                LIVRABLES_2026.zip
              </span>
              <span style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.goldSoft }}>
                téléchargé sur votre poste
              </span>
            </div>
          </div>

          {/* Behind/below: the "server" path is crossed out */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              padding: '14px 26px',
              borderRadius: 999,
              background: '#FFFAF0',
              border: `1px solid ${colors.lineStrong}`,
              opacity: 0.95,
              position: 'relative',
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="6" rx="1.5" stroke={colors.muted} strokeWidth={1.5} />
              <rect x="3" y="14" width="18" height="6" rx="1.5" stroke={colors.muted} strokeWidth={1.5} />
              <circle cx="7" cy="7" r="1" fill={colors.muted} />
              <circle cx="7" cy="17" r="1" fill={colors.muted} />
            </svg>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 18,
                color: colors.muted,
                fontWeight: 600,
              }}
            >
              Aucun contenu document envoyé au serveur
            </span>
            {/* Cross-out animation */}
            <span
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                top: '50%',
                height: 3,
                background: colors.brick,
                borderRadius: 2,
                transformOrigin: 'left center',
                transform: `scaleX(${crossOut})`,
              }}
            />
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
