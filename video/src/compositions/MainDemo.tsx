import React from 'react';
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { colors, fonts, FPS } from '../lib/tokens';
import { BrandMark } from '../components/BrandMark';

/**
 * MainDemo — présentation « produit réel » (~67 s, 1920×1080, muet + sous-titres).
 *
 * Contrairement aux compositions Main* (UI simulée), celle-ci embarque de
 * VRAIES captures du SaaS de production (public/clips/*.mp4, enregistrées au
 * navigateur sur rename.bimcheck-consulting.com) :
 *   1. demo.mp4    — lot exemple → Renommer tout → ZIP
 *   2. profils.mp4 — bulles métier (Juridique, Finance, Santé)
 *   3. cabinet.mp4 — bibliothèque de conventions + rapport CSV (plan Cabinet)
 */

const s = (sec: number) => Math.round(sec * FPS);

// ---- Timeline (frames) ----
const INTRO = s(3.6);
const DEMO_START_FROM = s(0.8);
const DEMO_LEN = s(15.0);
const BUILDER_START_FROM = s(0.9);
const BUILDER_LEN = s(9.8);
const STYLO_START_FROM = s(6.7);   // retouche.mp4 — phase éditeur (stylo)
const STYLO_LEN = s(12.9);
const OUTILS_START_FROM = s(19.7); // retouche.mp4 — phase Outils/Remplacer
const OUTILS_LEN = s(8.9);
const PROFILS_START_FROM = s(0.9);
const PROFILS_LEN = s(8.7);
const CABINET_START_FROM = s(1.0);
const CABINET_LEN = s(16.6);
const OFFER = s(8);
const OUTRO = s(5.6);

const T_DEMO = INTRO;
const T_BUILDER = T_DEMO + DEMO_LEN;
const T_STYLO = T_BUILDER + BUILDER_LEN;
const T_OUTILS = T_STYLO + STYLO_LEN;
const T_PROFILS = T_OUTILS + OUTILS_LEN;
const T_CABINET = T_PROFILS + PROFILS_LEN;
const T_OFFER = T_CABINET + CABINET_LEN;
const T_OUTRO = T_OFFER + OFFER;
export const DEMO_TOTAL_FRAMES = T_OUTRO + OUTRO;

const navyGradient = `radial-gradient(circle at 78% 12%, rgba(34,211,238,.10), transparent 30rem),
   radial-gradient(circle at 8% 85%, rgba(99,102,241,.12), transparent 32rem), ${colors.navy}`;

// ---------------------------------------------------------------------------
// Briques visuelles
// ---------------------------------------------------------------------------

function FadeIn({
  at,
  duration = 12,
  children,
  style,
}: {
  at: number;
  duration?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [at, at + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [at, at + duration], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
}

/** Sous-titre bas d'écran, style prod (pill sombre, gros lisible). */
function Caption({
  fromSec,
  toSec,
  children,
}: {
  fromSec: number;
  toSec: number;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const from = s(fromSec);
  const to = s(toSec);
  const opacity = interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [from, from + 10], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 54,
        display: 'flex',
        justifyContent: 'center',
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          background: 'rgba(10, 15, 30, .92)',
          border: `1.5px solid rgba(103, 232, 249, .35)`,
          color: colors.inkOnDark,
          borderRadius: 16,
          padding: '20px 38px',
          fontFamily: fonts.sans,
          fontSize: 40,
          fontWeight: 650,
          letterSpacing: '-0.01em',
          textAlign: 'center',
          boxShadow: '0 18px 50px -18px rgba(2,6,23,.7)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Badge chapitre en haut à gauche. */
function ChapterBadge({ index, label }: { index: string; label: string }) {
  return (
    <FadeIn
      at={4}
      style={{ position: 'absolute', top: 36, left: 44, display: 'flex', gap: 14, alignItems: 'center' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: 'rgba(10, 15, 30, .9)',
          border: '1.5px solid rgba(103, 232, 249, .35)',
          borderRadius: 999,
          padding: '12px 26px 12px 14px',
          fontFamily: fonts.sans,
          boxShadow: '0 14px 40px -18px rgba(2,6,23,.7)',
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(135deg, ${colors.cyanDeep}, ${colors.primary})`,
            color: '#06121F',
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {index}
        </span>
        <span style={{ color: colors.inkOnDark, fontSize: 26, fontWeight: 700 }}>{label}</span>
      </div>
    </FadeIn>
  );
}

/** Un chapitre : vraie capture produit encadrée + badge + sous-titres. */
function RealClip({
  src,
  startFrom,
  badgeIndex,
  badgeLabel,
  captions,
}: {
  src: string;
  startFrom: number;
  badgeIndex: string;
  badgeLabel: string;
  captions: { from: number; to: number; text: React.ReactNode }[];
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.005, 1.03]);
  const fade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{ background: navyGradient }}>
      <AbsoluteFill style={{ padding: '54px 70px 118px', opacity: fade }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 18,
            overflow: 'hidden',
            border: '1.5px solid rgba(148, 163, 184, .28)',
            boxShadow: '0 40px 110px -40px rgba(2,6,23,.85)',
            transform: `scale(${scale})`,
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            startFrom={startFrom}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </AbsoluteFill>
      <ChapterBadge index={badgeIndex} label={badgeLabel} />
      {captions.map((c) => (
        <Caption key={c.from} fromSec={c.from} toSec={c.to}>
          {c.text}
        </Caption>
      ))}
    </AbsoluteFill>
  );
}

const Em = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: colors.cyan }}>{children}</span>
);

// ---------------------------------------------------------------------------
// Scènes
// ---------------------------------------------------------------------------

function Intro() {
  return (
    <AbsoluteFill
      style={{
        background: navyGradient,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.sans,
        gap: 30,
      }}
    >
      <FadeIn at={2}>
        <BrandMark size="lg" inverted />
      </FadeIn>
      <FadeIn at={14}>
        <div
          style={{
            color: colors.inkOnDark,
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            textAlign: 'center',
            lineHeight: 1.04,
            maxWidth: 1400,
          }}
        >
          Des noms de fichiers propres,
          <br />
          <Em>sans envoyer vos documents.</Em>
        </div>
      </FadeIn>
      <FadeIn at={30}>
        <div style={{ color: colors.inkSoftOnDark, fontSize: 34, fontWeight: 500 }}>
          Démonstration réelle — rename.bimcheck-consulting.com
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

function PlanCard({
  name,
  price,
  lines,
  highlight,
  at,
}: {
  name: string;
  price: string;
  lines: string[];
  highlight?: boolean;
  at: number;
}) {
  return (
    <FadeIn at={at} style={{ flex: 1 }}>
      <div
        style={{
          background: highlight ? 'rgba(34, 211, 238, .08)' : 'rgba(14, 22, 40, .92)',
          border: highlight
            ? `2px solid ${colors.cyanDeep}`
            : '1.5px solid rgba(148, 163, 184, .25)',
          borderRadius: 20,
          padding: '34px 34px 30px',
          height: 420,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: fonts.sans,
          boxShadow: highlight ? '0 24px 70px -28px rgba(34,211,238,.35)' : undefined,
        }}
      >
        <div style={{ color: colors.inkOnDark, fontSize: 34, fontWeight: 750 }}>{name}</div>
        <div style={{ color: colors.cyan, fontSize: 52, fontWeight: 800, margin: '10px 0 20px' }}>
          {price}
        </div>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              color: colors.inkSoftOnDark,
              fontSize: 25,
              fontWeight: 500,
              padding: '7px 0',
              display: 'flex',
              gap: 12,
            }}
          >
            <span style={{ color: colors.success, fontWeight: 800 }}>✓</span>
            {line}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}

function Offer() {
  return (
    <AbsoluteFill
      style={{ background: navyGradient, padding: '80px 90px', fontFamily: fonts.sans }}
    >
      <FadeIn at={2}>
        <div
          style={{
            color: colors.inkOnDark,
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textAlign: 'center',
            marginBottom: 44,
          }}
        >
          Commencez gratuitement. <Em>Sans compte.</Em>
        </div>
      </FadeIn>
      <div style={{ display: 'flex', gap: 34 }}>
        <PlanCard
          at={10}
          name="Free"
          price="0 €"
          lines={['3 lots / jour', 'Tous les profils métier', 'Export ZIP + aperçu']}
        />
        <PlanCard
          at={18}
          name="Team"
          price="19 € / mois"
          highlight
          lines={['Lots illimités', 'Rapport de renommage TXT', 'Licence auto après paiement']}
        />
        <PlanCard
          at={26}
          name="Cabinet"
          price="49 € / mois"
          lines={['Conventions multi-clients', 'Rapport CSV d’audit', '3 postes actifs']}
        />
      </div>
      <FadeIn at={40}>
        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            color: colors.inkSoftOnDark,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          🔒 Local-first : vos fichiers ne quittent <Em>jamais</Em> votre navigateur.
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

function Outro() {
  return (
    <AbsoluteFill
      style={{
        background: navyGradient,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 34,
        fontFamily: fonts.sans,
      }}
    >
      <FadeIn at={2}>
        <BrandMark size="lg" inverted />
      </FadeIn>
      <FadeIn at={12}>
        <div
          style={{
            color: colors.inkOnDark,
            fontSize: 62,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            textAlign: 'center',
          }}
        >
          Essayez sur un vrai lot — <Em>maintenant</Em>.
        </div>
      </FadeIn>
      <FadeIn at={24}>
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.cyanDeep}, ${colors.primary})`,
            color: '#06121F',
            borderRadius: 14,
            padding: '22px 44px',
            fontSize: 38,
            fontWeight: 800,
            fontFamily: fonts.mono,
            boxShadow: '0 18px 60px -18px rgba(34,211,238,.55)',
          }}
        >
          rename.bimcheck-consulting.com
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
}

function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: 7,
        width: `${(frame / durationInFrames) * 100}%`,
        background: `linear-gradient(90deg, ${colors.cyanDeep}, ${colors.indigo})`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

export function MainDemo() {
  return (
    <AbsoluteFill style={{ background: colors.navy }}>
      <Sequence from={0} durationInFrames={INTRO} layout="none">
        <Intro />
      </Sequence>

      <Sequence from={T_DEMO} durationInFrames={DEMO_LEN} layout="none">
        <RealClip
          src="clips/demo.mp4"
          startFrom={DEMO_START_FROM}
          badgeIndex="1"
          badgeLabel="Renommer un lot en 3 clics"
          captions={[
            { from: 0.2, to: 3.3, text: <>Chargez un lot — <Em>vos fichiers restent dans votre navigateur</Em></> },
            { from: 3.5, to: 6.6, text: <>« Renommer tout » : <Em>la convention s’applique au lot entier</Em></> },
            { from: 6.8, to: 9.9, text: <>Donnez <Em>votre nom</Em> au ZIP de livraison</> },
            { from: 10.1, to: 14.5, text: <>Export <Em>ZIP propre</Em>, arborescence conservée</> },
          ]}
        />
      </Sequence>

      <Sequence from={T_BUILDER} durationInFrames={BUILDER_LEN} layout="none">
        <RealClip
          src="clips/builder.mp4"
          startFrom={BUILDER_START_FROM}
          badgeIndex="2"
          badgeLabel="Votre convention, vos règles"
          captions={[
            { from: 0.2, to: 4.7, text: <>Composez la convention en <Em>glisser-déposer</Em></> },
            { from: 5.0, to: 9.3, text: <>L’aperçu se met à jour <Em>en direct</Em></> },
          ]}
        />
      </Sequence>

      <Sequence from={T_STYLO} durationInFrames={STYLO_LEN} layout="none">
        <RealClip
          src="clips/retouche.mp4"
          startFrom={STYLO_START_FROM}
          badgeIndex="3"
          badgeLabel="Retouche fichier par fichier"
          captions={[
            { from: 0.2, to: 3.3, text: <>Un fichier à ajuster ? <Em>Cliquez le stylo</Em></> },
            { from: 3.6, to: 8.5, text: <>Chaque segment s’édite et se <Em>réordonne en drag & drop</Em></> },
            { from: 8.7, to: 12.6, text: <>Appliquer — <Em>le nom est corrigé</Em></> },
          ]}
        />
      </Sequence>

      <Sequence from={T_OUTILS} durationInFrames={OUTILS_LEN} layout="none">
        <RealClip
          src="clips/retouche.mp4"
          startFrom={OUTILS_START_FROM}
          badgeIndex="4"
          badgeLabel="Outils — Remplacer sur le lot"
          captions={[
            { from: 0.2, to: 4.1, text: <>Outils : <Em>remplacez du texte</Em> sur tout le lot</> },
            { from: 4.4, to: 8.6, text: <>PROJET → MUSEE, appliqué aux <Em>5 fichiers d’un coup</Em></> },
          ]}
        />
      </Sequence>

      <Sequence from={T_PROFILS} durationInFrames={PROFILS_LEN} layout="none">
        <RealClip
          src="clips/profils.mp4"
          startFrom={PROFILS_START_FROM}
          badgeIndex="5"
          badgeLabel="9 profils métier"
          captions={[
            { from: 0.3, to: 4.4, text: <><Em>BIM, Juridique, Finance, Santé…</Em> un clic suffit</> },
            { from: 4.7, to: 8.4, text: <>Champs, codes et modèles <Em>adaptés à chaque métier</Em></> },
          ]}
        />
      </Sequence>

      <Sequence from={T_CABINET} durationInFrames={CABINET_LEN} layout="none">
        <RealClip
          src="clips/cabinet.mp4"
          startFrom={CABINET_START_FROM}
          badgeIndex="6"
          badgeLabel="Cabinet — multi-clients"
          captions={[
            { from: 0.3, to: 4.7, text: <>Enregistrez <Em>une convention par client</Em></> },
            { from: 5.0, to: 9.4, text: <>Changez de client <Em>en un clic</Em> — tout se recharge</> },
            { from: 9.7, to: 13.5, text: <>Le lot suivant se renomme <Em>sans reconfigurer</Em></> },
            { from: 13.8, to: 16.3, text: <>Rapport <Em>CSV d’audit</Em> : traçabilité totale</> },
          ]}
        />
      </Sequence>

      <Sequence from={T_OFFER} durationInFrames={OFFER} layout="none">
        <Offer />
      </Sequence>

      <Sequence from={T_OUTRO} durationInFrames={OUTRO} layout="none">
        <Outro />
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
}
