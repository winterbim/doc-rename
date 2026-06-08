import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/contact';

const siteUrl = 'https://doc-rename-saas.vercel.app';

export const metadata: Metadata = {
  title: 'BimDoc Renamer — Renommer vos livrables BIM avant dépôt CDE',
  description:
    'Renommez et exportez vos lots BIM à la convention ISO 19650 ou SIA 2051 en moins de 60 secondes, sans envoyer un seul fichier à un serveur. Compatible Autodesk Docs, Trimble Connect, Kroqi.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    title: 'BimDoc Renamer — Renommer vos livrables BIM avant dépôt CDE',
    description:
      'Outil local-first pour appliquer une convention de nommage ISO 19650 ou SIA à vos lots de plans, IFC, DWG, PDF. Compatible Autodesk Docs, Trimble Connect, Kroqi.',
    url: siteUrl,
    siteName: 'BimDoc Renamer',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BimDoc Renamer',
    description:
      "Convention ISO 19650 / SIA 2051 appliquée à vos livrables BIM, en local navigateur. Sans compte pour essayer.",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      fr: siteUrl,
      'x-default': siteUrl,
    },
  },
  keywords: [
    'ISO 19650',
    'convention nommage BIM',
    'renommage livrable BIM',
    'SIA 2051',
    'CDE',
    'DOE',
    'BIM Manager',
    'BIM Coordinator',
    'Autodesk Docs',
    'Trimble Connect',
    'Kroqi',
    'auto-naming BIM',
    'bureau études BIM',
  ],
  other: {
    'theme-color': '#F7F3EA',
    'color-scheme': 'light',
  },
};

const LANDING_CSS = `
  :root {
    --paper: #f7f3ea;
    --paper-soft: #eee7da;
    --paper-hard: #fffaf0;
    --ink: #241f19;
    --ink-soft: #5b5045;
    --muted: #817466;
    --line: #d8cdbb;
    --line-strong: #b8aa95;
    --brick: #a54835;
    --brick-deep: #8c3722;
    --moss: #4f6948;
    --blue: #314d63;
    --gold: #c0913f;
    --shadow: 0 24px 70px -44px rgba(36, 31, 25, .45);
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background:
      linear-gradient(90deg, rgba(36,31,25,.045) 1px, transparent 1px),
      linear-gradient(rgba(36,31,25,.035) 1px, transparent 1px),
      var(--paper);
    background-size: 44px 44px;
    color: var(--ink);
    font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.55;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  a { color: inherit; }
  :focus-visible { outline: 3px solid var(--gold); outline-offset: 4px; }

  .wrap { width: min(1180px, calc(100% - 40px)); margin: 0 auto; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; padding: 26px 0;
  }

  .brand {
    display: inline-flex; align-items: center; gap: 12px;
    text-decoration: none; font-weight: 700; letter-spacing: -.02em;
  }

  .mark {
    width: 34px; height: 34px; display: grid; place-items: center;
    border: 1px solid var(--ink); background: var(--ink); color: var(--paper);
    border-radius: 7px; font-size: 13px; letter-spacing: -.04em;
  }

  .brand-name { font-size: 17px; }
  .brand-sub { font-family: var(--font-newsreader), Georgia, serif; font-style: italic; color: var(--brick); font-weight: 460; margin-left: 4px; }

  .nav {
    display: flex; align-items: center; gap: 24px;
    font-size: 14px; color: var(--ink-soft);
  }
  .nav a { text-decoration: none; border-bottom: 1px solid transparent; }
  .nav a:hover { color: var(--ink); border-color: var(--ink); }

  .pill-link {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 42px; padding: 0 18px; border-radius: 999px;
    background: var(--ink); color: var(--paper); text-decoration: none;
    font-weight: 650; font-size: 14px;
    transition: transform .18s ease, background .18s ease;
  }
  .pill-link:hover { transform: translateY(-1px); background: var(--brick); }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(320px, .98fr);
    gap: clamp(38px, 6vw, 74px); align-items: center;
    padding: clamp(56px, 9vw, 116px) 0 72px;
  }

  .eyebrow {
    display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px;
    color: var(--ink-soft); font-size: 14px; font-weight: 620;
  }
  .eyebrow::before {
    content: ""; width: 9px; height: 9px; border-radius: 99px;
    background: var(--moss); box-shadow: 0 0 0 5px rgba(79, 105, 72, .16);
  }

  h1 {
    margin: 0; max-width: 14ch;
    font-size: clamp(48px, 7.8vw, 102px);
    line-height: .95; letter-spacing: -.05em; font-weight: 520;
  }
  h1 em, .serif {
    font-family: var(--font-newsreader), Georgia, serif;
    font-style: italic; font-weight: 460; letter-spacing: -.025em;
  }
  h1 em { color: var(--brick); }

  .lead {
    max-width: 620px; margin: 28px 0 0; color: var(--ink-soft);
    font-size: clamp(18px, 1.45vw, 20px); line-height: 1.55;
  }
  .lead strong { color: var(--ink); font-weight: 680; }

  .cta-row {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 32px;
  }

  .button {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 50px; padding: 0 22px; border-radius: 999px;
    border: 1px solid var(--ink); text-decoration: none; font-weight: 680;
    transition: transform .18s ease, background .18s ease, color .18s ease;
  }
  .button.primary { background: var(--ink); color: var(--paper); }
  .button.primary:hover { background: var(--brick); border-color: var(--brick); transform: translateY(-1px); }
  .button.secondary { background: transparent; color: var(--ink); }
  .button.secondary:hover { background: var(--ink); color: var(--paper); }

  .small-note {
    margin-top: 18px; color: var(--muted); font-size: 14px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .small-note::before {
    content: ""; width: 7px; height: 7px; border-radius: 99px;
    background: var(--moss); flex-shrink: 0;
  }

  .product-shot {
    border: 1px solid var(--line-strong); border-radius: 8px;
    background: var(--paper-hard); box-shadow: var(--shadow); overflow: hidden;
  }
  .shot-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; border-bottom: 1px solid var(--line); padding: 16px 18px; background: #fbf7ee;
  }
  .traffic { display: flex; gap: 7px; }
  .traffic span { width: 10px; height: 10px; border-radius: 99px; background: var(--line-strong); }
  .traffic span:nth-child(1) { background: var(--brick); }
  .traffic span:nth-child(2) { background: var(--gold); }
  .traffic span:nth-child(3) { background: var(--moss); }
  .usage { color: var(--blue); font-size: 13px; font-weight: 720; }
  .shot-body { padding: 24px; }

  .tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .tool-panel { border: 1px solid var(--line); border-radius: 6px; background: var(--paper); padding: 16px; }
  .tool-panel h2 {
    margin: 0 0 12px; font-size: 13px; letter-spacing: .05em;
    text-transform: uppercase; color: var(--muted);
  }

  .file-row {
    padding: 10px 0; border-top: 1px solid rgba(184, 170, 149, .55);
    font-family: var(--font-mono), ui-monospace, monospace;
    font-size: 12px; line-height: 1.4;
  }
  .file-row:first-of-type { border-top: 0; }
  .old { color: var(--muted); text-decoration: line-through; text-decoration-color: var(--brick); }
  .new { color: var(--moss); font-weight: 720; }

  .iso-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
  .chip {
    border: 1px solid var(--line-strong); border-radius: 999px;
    padding: 6px 10px; font-size: 12px; color: var(--ink-soft); background: #fbf7ee;
  }
  .chip.brick { border-color: var(--brick); background: rgba(165, 72, 53, .08); color: var(--brick); font-weight: 680; }

  .section { padding: clamp(64px, 9vw, 112px) 0; border-top: 1px solid var(--line-strong); }

  .section-head {
    display: grid; grid-template-columns: minmax(0, .9fr) minmax(280px, .7fr);
    gap: 32px; align-items: end; margin-bottom: 34px;
  }
  .kicker {
    display: block; margin-bottom: 12px; color: var(--brick);
    font-size: 13px; font-weight: 720; letter-spacing: .06em; text-transform: uppercase;
  }
  .section h2 {
    margin: 0; font-size: clamp(34px, 5vw, 60px); line-height: 1;
    letter-spacing: -.04em; font-weight: 540;
  }
  .section-copy { margin: 0; color: var(--ink-soft); font-size: 17px; }

  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }

  .card {
    border: 1px solid var(--line-strong); border-radius: 8px;
    background: rgba(255, 250, 240, .78); padding: 24px;
  }
  .card strong {
    display: block; margin-bottom: 8px; color: var(--ink);
    font-size: 19px; letter-spacing: -.02em;
  }
  .card p { margin: 0; color: var(--ink-soft); }

  .steps { counter-reset: step; }
  .step { counter-increment: step; position: relative; padding-top: 54px; }
  .step::before {
    content: "0" counter(step); position: absolute; top: 0; left: 0;
    color: var(--brick); font-family: var(--font-newsreader), Georgia, serif;
    font-size: 44px; line-height: 1; font-style: italic;
  }

  .proof-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; }
  .proof {
    border-left: 3px solid var(--brick); padding: 8px 14px; background: #fbf7ee;
    border-radius: 4px;
  }
  .proof strong { display: block; font-size: 22px; color: var(--ink); letter-spacing: -.025em; }
  .proof span { font-size: 13px; color: var(--muted); }

  .compare-table {
    width: 100%; border-collapse: collapse;
    background: var(--paper-hard); border: 1px solid var(--line-strong); border-radius: 8px; overflow: hidden;
  }
  .compare-table th, .compare-table td {
    padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--line);
    font-size: 14px; color: var(--ink-soft);
  }
  .compare-table th { background: #fbf7ee; font-weight: 700; color: var(--ink); font-size: 13px; }
  .compare-table thead th { white-space: nowrap; }
  .compare-table th:first-child, .compare-table td:first-child { color: var(--ink); font-weight: 620; }
  .compare-table .us { background: rgba(165, 72, 53, .06); }
  .compare-table .us-cell { color: var(--brick-deep); font-weight: 680; }
  .ok::before { content: "✓ "; color: var(--moss); font-weight: 800; }
  .no::before { content: "✗ "; color: var(--brick); font-weight: 800; }

  .security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  .security-list { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; color: var(--ink-soft); }
  .security-list li { padding-left: 24px; position: relative; }
  .security-list li::before { content: "✓"; position: absolute; left: 0; color: var(--moss); font-weight: 800; }
  .security-list li strong { color: var(--ink); }

  .devtools {
    border: 1px solid var(--line-strong); border-radius: 8px;
    background: var(--paper-hard); box-shadow: var(--shadow); overflow: hidden;
  }
  .devtools-top {
    background: #fbf7ee; border-bottom: 1px solid var(--line);
    padding: 10px 16px; font-family: var(--font-mono), ui-monospace, monospace;
    font-size: 11px; color: var(--muted);
    display: flex; align-items: center; gap: 8px;
  }
  .devtools-body { padding: 18px 22px; font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px; }
  .devtools-body .req { padding: 6px 0; border-bottom: 1px dashed var(--line); display: flex; justify-content: space-between; gap: 12px; }
  .devtools-body .req:last-child { border-bottom: 0; }
  .devtools-body .req .status { color: var(--moss); font-weight: 700; }
  .devtools-body .filter { color: var(--brick); font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 2px solid var(--ink); }

  .persona-card {
    border: 1px solid var(--line-strong); border-radius: 8px;
    background: var(--paper-hard); padding: 26px; display: flex; flex-direction: column; gap: 14px;
  }
  .persona-role { color: var(--brick); font-size: 12px; font-weight: 720; letter-spacing: .08em; text-transform: uppercase; }
  .persona-quote { margin: 0; font-size: 17px; color: var(--ink); line-height: 1.55; }
  .persona-quote::before { content: "“"; font-family: var(--font-newsreader), Georgia, serif; font-size: 36px; color: var(--brick); display: block; line-height: .5; }
  .persona-name { color: var(--muted); font-size: 13px; font-style: italic; }

  .pricing { align-items: stretch; }
  .plan {
    display: flex; flex-direction: column; min-height: 100%;
    border: 1px solid var(--line-strong); border-radius: 8px;
    background: var(--paper-hard); padding: 28px;
  }
  .plan.pro { border-color: var(--ink); background: #252019; color: var(--paper); }
  .plan.team { border-color: var(--brick); background: #fffaf0; box-shadow: 0 18px 50px -36px rgba(165, 72, 53, .65); }
  .plan-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
  .plan h3 { margin: 0; font-size: 26px; letter-spacing: -.03em; }
  .badge {
    border: 1px solid currentColor; border-radius: 999px; padding: 5px 10px;
    color: var(--brick); font-size: 12px; font-weight: 760; white-space: nowrap;
  }
  .pro .badge { color: var(--gold); }
  .team .badge { color: var(--brick); }
  .price { margin: 0 0 8px; font-size: 46px; line-height: 1; letter-spacing: -.045em; font-weight: 580; }
  .price small { font-size: 16px; color: var(--muted); letter-spacing: 0; font-weight: 520; }
  .pro .price small, .pro .muted, .pro li { color: rgba(247, 243, 234, .76); }
  .muted { color: var(--ink-soft); margin: 0; }
  .plan ul { margin: 24px 0 28px; padding: 0; list-style: none; display: grid; gap: 10px; }
  .plan li { color: var(--ink-soft); padding-left: 22px; position: relative; }
  .plan li::before {
    content: ""; width: 7px; height: 7px; border-radius: 99px; background: var(--moss);
    position: absolute; left: 0; top: .65em;
  }
  .pro li::before { background: var(--gold); }
  .plan .button { margin-top: auto; width: fit-content; }
  .pro .button.primary { background: var(--paper); color: var(--ink); border-color: var(--paper); }
  .pro .button.primary:hover { background: var(--gold); border-color: var(--gold); }
  .team .button.primary { background: var(--brick); border-color: var(--brick); color: #fff; }
  .team .button.primary:hover { background: var(--ink); border-color: var(--ink); }

  .faq { display: grid; gap: 0; border-top: 1px solid var(--line-strong); }
  details { border-bottom: 1px solid var(--line-strong); padding: 20px 0; }
  summary { cursor: pointer; font-weight: 720; font-size: 18px; letter-spacing: -.015em; }
  details p { max-width: 760px; margin: 12px 0 0; color: var(--ink-soft); }

  .final {
    background: var(--ink); color: var(--paper);
    padding: clamp(54px, 8vw, 92px); border-radius: 8px; margin-bottom: 44px;
  }
  .final h2 { max-width: 13ch; color: var(--paper); }
  .final .section-copy { color: rgba(247, 243, 234, .78); }
  .final .button.primary { background: var(--gold); color: var(--ink); border-color: var(--gold); }
  .final .button.secondary { color: var(--paper); border-color: rgba(247, 243, 234, .42); }
  .final .button.secondary:hover { background: var(--paper); color: var(--ink); }

  footer {
    border-top: 1px solid var(--line-strong); padding: 30px 0 42px;
    color: var(--muted); font-size: 14px;
  }
  .foot { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .foot a { color: var(--ink-soft); text-decoration: none; border-bottom: 1px solid transparent; }
  .foot a:hover { color: var(--ink); border-color: var(--ink); }

  @media (max-width: 900px) {
    .nav { display: none; }
    .hero, .section-head, .grid-3, .grid-2, .security-grid, .proof-row { grid-template-columns: 1fr; }
    .tool-grid { grid-template-columns: 1fr; }
    h1 { max-width: 100%; font-size: 48px; }
    .compare-table { display: block; overflow-x: auto; white-space: nowrap; }
  }

  @media (max-width: 560px) {
    .wrap { width: min(100% - 28px, 1180px); }
    h1 { font-size: 42px; }
    .shot-body, .card, .plan, .persona-card { padding: 18px; }
    .price { font-size: 38px; }
    .final { padding: 34px 20px; }
  }
`;

const SOFTWARE_APPLICATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BimDoc Renamer',
  alternateName: 'BimDoc',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  description:
    "Renommage de livrables BIM à la convention ISO 19650 ou SIA 2051, traitement local navigateur, compatible Autodesk Docs, Trimble Connect et Kroqi.",
  audience: {
    '@type': 'BusinessAudience',
    name: 'BIM Managers, BIM Coordinators, bureaux d’études, agences d’architecture',
  },
  applicationSubCategory: 'BIM document management',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'CHF',
      description: '3 lots de renommage par jour, sans compte.',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '19.99',
      priceCurrency: 'CHF',
      description: 'Lots illimités, conventions ISO 19650 / SIA pré-câblées.',
    },
    {
      '@type': 'Offer',
      name: 'Team',
      price: '34.90',
      priceCurrency: 'CHF',
      description: 'Conventions partagées pour petites équipes BIM.',
    },
  ],
};

const faqs = [
  {
    question: 'BimDoc Renamer remplace-t-il Autodesk Docs ou Plannerly ?',
    answer:
      "Non. C’est l’outil qui prépare proprement vos lots de livrables avant dépôt dans votre CDE existant. Il est compatible Autodesk Docs / ACC, Trimble Connect, Kroqi et ProjectWise — il n’essaie pas de les remplacer.",
  },
  {
    question: 'Le modèle ISO 19650 est-il « certifié » ?',
    answer:
      "ISO 19650 n’a pas de certification produit, seulement des certifications organisation. Notre modèle suit le National Annex UK informatif et reste paramétrable champ par champ pour s’adapter à votre BEP / EIR.",
  },
  {
    question: 'Mes fichiers restent vraiment dans mon navigateur ?',
    answer:
      "Oui, et c’est vérifiable. Ouvrez l’onglet Réseau de votre DevTools pendant un renommage : aucune requête sortante ne contient vos fichiers. Voir la page /security pour l’audit complet (CSP, headers HTTP, scans CodeQL / OWASP ZAP).",
  },
  {
    question: 'Peut-on importer notre table d’entreprises et de lots existante ?',
    answer:
      "Oui — CSV, Excel, ODS, ou copier-coller depuis un tableur. 201 entreprises françaises et suisses ainsi que 41 lots sont fournis par défaut, puis restent personnalisables.",
  },
  {
    question: 'Et le RVT / DWG / IFC ?',
    answer:
      "BimDoc Renamer renomme les fichiers, il ne modifie pas leur contenu interne. Un .rvt ou un .ifc reste valide après renommage. Pour renommer des objets à l’intérieur d’un fichier Revit, il faut Naviate, pyRevit ou Dynamo.",
  },
  {
    question: 'Quelle conformité RGPD ?',
    answer:
      "Aucune donnée personnelle traitée tant que vous ne créez pas de compte. Avec un compte Pro : email + préférences uniquement, hébergement EU (Vercel Frankfurt). DPA disponible sur demande pour les contrats Entreprise.",
  },
  {
    question: 'Que se passe-t-il si vous arrêtez le service ?',
    answer:
      "Vos conventions sont exportables en JSON ou CSV à tout moment. Vous gardez votre travail, même si le SaaS s’arrête. C’est volontaire — pas de verrou propriétaire.",
  },
  {
    question: 'Vous travaillez avec des grands comptes ?',
    answer:
      "Une formule Entreprise est en préparation : SSO SAML/OIDC, déploiement on-premise (Docker), DPA et audit de sécurité, support dédié. Contactez-nous pour parler de votre cas.",
  },
];

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_APPLICATION_JSONLD) }}
      />

      <div className="wrap">
        <header className="topbar">
          <Link href="/" className="brand" aria-label="BimDoc Renamer — accueil">
            <span className="mark" aria-hidden="true">BD</span>
            <span className="brand-name">
              BimDoc <span className="brand-sub">Renamer</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Navigation principale">
            <a href="#fonctionnement">Comment</a>
            <a href="#comparatif">Comparatif</a>
            <a href="#securite">Sécurité</a>
            <a href="#tarifs">Tarifs</a>
            <a href="/pilot">Pilote</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a className="pill-link" href="/app">Essayer sans compte</a>
        </header>

        <main>
          <section className="hero">
            <div>
              <span className="eyebrow">Pour BIM Managers · ISO 19650 / SIA · Local-first</span>
              <h1>
                Renommez vos livrables BIM <em>avant dépôt CDE.</em>
              </h1>
              <p className="lead">
                Importez un lot de plans, des PDF de notes ou un ZIP de DOE.
                Composez votre convention <strong>ISO 19650</strong>, <strong>SIA 2051</strong>
                {' '}ou maison. Exportez un ZIP propre prêt à déposer dans
                Autodesk Docs, Trimble Connect, Kroqi ou votre CDE interne.
                Tout reste dans votre navigateur.
              </p>

              <div className="cta-row">
                <a className="button primary" href="/app">Essayer maintenant — sans compte</a>
                <a className="button secondary" href="/pilot">Demander un pilote</a>
              </div>
              <p className="small-note">
                Aucun fichier ne quitte votre poste. Vérifiable dans DevTools &gt; Réseau.
              </p>
            </div>

            <aside className="product-shot" aria-label="Aperçu produit BimDoc Renamer">
              <div className="shot-top">
                <div className="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
                <span className="usage">Convention active · ISO 19650 UK NA</span>
              </div>
              <div className="shot-body">
                <div className="tool-grid">
                  <div className="tool-panel">
                    <h2>Avant</h2>
                    <div className="file-row old">facade etage 1 FINAL v2.pdf</div>
                    <div className="file-row old">plan rdc copie.dwg</div>
                    <div className="file-row old">rapport synthese v3.docx</div>
                    <div className="file-row old">DOE structure.zip</div>
                  </div>
                  <div className="tool-panel">
                    <h2>Après</h2>
                    <div className="file-row new">PRJ01-ZZ-XX-DR-A-0001-P02.pdf</div>
                    <div className="file-row new">PRJ01-ZZ-00-DR-A-0010-P01.dwg</div>
                    <div className="file-row new">PRJ01-ZZ-XX-RP-S-0003-P03.docx</div>
                    <div className="file-row new">PRJ01-ZZ-XX-ZZ-S-DOE-P01.zip</div>
                  </div>
                </div>
                <div className="iso-strip" aria-label="Normes supportées">
                  <span className="chip brick">ISO 19650</span>
                  <span className="chip">SIA 2051</span>
                  <span className="chip">BIM France</span>
                  <span className="chip">Convention maison</span>
                </div>
              </div>
            </aside>
          </section>

          <section className="section" id="probleme">
            <div className="section-head">
              <div>
                <span className="kicker">Le dernier kilomètre du BIM</span>
                <h2>30 minutes par livrable, une convention qui dérive à chaque projet.</h2>
              </div>
              <p className="section-copy">
                Chaque équipe BIM produit en fin de phase des dizaines de plans,
                notes, rapports et exports IFC. Avant dépôt CDE, quelqu’un —
                coordinateur, assistante BIM, BIM Manager — passe sa journée à
                renommer à la main. Le résultat est rarement 100 % conforme
                ISO 19650, alors que les marchés publics et les donneurs d’ordre
                l’exigent.
              </p>
            </div>

            <div className="proof-row">
              <div className="proof">
                <strong>73 %</strong>
                <span>des acteurs construction FR utilisent le BIM (S3D Engineering 2025)</span>
              </div>
              <div className="proof">
                <strong>82 %</strong>
                <span>des bureaux d’études FR ont au moins un projet BIM</span>
              </div>
              <div className="proof">
                <strong>+9 %/an</strong>
                <span>croissance du marché BIM européen (virtuemarketresearch)</span>
              </div>
            </div>
          </section>

          <section className="section" id="fonctionnement">
            <div className="section-head">
              <div>
                <span className="kicker">Comment ça marche</span>
                <h2>Trois actions, pas une plateforme à apprendre.</h2>
              </div>
              <p className="section-copy">
                BimDoc Renamer fait une chose : appliquer une convention de
                nommage propre à un lot de fichiers. Pas de workflow,
                pas d’approbation, pas de stockage cloud. Vous repartez avec
                un ZIP prêt à déposer.
              </p>
            </div>

            <div className="grid-3 steps">
              <article className="card step">
                <strong>Importez</strong>
                <p>
                  Glissez votre dossier projet, un ZIP DOE ou des fichiers individuels.
                  PDF, DOCX, IFC, DWG, DXF, RVT, images, tableurs.
                  <em className="serif"> Aucun upload</em> — tout est lu dans le navigateur.
                </p>
              </article>
              <article className="card step">
                <strong>Composez votre convention</strong>
                <p>
                  Modèles ISO 19650, SIA 2051, BIM France, ou convention maison.
                  Champs : Projet · Phase · Lot · Zone · Niveau · Type · Discipline ·
                  Séquence · Révision · Statut. Importez votre table d’entités CSV/Excel.
                </p>
              </article>
              <article className="card step">
                <strong>Contrôlez et exportez</strong>
                <p>
                  Aperçu Avant / Après ligne par ligne, correction manuelle possible.
                  Téléchargez un ZIP propre avec arborescence intacte, prêt pour Autodesk
                  Docs, Trimble Connect, Kroqi ou votre CDE interne.
                </p>
              </article>
            </div>
          </section>

          <section className="section" id="comparatif">
            <div className="section-head">
              <div>
                <span className="kicker">Différenciation</span>
                <h2>Pourquoi BimDoc Renamer plutôt que…</h2>
              </div>
              <p className="section-copy">
                Un outil ciblé fait mieux qu’une plateforme générique sur un job
                précis. Voici comparé honnêtement aux 3 alternatives que les
                équipes BIM utilisent aujourd’hui.
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col">Critère</th>
                    <th scope="col" className="us-cell">BimDoc Renamer</th>
                    <th scope="col">Plannerly File Manager</th>
                    <th scope="col">Autodesk Docs / ACC</th>
                    <th scope="col">Macro Excel maison</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Compte requis</td><td className="us"><span className="no">Non</span></td><td><span className="ok">Oui</span></td><td><span className="ok">Oui</span></td><td><span className="no">Non</span></td></tr>
                  <tr><td>Fichiers envoyés en ligne</td><td className="us"><span className="no">Non — navigateur</span></td><td><span className="ok">Oui — AWS</span></td><td><span className="ok">Oui — Autodesk Cloud</span></td><td><span className="no">Non</span></td></tr>
                  <tr><td>Modèle ISO 19650</td><td className="us"><span className="ok">Oui, paramétrable</span></td><td><span className="ok">Oui</span></td><td><span className="ok">Oui (depuis 2021)</span></td><td>Selon écriture</td></tr>
                  <tr><td>Import CSV / Excel d’entités</td><td className="us"><span className="ok">Oui</span></td><td>Limité</td><td>Via API</td><td><span className="ok">Oui mais fragile</span></td></tr>
                  <tr><td>Profils métier pré-câblés</td><td className="us"><span className="ok">BIM (V1)</span></td><td>Multi</td><td>BIM</td><td><span className="no">Aucun</span></td></tr>
                  <tr><td>Aperçu Avant / Après</td><td className="us"><span className="ok">Oui</span></td><td><span className="ok">Oui</span></td><td>Partiel</td><td><span className="no">Non</span></td></tr>
                  <tr><td>Onboarding</td><td className="us"><span className="ok">0 min</span></td><td>60 min + appel</td><td>Plusieurs heures</td><td>N/A</td></tr>
                  <tr><td>Tarif entrée</td><td className="us us-cell">19,99 CHF / mois</td><td>30 USD+ / mois</td><td>Inclus ACC (~70€+)</td><td>Temps interne</td></tr>
                  <tr><td>Casse à chaque mise à jour</td><td className="us"><span className="no">Non</span></td><td><span className="no">Non</span></td><td><span className="no">Non</span></td><td><span className="ok">Oui</span></td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" id="securite">
            <div className="section-head">
              <div>
                <span className="kicker">Confidentialité prouvable</span>
                <h2>Vérifiez vous-même. Ouvrez l’onglet Réseau.</h2>
              </div>
              <p className="section-copy">
                Le local-first n’est pas un slogan : c’est mesurable. Pendant
                un renommage, aucune requête sortante ne contient vos fichiers.
                Voici ce que vous pouvez auditer.
              </p>
            </div>

            <div className="security-grid">
              <ul className="security-list">
                <li><strong>Traitement 100 % navigateur</strong> — lecture, parsing, renommage et export ZIP côté client.</li>
                <li><strong>Aucune requête sortante de contenu</strong> — visible en direct dans DevTools &gt; Réseau.</li>
                <li><strong>Headers HTTP audités</strong> — HSTS preload, X-Frame-Options DENY, CSP stricte, Permissions-Policy verrouillée.</li>
                <li><strong>CI sécurité automatique</strong> — CodeQL, OWASP ZAP, Lighthouse à chaque commit.</li>
                <li><strong>Pas de tracking par défaut</strong> — Sentry et PostHog activables, jamais sur le contenu fichier.</li>
                <li><strong>Export conventions</strong> — JSON / CSV à tout moment, pas de verrou.</li>
                <li><strong>Hébergement EU</strong> — Vercel Frankfurt par défaut. On-premise possible pour Entreprise.</li>
              </ul>
              <div className="devtools" aria-hidden="true">
                <div className="devtools-top">
                  <span style={{ color: 'var(--brick)' }}>●</span> DevTools — Network · 12 ressources, 248 KB
                </div>
                <div className="devtools-body">
                  <div className="req"><span>GET /</span><span className="status">200</span></div>
                  <div className="req"><span>GET /app</span><span className="status">200</span></div>
                  <div className="req"><span>GET /_next/static/chunks/main.js</span><span className="status">200</span></div>
                  <div className="req"><span>GET /pdf.worker.min.mjs</span><span className="status">200</span></div>
                  <div className="filter">▼ filtre : renommage en cours</div>
                  <div className="req" style={{ color: 'var(--muted)' }}>
                    <span style={{ fontStyle: 'italic' }}>aucune requête sortante</span>
                    <span style={{ color: 'var(--moss)' }}>✓</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="small-note" style={{ marginTop: 28 }}>
              <a href="/security" style={{ color: 'var(--brick)', fontWeight: 700 }}>
                Lire l’audit sécurité complet →
              </a>
            </p>
          </section>

          <section className="section" id="personas">
            <div className="section-head">
              <div>
                <span className="kicker">Qui s’en sert</span>
                <h2>Trois profils, trois usages concrets.</h2>
              </div>
              <p className="section-copy">
                Les exemples ci-dessous sont représentatifs des cas d’usage
                qu’on rencontre. Dès qu’un client beta signe un témoignage public,
                nous le remplaçons par un vrai nom et un vrai logo.
              </p>
            </div>

            <div className="grid-3">
              <article className="persona-card">
                <span className="persona-role">BIM Coordinator · Agence d’architecture</span>
                <p className="persona-quote">
                  Nous livrons 80 fichiers à chaque jalon. La convention maison est
                  dans un Notion. Avant, la coordination passait 4 heures à
                  renommer avant chaque dépôt. Maintenant : 15 minutes.
                </p>
                <span className="persona-name">— Profil type · agence FR 18 personnes</span>
              </article>
              <article className="persona-card">
                <span className="persona-role">Bureau d’études MEP</span>
                <p className="persona-quote">
                  Nos donneurs d’ordre exigent ISO 19650. Notre équipe modélise
                  en Revit mais le dépôt CDE final est manuel. BimDoc applique
                  la convention en un clic, sans passer par l’usine à gaz Autodesk.
                </p>
                <span className="persona-name">— Profil type · BE MEP CH 30 personnes</span>
              </article>
              <article className="persona-card">
                <span className="persona-role">BIM Manager · Entreprise générale</span>
                <p className="persona-quote">
                  Nos sous-traitants envoient des ZIP. Avant intégration dans
                  notre CDE interne, nous devons re-baptiser. BimDoc tourne en
                  local sur le poste d’un assistant, sans connexion à notre SI.
                </p>
                <span className="persona-name">— Profil type · EG FR 200+ personnes</span>
              </article>
            </div>
          </section>

          <section className="section" id="tarifs">
            <div className="section-head">
              <div>
                <span className="kicker">Tarifs</span>
                <h2>Un prix pour tester, un prix pour produire, un prix pour l’équipe.</h2>
              </div>
              <p className="section-copy">
                Pas de freemium piégé. La version Free reste utilisable pour
                des lots petits et ponctuels. Pro retire la limite quotidienne.
                Team partage les conventions.
              </p>
            </div>

            <div className="grid-3 pricing">
              <article className="plan">
                <div className="plan-top">
                  <h3>Free</h3>
                  <span className="badge">Pour tester</span>
                </div>
                <p className="price">0 <small>CHF</small></p>
                <p className="muted">3 lots de renommage par jour. Sans compte.</p>
                <ul>
                  <li>Modèles ISO 19650 + SIA inclus</li>
                  <li>Aperçu Avant / Après</li>
                  <li>Traitement local navigateur</li>
                  <li>Export ZIP propre</li>
                </ul>
                <a className="button secondary" href="/app">Essayer maintenant</a>
              </article>

              <article className="plan pro">
                <div className="plan-top">
                  <h3>Pro</h3>
                  <span className="badge">Illimité</span>
                </div>
                <p className="price">19,99 <small>CHF / mois</small></p>
                <p className="muted">Pour les lots réguliers et les conventions de projet.</p>
                <ul>
                  <li>Lots illimités</li>
                  <li>Conventions illimitées sauvegardées</li>
                  <li>Import CSV / Excel d’entités</li>
                  <li>Export JSON / CSV de conventions</li>
                  <li>Support email J+1</li>
                </ul>
                <a className="button primary" href="/pilot">Demander le pilote Pro</a>
              </article>

              <article className="plan team">
                <div className="plan-top">
                  <h3>Team</h3>
                  <span className="badge">Recommandé</span>
                </div>
                <p className="price">34,90 <small>CHF / mois</small></p>
                <p className="muted">Pour les petites équipes qui partagent une convention.</p>
                <ul>
                  <li>Jusqu’à 3 utilisateurs inclus</li>
                  <li>Conventions partagées</li>
                  <li>Onboarding 30 min inclus</li>
                  <li>Import CSV / Excel d’entités</li>
                  <li>Support prioritaire léger</li>
                </ul>
                <a className="button primary" href="/pilot">Planifier Team</a>
              </article>
            </div>

            <p className="small-note" style={{ marginTop: 30 }}>
              Besoin d’un déploiement on-premise, SSO ou DPA Entreprise ?{' '}
              <a href="/pilot" style={{ color: 'var(--brick)', fontWeight: 700 }}>
                Parlons-en →
              </a>
            </p>
          </section>

          <section className="section" id="faq">
            <div className="section-head">
              <div>
                <span className="kicker">FAQ</span>
                <h2>Les questions qu’un BIM Manager pose en premier.</h2>
              </div>
              <p className="section-copy">
                Réponses honnêtes. Si une question manque, écrivez-nous —
                on l’ajoute publiquement ici.
              </p>
            </div>

            <div className="faq">
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="final" id="essayer">
            <div className="section-head">
              <div>
                <span className="kicker">Commencer</span>
                <h2>Du lot brut au ZIP propre, en 60 secondes.</h2>
              </div>
              <p className="section-copy">
                Pas de compte à créer, pas de configuration cloud, pas de carte
                bancaire pour la version Free.
              </p>
            </div>
            <div className="cta-row">
              <a className="button primary" href="/app">Essayer sans compte</a>
              <a className="button secondary" href="/pilot">Demander un pilote</a>
            </div>
          </section>
        </main>
      </div>

      <footer>
        <div className="wrap foot">
          <span>© 2026 BimDoc Renamer — Renommage de livrables BIM ISO 19650 / SIA</span>
          <span>
            <a href="/privacy">Confidentialité</a> ·{' '}
            <a href="/security">Sécurité</a> ·{' '}
            <a href="/pilot">Pilote</a> ·{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </span>
        </div>
      </footer>
    </>
  );
}
