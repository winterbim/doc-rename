import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { Panel, SubPanel } from '../components/Panel';
import { FileRow } from '../components/FileRow';
import { Chip } from '../components/Chip';
import { colors, fonts } from '../lib/tokens';
import { liftIn } from '../lib/easing';

const BEFORE = ['façade été finale.pdf', 'plan rdc copie.dwg', 'rapport synthèse v2.docx'];
const AFTER = [
  'PROJET_BAT_CVC_PLAN_ENT_001.PDF',
  'PROJET_BAT_ARC_PLAN_ENT_002.DWG',
  'PROJET_BAT_SYN_RAPPORT_ENT_003.DOCX',
];

/**
 * Scene 5 — BIM / Construction (48–60 s).
 * Side-by-side "Avant / Après" using the same visual language as the landing.
 */
export function SceneBIM() {
  const frame = useCurrentFrame();
  const head = liftIn({ frame, start: 6 });
  const arrowOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill style={{ padding: '70px 110px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div
            style={{
              opacity: head.opacity,
              transform: `translateY(${head.translateY}px)`,
              display: 'flex',
              alignItems: 'baseline',
              gap: 18,
            }}
          >
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 18,
                color: colors.brick,
                fontWeight: 720,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Cas d’usage
            </span>
            <h1
              style={{
                margin: 0,
                fontFamily: fonts.sans,
                fontSize: 62,
                fontWeight: 540,
                letterSpacing: '-0.04em',
                color: colors.ink,
              }}
            >
              BIM <em style={{ fontFamily: fonts.serif, fontStyle: 'italic', color: colors.brick, fontWeight: 460 }}>/</em> Construction
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {['Plans', 'DOE', 'Maquettes', 'Rapports', 'CDE'].map((label, i) => (
              <div key={label} style={{ opacity: liftIn({ frame, start: 20 + i * 6, duration: 12 }).opacity }}>
                <Chip label={label} tone="moss" />
              </div>
            ))}
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 90px 1fr',
              gap: 18,
              alignItems: 'center',
            }}
          >
            <Panel title="Avant" height="100%">
              <SubPanel>
                {BEFORE.map((name, i) => (
                  <FileRow key={name} name={name} kind="old" appearAt={30 + i * 8} large />
                ))}
              </SubPanel>
            </Panel>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: arrowOpacity,
              }}
            >
              <svg width={70} height={70} viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12h14m0 0l-5-5m5 5l-5 5"
                  stroke={colors.brick}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <Panel title="Après" height="100%" badge="convention BIM">
              <SubPanel>
                {AFTER.map((name, i) => (
                  <FileRow key={name} name={name} kind="new" appearAt={70 + i * 10} large status="OK" />
                ))}
              </SubPanel>
            </Panel>
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
