import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { AppFrame } from '../components/AppFrame';
import { FileRow } from '../components/FileRow';
import { Cursor } from '../components/Cursor';
import { colors, fonts } from '../lib/tokens';
import { easeOutCubic } from '../lib/easing';

const INCOMING = [
  { name: 'CONTRAT_CLIENT_BRUT.pdf', status: 'PRÊT' },
  { name: 'RAPPORT_AUDIT.docx', status: 'PRÊT' },
  { name: 'TABLEAU_HONORAIRES.xlsx', status: 'PRÊT' },
  { name: 'PLAN_NIVEAU_2.dwg', status: 'PRÊT' },
  { name: 'SCAN_FACADE.pdf', status: 'PRÊT' },
  { name: 'LIVRABLES_LOT_3.zip', status: 'EXTRAIT' },
];

/**
 * Scene 3 — Import (20–32 s).
 * Drop-zone hover state → files cascading into the list.
 */
export function SceneImport() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Drop-zone "hot" indicator pulse
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.4),
    [-1, 1],
    [0.35, 1],
  );

  const headerOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic });
  const dropZoneOpacity = interpolate(frame, [40, 70], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Cursor sweeps from top-left to drop zone, "drops"
  const cursorStart = 12;
  const cursorEnd = 56;

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '60px 100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div
              style={{
                opacity: headerOpacity,
                marginBottom: 22,
                fontFamily: fonts.sans,
                fontSize: 22,
                fontWeight: 700,
                color: colors.inkSoft,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Étape 1 · Importer vos fichiers
            </div>
            <AppFrame
              url="doc-rename.com/app"
              width="100%"
              height="84%"
            >
              {/* Drop zone */}
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  border: `2px dashed ${colors.lineStrong}`,
                  borderRadius: 12,
                  background: colors.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 16,
                  opacity: dropZoneOpacity,
                  boxShadow: `inset 0 0 0 4px rgba(192, 145, 63, ${0.18 * pulse})`,
                }}
              >
                <svg width={88} height={88} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
                    stroke={colors.brick}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 30,
                    fontWeight: 600,
                    color: colors.ink,
                    letterSpacing: '-0.015em',
                  }}
                >
                  Glissez vos fichiers ici
                </div>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 17,
                    color: colors.muted,
                  }}
                >
                  PDF · DOCX · XLSX · DWG · ZIP · images — jusqu’à plusieurs centaines
                </div>
              </div>

              {/* File list that fades in over the drop-zone */}
              <div
                style={{
                  position: 'absolute',
                  inset: 28,
                  top: 28,
                  borderRadius: 12,
                  background: '#FFFAF0',
                  border: `1px solid ${colors.line}`,
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  opacity: interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: colors.muted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    padding: '4px 6px 12px',
                    borderBottom: `1px solid ${colors.line}`,
                  }}
                >
                  <span>{INCOMING.length} fichiers détectés</span>
                  <span style={{ color: colors.moss }}>Local · navigateur</span>
                </div>
                {INCOMING.map((f, i) => (
                  <FileRow
                    key={f.name}
                    name={f.name}
                    appearAt={70 + i * 6}
                    status={f.status}
                  />
                ))}
              </div>
            </AppFrame>

            <Cursor
              from={{ x: 240, y: 80 }}
              to={{ x: 880, y: 480 }}
              start={cursorStart}
              end={cursorEnd}
              click={cursorEnd + 1}
            />
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
