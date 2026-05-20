import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { Panel } from '../components/Panel';
import { FileRow } from '../components/FileRow';
import { colors, fonts } from '../lib/tokens';
import { liftIn } from '../lib/easing';

type Vertical = {
  kicker: string;
  title: string;
  rows: string[];
};

const VERTICALS: Vertical[] = [
  {
    kicker: 'Finance',
    title: 'Factures, clôtures, audits',
    rows: [
      'CLIENT_2026_05_FACTURE_REF.PDF',
      'CLIENT_2026_05_PAIEMENT_OK.PDF',
      'AUDIT_2026_T1_RAPPORT.XLSX',
    ],
  },
  {
    kicker: 'RH',
    title: 'Contrats, paie, dossiers',
    rows: [
      'COLLABORATEUR_2026_CONTRAT_SIGNE.PDF',
      'COLLABORATEUR_2026_PAIE_04.PDF',
      'COLLABORATEUR_2026_AVENANT_V02.DOCX',
    ],
  },
  {
    kicker: 'Juridique',
    title: 'Dossiers, versions, pièces',
    rows: [
      'DOSSIER_CONTRAT_20260520_V01.PDF',
      'DOSSIER_ANNEXE_20260520_V01.PDF',
      'DOSSIER_PIECES_20260520_V02.PDF',
    ],
  },
];

/**
 * Scene 6 — Other verticals (60–72 s).
 * Three small panels with sample naming for Finance / RH / Juridique.
 */
export function SceneOthers() {
  const frame = useCurrentFrame();
  const head = liftIn({ frame, start: 6 });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '70px 90px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              opacity: head.opacity,
              transform: `translateY(${head.translateY}px)`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily: fonts.sans,
                fontSize: 58,
                fontWeight: 540,
                letterSpacing: '-0.04em',
                color: colors.ink,
                maxWidth: 880,
                lineHeight: 1,
              }}
            >
              Le même principe, adapté à{' '}
              <em style={{ fontFamily: fonts.serif, fontStyle: 'italic', color: colors.brick, fontWeight: 460 }}>
                chaque métier.
              </em>
            </h1>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 16,
                color: colors.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Finance · RH · Juridique · Administratif · Santé
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
          >
            {VERTICALS.map((v, columnIndex) => {
              const colStart = 20 + columnIndex * 18;
              const a = liftIn({ frame, start: colStart, duration: 18 });
              return (
                <div
                  key={v.kicker}
                  style={{
                    opacity: a.opacity,
                    transform: `translateY(${a.translateY}px)`,
                  }}
                >
                  <Panel height="100%">
                    <div>
                      <div
                        style={{
                          fontFamily: fonts.sans,
                          fontSize: 13,
                          color: colors.brick,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          fontWeight: 720,
                        }}
                      >
                        {v.kicker}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontFamily: fonts.sans,
                          fontSize: 22,
                          fontWeight: 600,
                          color: colors.ink,
                          letterSpacing: '-0.015em',
                        }}
                      >
                        {v.title}
                      </div>
                    </div>
                    <div
                      style={{
                        background: colors.paper,
                        border: `1px solid ${colors.line}`,
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      {v.rows.map((row, i) => (
                        <FileRow
                          key={row}
                          name={row}
                          kind="new"
                          appearAt={colStart + 12 + i * 8}
                        />
                      ))}
                    </div>
                  </Panel>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
