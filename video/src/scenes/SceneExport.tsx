import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { FileRow } from '../components/FileRow';
import { Cursor } from '../components/Cursor';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic, liftIn, softSpring } from '../lib/easing';

const RENAMED = [
  'CLIENT_2026_05_FACTURE_REF.PDF',
  'CLIENT_2026_05_PAIEMENT_OK.PDF',
  'CLIENT_2026_05_RAPPORT_REF.PDF',
  'CLIENT_2026_05_ANNEXE_REF.PDF',
];

/**
 * Scene 7 — Export ZIP (72–82 s).
 * User types a ZIP name, clicks "Télécharger tout", file lands in the dock.
 */
export function SceneExport() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = liftIn({ frame, start: 4 });

  const typedName = useTypedName('LIVRABLES_CLIENT_MAI_2026', { from: 30, to: 100 });

  const buttonScale = softSpring({ frame, fps, delay: 130 });
  const clickFrame = 150;
  const zipOpacity = interpolate(frame, [clickFrame, clickFrame + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const zipY = interpolate(frame, [clickFrame, clickFrame + 30], [-40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '60px 100px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              opacity: head.opacity,
              transform: `translateY(${head.translateY}px)`,
              fontFamily: fonts.sans,
              fontSize: 22,
              fontWeight: 700,
              color: colors.inkSoft,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Étape 3 · Exporter en ZIP
          </div>

          <AppFrame url="doc-rename.com/app" width="100%" height="80%">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>
              {/* Renamed file list */}
              <div
                style={{
                  border: `1px solid ${colors.line}`,
                  borderRadius: 10,
                  background: '#FFFAF0',
                  padding: 16,
                  flex: 1,
                  overflow: 'hidden',
                }}
              >
                {RENAMED.map((name, i) => (
                  <FileRow
                    key={name}
                    name={name}
                    kind="new"
                    appearAt={i * 6}
                    status="RENOMMÉ"
                  />
                ))}
              </div>

              {/* Export bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 10,
                  background: '#FFF',
                }}
              >
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: colors.muted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Nom ZIP
                </span>
                <div
                  style={{
                    flex: 1,
                    background: colors.paper,
                    border: `1px solid ${colors.lineStrong}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontFamily: fonts.mono,
                    fontSize: 22,
                    color: colors.ink,
                    fontWeight: 700,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {typedName}
                  <span
                    style={{
                      opacity:
                        Math.floor(frame / (fps / 2)) % 2 === 0 && frame < 110 ? 1 : 0,
                      color: colors.ink,
                    }}
                  >
                    |
                  </span>
                </div>
                <button
                  type="button"
                  style={{
                    transform: `scale(${0.95 + buttonScale * 0.05})`,
                    padding: '14px 24px',
                    background: colors.ink,
                    color: colors.paper,
                    border: `1px solid ${colors.ink}`,
                    borderRadius: 999,
                    fontFamily: fonts.sans,
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: '0.01em',
                    cursor: 'pointer',
                  }}
                >
                  Télécharger tout (ZIP)
                </button>
              </div>
            </div>
          </AppFrame>

          {/* Cursor moves toward the button + clicks */}
          <Cursor
            from={{ x: 900, y: 540 }}
            to={{ x: 1620, y: 700 }}
            start={110}
            end={145}
            click={clickFrame}
          />

          {/* Downloaded ZIP file appearing at the bottom-right */}
          <div
            style={{
              position: 'absolute',
              right: 110,
              bottom: 40,
              padding: '14px 22px',
              background: colors.ink,
              color: colors.paper,
              borderRadius: 12,
              boxShadow: '0 20px 40px -22px rgba(36, 31, 25, 0.6)',
              opacity: zipOpacity,
              transform: `translateY(${zipY}px)`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: fonts.mono,
            }}
          >
            <span
              style={{
                background: colors.gold,
                color: colors.ink,
                fontFamily: fonts.sans,
                fontWeight: 700,
                fontSize: 14,
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              ZIP
            </span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{typedName}.zip</span>
            <span style={{ fontSize: 14, color: colors.goldSoft, fontWeight: 600 }}>↓ téléchargé</span>
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}

/** Reveal `target` character-by-character between frames `from` and `to`. */
function useTypedName(target: string, range: { from: number; to: number }): string {
  const frame = useCurrentFrame();
  const ratio = interpolate(frame, [range.from, range.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const count = Math.round(ratio * target.length);
  return target.slice(0, count);
}
