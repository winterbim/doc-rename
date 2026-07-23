import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { PaperBackground } from '../components/PaperBackground';
import { colors, fonts } from '../lib/tokens';
import { softSpring } from '../lib/easing';

export function ScenePrivacy() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <PaperBackground>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 80,
            gap: 40,
          }}
        >
          <div style={{ width: 920, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ opacity: softSpring({ frame, fps, delay: 4 }) }}>
              <p
                style={{
                  margin: 0,
                  color: colors.cyan,
                  fontFamily: fonts.sans,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Confidentialité prouvable
              </p>
              <h2
                style={{
                  margin: '12px 0 0',
                  fontFamily: fonts.sans,
                  fontWeight: 800,
                  fontSize: 48,
                  letterSpacing: '-0.035em',
                  color: colors.inkOnDark,
                  lineHeight: 1.08,
                }}
              >
                Ouvrez l’onglet Réseau.
                <br />
                <span style={{ color: colors.cyan }}>Aucun fichier ne part.</span>
              </h2>
            </div>

            <div
              style={{
                opacity: softSpring({ frame, fps, delay: 24 }),
                background: colors.navy2,
                border: '1px solid rgba(148,163,184,.16)',
                borderRadius: 14,
                overflow: 'hidden',
                fontFamily: fonts.mono,
                fontSize: 16,
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(148,163,184,.12)',
                  color: colors.inkMuteOnDark,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span style={{ color: colors.cyan }}>●</span> DevTools · Network · renommage en cours
              </div>
              {[
                ['GET /app', '200'],
                ['GET /_next/static/...', '200'],
                ['— contenu fichier —', 'aucune requête'],
              ].map(([left, right], i) => (
                <div
                  key={left}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(148,163,184,.08)',
                    color: i === 2 ? colors.success : colors.inkSoftOnDark,
                    fontWeight: i === 2 ? 700 : 500,
                  }}
                >
                  <span>{left}</span>
                  <span style={{ color: i === 2 ? colors.success : colors.cyan }}>{right}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                title: 'Free',
                price: '0 €',
                lines: ['3 lots / jour', 'Sans compte', 'Tous les profils métier'],
                highlight: false,
              },
              {
                title: 'Team',
                price: '19 €/mois',
                lines: ['Lots illimités', 'Licence auto après paiement', 'Support email'],
                highlight: true,
              },
              {
                title: 'Cabinet',
                price: '49 €/mois',
                lines: ['Volume multi-équipes', 'Support prioritaire', 'Facture Stripe'],
                highlight: false,
              },
            ].map((plan, i) => {
              const t = softSpring({ frame, fps, delay: 40 + i * 12 });
              return (
                <div
                  key={plan.title}
                  style={{
                    opacity: t,
                    transform: `translateX(${(1 - t) * 30}px)`,
                    padding: 18,
                    borderRadius: 14,
                    border: plan.highlight
                      ? '1px solid rgba(103,232,249,.45)'
                      : '1px solid rgba(148,163,184,.16)',
                    background: plan.highlight
                      ? 'linear-gradient(160deg, rgba(103,232,249,.12), rgba(99,102,241,.10))'
                      : colors.navy2,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 750, fontSize: 20, color: colors.inkOnDark }}>
                      {plan.title}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: colors.cyan }}>{plan.price}</span>
                  </div>
                  <ul
                    style={{
                      margin: '10px 0 0',
                      padding: 0,
                      listStyle: 'none',
                      color: colors.inkSoftOnDark,
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    {plan.lines.map((line) => (
                      <li key={line}>· {line}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </PaperBackground>
    </AbsoluteFill>
  );
}
