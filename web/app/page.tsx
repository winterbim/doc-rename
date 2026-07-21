import {
  FREE_DAILY_LOTS,
  TEAM_PRICE_EUR,
  CABINET_PRICE_EUR,
  HAS_DIRECT_CHECKOUT,
  PAID_ACCOUNTS_AVAILABLE,
} from '@/lib/pricing';
import { CONTACT_EMAIL } from '@/lib/contact';
import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingPricing } from '@/components/commercial/LandingPricing';


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rename.bimcheck-consulting.com';

export const metadata: Metadata = {
  title: 'BIMCHECK-Rename — Convention de nommage pour équipes',
  description:
    'Appliquez une convention de nommage à vos lots de fichiers. BIM, Juridique, Finance, RH, Santé, Industrie, Immobilier. Sans envoyer vos documents.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    title: 'BIMCHECK-Rename — Convention de nommage pour équipes',
    description:
      'Standardisez les noms de fichiers de votre équipe. Local-first : le renommage et le ZIP restent dans le navigateur.',
    url: siteUrl,
    siteName: 'BIMCHECK-Rename',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIMCHECK-Rename',
    description:
      "Convention de nommage en équipe, sans jamais uploader un document. Essai gratuit.",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      fr: siteUrl,
      'x-default': siteUrl,
    },
  },
  keywords: [
    'convention nommage',
    'standardisation documents',
    'renommage fichiers équipe',
    'ISO 19650',
    'SIA 2051',
    'BIM',
    'Juridique',
    'Avocats',
    'Finance',
    'RH',
    'local-first',
    'Autodesk Docs',
    'Trimble Connect',
    'Kroqi',
  ],
  other: {
    'theme-color': '#0A0F1E',
    'color-scheme': 'dark',
  },
};

const LANDING_CSS = `
  html { scroll-behavior: smooth; }

  body {
    --color-paper: #0A0F1E;
    --color-paper-2: #0E1628;
    --color-paper-3: #152238;
    --color-ink: #E6EDF6;
    --color-ink-soft: #A8B6CA;
    --color-ink-mute: #7F90A8;
    --color-primary: #67E8F9;
    --color-primary-2: rgba(103, 232, 249, .09);
    --color-success: #2DD4BF;
    --color-accent: #818CF8;
    --color-surface: #0E1628;
    --color-surface-2: #111D31;
    --color-border: rgba(148, 163, 184, .16);
    --color-border-2: rgba(103, 232, 249, .28);
    background:
      radial-gradient(circle at 78% 12%, rgba(34, 211, 238, .08), transparent 28rem),
      radial-gradient(circle at 8% 80%, rgba(99, 102, 241, .09), transparent 30rem),
      #0A0F1E;
  }

  .wrap { width: min(1200px, calc(100% - 40px)); margin: 0 auto; }

  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    gap: 24px; padding: 20px 0;
  }

  .brand {
    display: inline-flex; align-items: center; gap: 10px;
    text-decoration: none; font-weight: 700; letter-spacing: -.02em;
  }

  .mark {
    width: 32px; height: 32px; display: grid; place-items: center;
    background: linear-gradient(135deg, #67E8F9, #6366F1); color: #06121F;
    border-radius: 8px; font-size: 12px; font-weight: 800;
    box-shadow: 0 10px 30px -12px rgba(34, 211, 238, .75);
  }

  .brand-name { font-size: 17px; color: var(--color-ink); }
  .brand-sub { color: var(--color-primary); font-weight: 600; margin-left: 4px; }

  .nav {
    display: flex; align-items: center; gap: 24px;
    font-size: 14px; color: var(--color-ink-soft);
  }
  .nav a { text-decoration: none; }
  .nav a:hover { color: var(--color-ink); }

  .pill-link {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 40px; padding: 0 18px; border-radius: 8px;
    background: linear-gradient(135deg, #67E8F9, #6366F1); color: #06121F; text-decoration: none;
    font-weight: 650; font-size: 14px;
    transition: transform .18s ease, background .18s ease;
    box-shadow: 0 12px 32px -14px rgba(34, 211, 238, .7);
  }
  .pill-link:hover { transform: translateY(-1px); filter: brightness(1.08); }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, .95fr);
    gap: clamp(38px, 6vw, 74px); align-items: center;
    padding: clamp(56px, 8vw, 96px) 0 64px;
  }

  .eyebrow {
    display: inline-flex; align-items: center; gap: 10px; margin-bottom: 22px;
    color: var(--color-primary); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
  }
  .eyebrow::before {
    content: ""; width: 8px; height: 8px; border-radius: 99px;
    background: var(--color-success); box-shadow: 0 0 0 4px rgba(16, 185, 129, .18);
  }

  h1 {
    margin: 0; max-width: 16ch;
    font-size: clamp(42px, 6vw, 80px);
    line-height: .98; letter-spacing: -.045em; font-weight: 800;
  }
  h1 em {
    color: var(--color-primary); font-style: normal;
  }

  .lead {
    max-width: 560px; margin: 26px 0 0; color: var(--color-ink-soft);
    font-size: clamp(17px, 1.35vw, 19px); line-height: 1.6;
  }
  .lead strong { color: var(--color-ink); font-weight: 650; }

  .cta-row {
    display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 32px;
  }

  .button {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 48px; padding: 0 22px; border-radius: 10px;
    border: 1px solid transparent; text-decoration: none; font-weight: 650;
    transition: transform .18s ease, background .18s ease, color .18s ease, box-shadow .18s ease;
  }
  .button.primary { background: linear-gradient(135deg, #67E8F9, #6366F1); color: #06121F; box-shadow: 0 12px 32px -14px rgba(34, 211, 238, .7); }
  .button.primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .button.secondary { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-border); }
  .button.secondary:hover { border-color: var(--color-border-2); background: var(--color-surface-2); }

  .small-note {
    margin-top: 18px; color: var(--color-ink-mute); font-size: 14px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .small-note::before {
    content: ""; width: 7px; height: 7px; border-radius: 99px;
    background: var(--color-success); flex-shrink: 0;
  }

  .product-shot {
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); box-shadow: 0 32px 80px -40px rgba(34, 211, 238, .32); overflow: hidden;
  }
  .shot-top {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; border-bottom: 1px solid var(--color-border); padding: 14px 16px; background: var(--color-surface-2);
  }
  .traffic { display: flex; gap: 7px; }
  .traffic span { width: 10px; height: 10px; border-radius: 99px; background: var(--color-border-2); }
  .traffic span:nth-child(1) { background: #ef4444; }
  .traffic span:nth-child(2) { background: #f59e0b; }
  .traffic span:nth-child(3) { background: var(--color-success); }
  .usage { color: var(--color-primary); font-size: 12px; font-weight: 700; }
  .shot-body { padding: 22px; }

  .tool-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .tool-panel { border: 1px solid var(--color-border); border-radius: 12px; background: var(--color-surface); padding: 16px; }
  .tool-panel h2 {
    margin: 0 0 12px; font-size: 12px; letter-spacing: .06em;
    text-transform: uppercase; color: var(--color-ink-mute); font-weight: 700;
  }

  .file-row {
    padding: 9px 0; border-top: 1px solid var(--color-border);
    font-family: var(--font-mono), ui-monospace, monospace;
    font-size: 11.5px; line-height: 1.4;
  }
  .file-row:first-of-type { border-top: 0; }
  .old { color: var(--color-ink-mute); text-decoration: line-through; text-decoration-color: #ef4444; }
  .new { color: #5EEAD4; font-weight: 700; }

  .iso-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .chip {
    border: 1px solid var(--color-border); border-radius: 999px;
    padding: 5px 10px; font-size: 11px; color: var(--color-ink-soft); background: var(--color-surface-2);
  }
  .chip.brick { border-color: var(--color-primary); background: var(--color-primary-2); color: var(--color-primary); font-weight: 700; }

  .section { padding: clamp(64px, 8vw, 104px) 0; border-top: 1px solid var(--color-border); }

  .section-head {
    display: grid; grid-template-columns: minmax(0, .9fr) minmax(280px, .7fr);
    gap: 32px; align-items: end; margin-bottom: 40px;
  }
  .kicker {
    display: block; margin-bottom: 12px; color: var(--color-primary);
    font-size: 12px; font-weight: 750; letter-spacing: .07em; text-transform: uppercase;
  }
  .section h2 {
    margin: 0; font-size: clamp(32px, 4.2vw, 52px); line-height: 1.05;
    letter-spacing: -.035em; font-weight: 600;
  }
  .section-copy { margin: 0; color: var(--color-ink-soft); font-size: 17px; line-height: 1.6; }

  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }

  .card {
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); padding: 26px;
  }
  .card strong {
    display: block; margin-bottom: 8px; color: var(--color-ink);
    font-size: 18px; letter-spacing: -.015em; font-weight: 650;
  }
  .card p { margin: 0; color: var(--color-ink-soft); line-height: 1.55; }

  .steps { counter-reset: step; }
  .step { counter-increment: step; position: relative; padding-top: 54px; }
  .step::before {
    content: "0" counter(step); position: absolute; top: 0; left: 0;
    color: var(--color-primary); font-size: 40px; line-height: 1; font-weight: 700; letter-spacing: -.04em;
  }

  .proof-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 28px; }
  .proof {
    border-left: 3px solid var(--color-primary); padding: 12px 16px; background: var(--color-surface);
    border-radius: 8px;
  }
  .proof strong { display: block; font-size: 22px; color: var(--color-ink); letter-spacing: -.025em; font-weight: 650; }
  .proof span { font-size: 13px; color: var(--color-ink-mute); }

  .roi-grid {
    display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(300px, .95fr);
    gap: 18px; align-items: stretch;
  }
  .roi-card {
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); padding: 28px;
  }
  .roi-card.dark {
    background: #08101F; color: #E6EDF6; border-color: rgba(103, 232, 249, .2);
  }
  .roi-label {
    display: block; margin-bottom: 10px; color: var(--color-primary);
    font-size: 12px; font-weight: 760; text-transform: uppercase; letter-spacing: .06em;
  }
  .dark .roi-label { color: var(--color-accent); }
  .roi-number {
    margin: 0; font-size: clamp(36px, 4.5vw, 56px);
    line-height: 1; font-weight: 600; letter-spacing: -.04em;
  }
  .roi-card p { margin: 14px 0 0; color: var(--color-ink-soft); line-height: 1.6; }
  .roi-card.dark p { color: rgba(248, 250, 252, .72); }
  .ledger {
    margin-top: 24px; border-top: 1px solid var(--color-border);
    display: grid;
  }
  .ledger-row {
    display: flex; justify-content: space-between; gap: 18px;
    border-bottom: 1px solid var(--color-border);
    padding: 12px 0; color: var(--color-ink-soft); font-size: 14px;
  }
  .ledger-row strong { color: var(--color-ink); font-weight: 650; }
  .dark .ledger { border-color: rgba(248, 250, 252, .14); }
  .dark .ledger-row { border-color: rgba(248, 250, 252, .14); color: rgba(248, 250, 252, .68); }
  .dark .ledger-row strong { color: white; }

  .compare-table {
    width: 100%; border-collapse: collapse;
    background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; overflow: hidden;
  }
  .compare-table th, .compare-table td {
    padding: 14px 16px; text-align: left; border-bottom: 1px solid var(--color-border);
    font-size: 14px; color: var(--color-ink-soft);
  }
  .compare-table th { background: var(--color-surface-2); font-weight: 650; color: var(--color-ink); font-size: 13px; }
  .compare-table thead th { white-space: nowrap; }
  .compare-table th:first-child, .compare-table td:first-child { color: var(--color-ink); font-weight: 620; }
  .compare-table .us { background: var(--color-primary-2); }
  .compare-table .us-cell { color: var(--color-primary); font-weight: 700; }
  .ok::before { content: "✓ "; color: var(--color-success); font-weight: 800; }
  .no::before { content: "✗ "; color: #ef4444; font-weight: 800; }

  .security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; }
  .security-list { margin: 0; padding: 0; list-style: none; display: grid; gap: 12px; color: var(--color-ink-soft); }
  .security-list li { padding-left: 26px; position: relative; }
  .security-list li::before { content: "✓"; position: absolute; left: 0; color: var(--color-success); font-weight: 800; }
  .security-list li strong { color: var(--color-ink); font-weight: 650; }

  .devtools {
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); box-shadow: 0 24px 60px -36px rgba(15, 23, 42, .2); overflow: hidden;
  }
  .devtools-top {
    background: var(--color-surface-2); border-bottom: 1px solid var(--color-border);
    padding: 10px 16px; font-family: var(--font-mono), ui-monospace, monospace;
    font-size: 11px; color: var(--color-ink-mute);
    display: flex; align-items: center; gap: 8px;
  }
  .devtools-body { padding: 18px 22px; font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px; }
  .devtools-body .req { padding: 6px 0; border-bottom: 1px dashed var(--color-border); display: flex; justify-content: space-between; gap: 12px; }
  .devtools-body .req:last-child { border-bottom: 0; }
  .devtools-body .req .status { color: var(--color-success); font-weight: 700; }
  .devtools-body .filter { color: var(--color-primary); font-weight: 700; margin-top: 10px; padding-top: 10px; border-top: 2px solid var(--color-ink); }

  .persona-card {
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); padding: 26px; display: flex; flex-direction: column; gap: 14px;
  }
  .persona-role { color: var(--color-primary); font-size: 11px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
  .persona-quote { margin: 0; font-size: 16px; color: var(--color-ink); line-height: 1.55; }
  .persona-quote::before { content: "“"; font-size: 32px; color: var(--color-primary); display: block; line-height: .5; font-weight: 700; }
  .persona-name { color: var(--color-ink-mute); font-size: 13px; font-style: italic; }

  .pricing { align-items: stretch; }
  .plan {
    display: flex; flex-direction: column; min-height: 100%;
    border: 1px solid var(--color-border); border-radius: 16px;
    background: var(--color-surface); padding: 26px;
  }
  .plan.pro { border-color: rgba(129, 140, 248, .3); background: #0B1224; color: #E6EDF6; }
  .plan.team { border-color: var(--color-primary); background: rgba(103, 232, 249, .06); box-shadow: 0 18px 50px -30px rgba(34, 211, 238, .32); }
  .plan-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 22px; }
  .plan h3 { margin: 0; font-size: 24px; letter-spacing: -.03em; font-weight: 650; }
  .badge {
    border: 1px solid currentColor; border-radius: 999px; padding: 5px 10px;
    color: var(--color-primary); font-size: 11px; font-weight: 750; white-space: nowrap;
  }
  .pro .badge { color: var(--color-accent); }
  .team .badge { color: var(--color-primary); }
  .price { margin: 0 0 8px; font-size: 44px; line-height: 1; letter-spacing: -.04em; font-weight: 600; }
  .price small { font-size: 15px; color: var(--color-ink-mute); letter-spacing: 0; font-weight: 500; }
  .pro .price small, .pro .muted, .pro li { color: rgba(248, 250, 252, .72); }
  .muted { color: var(--color-ink-soft); margin: 0; font-size: 14px; }
  .plan ul { margin: 22px 0 26px; padding: 0; list-style: none; display: grid; gap: 10px; }
  .plan li { color: var(--color-ink-soft); padding-left: 22px; position: relative; font-size: 14px; }
  .plan li::before {
    content: ""; width: 7px; height: 7px; border-radius: 99px; background: var(--color-success);
    position: absolute; left: 0; top: .55em;
  }
  .pro li::before { background: var(--color-accent); }
  .plan .button { margin-top: auto; width: fit-content; }
  .pro .button.primary { background: var(--color-surface); color: var(--color-ink); border-color: var(--color-border); }
  .pro .button.primary:hover { background: var(--color-accent); border-color: var(--color-accent); color: #06121F; }
  .team .button.primary { background: linear-gradient(135deg, #67E8F9, #6366F1); border-color: transparent; color: #06121F; }
  .team .button.primary:hover { filter: brightness(1.08); }
  .paid-pilot {
    margin-top: 22px; border: 1px solid rgba(103, 232, 249, .2); border-radius: 16px;
    background: #08101F; color: #E6EDF6; padding: 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 24px;
  }
  .paid-pilot strong { display: block; font-size: 22px; letter-spacing: -.02em; font-weight: 650; }
  .paid-pilot p { margin: 6px 0 0; color: rgba(248, 250, 252, .7); font-size: 14px; }
  .paid-pilot .button.primary { background: var(--color-accent); color: #06121F; border-color: var(--color-accent); flex-shrink: 0; }
  .paid-pilot .button.primary:hover { background: #A5B4FC; border-color: #A5B4FC; }

  .faq { display: grid; gap: 0; border-top: 1px solid var(--color-border); }
  details { border-bottom: 1px solid var(--color-border); padding: 20px 0; }
  summary { cursor: pointer; font-weight: 650; font-size: 17px; letter-spacing: -.01em; color: var(--color-ink); }
  details p { max-width: 760px; margin: 12px 0 0; color: var(--color-ink-soft); line-height: 1.6; }

  .final {
    background: linear-gradient(145deg, #08101F, #111A35); color: #E6EDF6;
    padding: clamp(54px, 7vw, 84px); border-radius: 24px; margin-bottom: 44px;
  }
  .final h2 { max-width: 14ch; color: #E6EDF6; }
  .final .section-copy { color: rgba(248, 250, 252, .72); }
  .final .button.primary { background: var(--color-accent); color: #06121F; }
  .final .button.primary:hover { background: #A5B4FC; }
  .final .button.secondary { color: #E6EDF6; border-color: rgba(248, 250, 252, .3); background: transparent; }
  .final .button.secondary:hover { background: rgba(248, 250, 252, .08); color: #FFFFFF; border-color: rgba(248, 250, 252, .55); }

  footer {
    border-top: 1px solid var(--color-border); padding: 30px 0 42px;
    color: var(--color-ink-mute); font-size: 14px;
  }
  .foot { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
  .foot a { color: var(--color-ink-soft); text-decoration: none; }
  .foot a:hover { color: var(--color-ink); }

  @media (max-width: 900px) {
    .nav { display: none; }
    .hero, .section-head, .grid-3, .grid-2, .security-grid, .proof-row, .roi-grid { grid-template-columns: 1fr; }
    .paid-pilot { align-items: flex-start; flex-direction: column; }
    .tool-grid { grid-template-columns: 1fr; }
    h1 { max-width: 100%; font-size: 44px; }
    .compare-table { display: block; overflow-x: auto; white-space: nowrap; }
  }

  @media (max-width: 560px) {
    .wrap { width: min(100% - 28px, 1200px); }
    h1 { font-size: 38px; }
    .shot-body, .card, .plan, .persona-card { padding: 18px; }
    .price { font-size: 36px; }
    .final { padding: 34px 20px; }
  }
`;

const SOFTWARE_APPLICATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'BIMCHECK-Rename',
  alternateName: 'BIMCHECK',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  description:
    "Standardisation des noms de fichiers en équipe. BIM, Juridique, Finance, RH, Santé, Industrie, Immobilier. Traitement local navigateur.",
  audience: {
    '@type': 'BusinessAudience',
    name: 'BIM Managers, coordinateurs BIM, juristes, cabinets, bureaux d’études',
  },
  applicationSubCategory: 'document naming standardization',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      description: `${FREE_DAILY_LOTS} lots de renommage par jour, sans compte.`,
    },
    ...(HAS_DIRECT_CHECKOUT
      ? [
          {
            '@type': 'Offer',
            name: 'Team',
            price: String(TEAM_PRICE_EUR),
            priceCurrency: 'EUR',
            description:
              'Lots illimités, support email, licence activée automatiquement après paiement Stripe.',
          },
          {
            '@type': 'Offer',
            name: 'Cabinet',
            price: String(CABINET_PRICE_EUR),
            priceCurrency: 'EUR',
            description:
              'Volume multi-équipes, support prioritaire, licence activée automatiquement.',
          },
          {
            '@type': 'Offer',
            name: 'Pilote 14 jours',
            price: '49',
            priceCurrency: 'EUR',
            description: 'Paiement unique, accès illimité 14 jours et onboarding guidé.',
          },
        ]
      : []),
  ],
};

const faqs = [
  {
    question: 'À qui s’adresse BIMCHECK-Rename ?',
    answer:
      'À toute équipe qui standardise des noms de fichiers avant dépôt, archivage ou partage : juridique, finance, RH, santé, industrie, immobilier, BIM / construction, et plus. Des profils métier prêts à l’emploi sont inclus ; vous les adaptez à votre convention interne.',
  },
  {
    question: 'Remplace-t-il notre GED, Drive ou outil métier ?',
    answer:
      'Non. BIMCHECK-Rename prépare un lot propre (noms + ZIP) que vous déposez ensuite où vous travaillez déjà : GED, Drive, boîte mail, plateforme projet. Il ne remplace ni le stockage ni le workflow d’approbation.',
  },
  {
    question: 'Mes fichiers restent-ils vraiment dans mon navigateur ?',
    answer:
      'Oui, et c’est vérifiable. Pendant un renommage, le contenu des fichiers n’est pas envoyé au serveur. Ouvrez DevTools → Réseau pour le contrôler. Détails techniques sur la page Sécurité.',
  },
  {
    question: 'Quels formats puis-je renommer ?',
    answer:
      'PDF, Word, Excel, images, archives ZIP et de nombreux formats métier (plans, maquettes, tableurs, etc.). L’outil renomme les fichiers : il ne modifie pas le contenu interne des documents.',
  },
  {
    question: 'Puis-je importer ma propre liste d’entités (clients, sociétés, codes) ?',
    answer:
      'Oui — CSV, Excel, ODS, ou copier-coller depuis un tableur. Des listes de départ sont fournies, puis tout reste personnalisable champ par champ.',
  },
  {
    question: 'Free, Team, Cabinet : que paie-t-on vraiment ?',
    answer: HAS_DIRECT_CHECKOUT
      ? 'Free : 5 lots par jour, sans compte. Team (19 €/mois) et Cabinet (49 €/mois) : lots illimités après paiement Stripe, licence activée automatiquement sur le navigateur. Le pilote 14 jours est un paiement unique avec onboarding.'
      : 'Free : 5 lots par jour, sans compte. Les offres payantes lèvent la limite quotidienne dès que le paiement en ligne est disponible.',
  },
  {
    question: 'Comment la licence payante s’active-t-elle ?',
    answer: HAS_DIRECT_CHECKOUT
      ? 'Après paiement Stripe, la page /merci active automatiquement la licence (lots illimités) sur ce navigateur — sans compte obligatoire et sans validation manuelle de notre part.'
      : 'Dès que le paiement en ligne est ouvert, l’activation est automatique après confirmation Stripe.',
  },
  {
    question: 'Et le RGPD / la confidentialité ?',
    answer:
      'Le renommage ne s’appuie pas sur un upload de vos documents. Le paiement est traité par Stripe. Une demande commerciale (formulaire pilote) ne contient que les coordonnées et le besoin saisis — jamais le contenu de vos fichiers. Voir la politique de confidentialité.',
  },
  {
    question: 'Que se passe-t-il si le service s’arrête un jour ?',
    answer:
      'Vos conventions sont exportables en JSON ou CSV à tout moment. Vous gardez vos règles et vos fichiers. Pas de verrou propriétaire sur votre travail.',
  },
  {
    question: 'Besoin d’un déploiement dédié ou d’un grand compte ?',
    answer:
      'SSO, DPA ou on-premise ne sont pas en self-serve aujourd’hui. Décrivez le besoin via le pilote ou le contact : toute option spécifique se confirme par écrit.',
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
          <Link href="/" className="brand">
            <span className="mark" aria-hidden="true">BC</span>
            <span className="brand-name">
              BIMCHECK <span className="brand-sub">Rename</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Navigation principale">
            <a href="#probleme">Problème</a>
            <a href="#fonctionnement">Comment</a>
            <a href="#vertical">Métiers</a>
            <a href="#securite">Sécurité</a>
            <a href="#tarifs">Tarifs</a>
            <a href="/pricing">Offres</a>
            <a href="#faq">FAQ</a>
          </nav>

          <a className="pill-link" href="/app">Essayer sans compte</a>
        </header>

        <main>
          <section className="hero">
            <div>
              <span className="eyebrow">
                {HAS_DIRECT_CHECKOUT
                  ? 'Disponible · Local-first · Paiement Stripe'
                  : 'Local-first · Sans compte'}
              </span>
              <h1>
                La même convention de nommage, <em>appliquée sans improviser.</em>
              </h1>
              <p className="lead">
                BIM, Juridique, Finance, RH, Santé, Industrie, Immobilier.
                Composez les règles, contrôlez l’aperçu puis exportez un ZIP.
                <strong> Aucun fichier ne quitte le navigateur</strong> pendant ce flux.
                {HAS_DIRECT_CHECKOUT
                  ? ' Free pour tester ; Team et Cabinet se paient en ligne — licence activée automatiquement après paiement.'
                  : ' La configuration reste locale et exportable.'}
              </p>

              <div className="cta-row">
                <a className="button primary" href="/app">Essayer maintenant — sans compte</a>
                <a className="button secondary" href="/pricing">
                  {HAS_DIRECT_CHECKOUT ? 'Voir les tarifs' : 'Voir les offres'}
                </a>
              </div>
              <p className="small-note">
                {HAS_DIRECT_CHECKOUT
                  ? `Free ${FREE_DAILY_LOTS} lots/jour · Team ${TEAM_PRICE_EUR} €/mois · licence auto · fichiers 100 % locaux`
                  : `Gratuit · ${FREE_DAILY_LOTS} lots/jour · fichiers 100 % locaux (DevTools > Réseau)`}
              </p>
            </div>

            <aside className="product-shot" aria-label="Aperçu produit BIMCHECK-Rename">
              <div className="shot-top">
                <div className="traffic" aria-hidden="true"><span></span><span></span><span></span></div>
                <span className="usage">Convention active · Dossier client</span>
              </div>
              <div className="shot-body">
                <div className="tool-grid">
                  <div className="tool-panel">
                    <h2>Avant</h2>
                    <div className="file-row old">acte cession final v2.pdf</div>
                    <div className="file-row old">piece 3 signee.pdf</div>
                    <div className="file-row old">CR reunion 0507.docx</div>
                    <div className="file-row old">contrat - client A.pdf</div>
                  </div>
                  <div className="tool-panel">
                    <h2>Après</h2>
                    <div className="file-row new">DUPONT_ACTE_CESSION_20260705_V02.pdf</div>
                    <div className="file-row new">DUPONT_DOSSIER_PIECE_003_V01.pdf</div>
                    <div className="file-row new">DUPONT_DOSSIER_CR_20260705_V01.docx</div>
                    <div className="file-row new">DUPONT_DOSSIER_CTR_20260705_V01.pdf</div>
                  </div>
                </div>
                <div className="iso-strip" aria-label="Profils supportés">
                  <span className="chip brick">Juridique</span>
                  <span className="chip">BIM</span>
                  <span className="chip">Finance</span>
                  <span className="chip">RH</span>
                  <span className="chip">Santé</span>
                  <span className="chip">Industrie</span>
                </div>
              </div>
            </aside>
          </section>

          <section className="section" id="probleme">
            <div className="section-head">
              <div>
                <span className="kicker">Le vrai problème</span>
                <h2>Chacun renomme à sa façon. Vos dossiers en payent le prix.</h2>
              </div>
              <p className="section-copy">
                Dans chaque équipe, chaque personne a sa propre méthode :
                dates en début ou en fin, abréviations différentes, espaces,
                accents, versions oubliées. Résultat : perte de temps,
                erreurs avant livraison, et une image désordonnée auprès des
                clients, des partenaires ou des auditeurs.
              </p>
            </div>

            <div className="proof-row">
              <div className="proof">
                <strong>2 h 40</strong>
                <span>estimation à 2 minutes par fichier sur un lot de 80</span>
              </div>
              <div className="proof">
                <strong>À mesurer</strong>
                <span>sur votre lot et votre convention, sans promesse de gain prédéfini</span>
              </div>
              <div className="proof">
                <strong>0 upload</strong>
                <span>les fichiers restent dans le navigateur</span>
              </div>
            </div>
          </section>

          <section className="section" id="rentabilite">
            <div className="section-head">
              <div>
                <span className="kicker">Rentabilité</span>
                <h2>Mesurez le gain avant de justifier un prix.</h2>
              </div>
              <p className="section-copy">
                BIMCHECK-Rename ne vend pas un simple renommage. Il vend le
                temps récupéré, moins d’erreurs avant livraison, et une
                convention que toute l’équipe applique sans improviser.
              </p>
            </div>

            <div className="roi-grid">
              <article className="roi-card dark">
                <span className="roi-label">Exemple de calcul — pas une promesse</span>
                <p className="roi-number">80 fichiers</p>
                <p>
                  À 2 minutes de contrôle et renommage manuel par fichier, un lot
                  absorbe environ 2 h 40. À 80 € / h chargé, cela représente
                  213 € de temps interne avant même le risque d’erreur.
                </p>
                <div className="ledger">
                  <div className="ledger-row"><span>Temps manuel estimé</span><strong>2 h 40</strong></div>
                  <div className="ledger-row"><span>Coût interne du lot</span><strong>~213 €</strong></div>
                  <div className="ledger-row"><span>Prix Team mensuel</span><strong>{TEAM_PRICE_EUR} €</strong></div>
                </div>
              </article>

              <article className="roi-card">
                <span className="roi-label">Décision fondée sur votre test</span>
                <p className="roi-number">Votre mesure</p>
                <p>
                  Comparez le temps réellement observé avant et après sur le même lot.
                  Une offre payante ne devient pertinente que si ce test montre un gain
                  supérieur à son coût pour votre organisation.
                </p>
                <div className="cta-row">
                  <a className="button primary" href="/app">Tester sur un lot exemple</a>
                  <a className="button secondary" href="/pricing">Voir les tarifs</a>
                </div>
              </article>
            </div>
          </section>

          <section className="section" id="fonctionnement">
            <div className="section-head">
              <div>
                <span className="kicker">Comment ça marche</span>
                <h2>Trois actions, pas une plateforme à apprendre.</h2>
              </div>
              <p className="section-copy">
                BIMCHECK-Rename fait une chose : appliquer une convention de
                nommage propre à un lot de fichiers. Pas de workflow,
                pas d’approbation. Vous repartez avec un ZIP propre.
              </p>
            </div>

            <div className="grid-3 steps">
              <article className="card step">
                <strong>Importez</strong>
                <p>
                  Glissez votre dossier projet, un ZIP ou des fichiers individuels.
                  PDF, DOCX, IFC, DWG, DXF, RVT, images, tableurs.
                  <em style={{ color: 'var(--color-primary)', fontStyle: 'normal' }}> Aucun upload</em> — tout est lu dans le navigateur.
                </p>
              </article>
              <article className="card step">
                <strong>Composez votre convention</strong>
                <p>
                  Choisissez votre métier : BIM, Juridique, Finance, RH, Santé,
                  Industrie, Immobilier. Puis adaptez les champs, les abréviations
                  et le séparateur. Importez vos entités par CSV/Excel.
                </p>
              </article>
              <article className="card step">
                <strong>Contrôlez et exportez</strong>
                <p>
                  Aperçu Avant / Après ligne par ligne, correction manuelle possible.
                  Téléchargez un ZIP propre avec arborescence intacte.
                  {HAS_DIRECT_CHECKOUT
                    ? ' En Team / Cabinet, lots illimités dès activation auto de la licence.'
                    : ' Vous pouvez aussi exporter la convention en JSON / CSV.'}
                </p>
              </article>
            </div>
          </section>

          <section className="section" id="vertical">
            <div className="section-head">
              <div>
                <span className="kicker">Par métier</span>
                <h2>Des templates prêts pour chaque équipe.</h2>
              </div>
              <p className="section-copy">
                Chaque vertical a ses contraintes. BIMCHECK-Rename embarque des
                modèles de départ pensés par métier, que vous adaptez à votre
                convention interne.
              </p>
            </div>

            <div className="grid-3">
              <article className="card">
                <strong>Juridique</strong>
                <p>Actes de cession, contrats, dossiers clients, procédures, pièces. Numérotation claire et traçable.</p>
              </article>
              <article className="card">
                <strong>BIM / Construction</strong>
                <p>ISO 19650, SIA 2051, BIM France. Plans, maquettes, rapports techniques et dépôts CDE.</p>
              </article>
              <article className="card">
                <strong>Finance</strong>
                <p>Factures, justificatifs, clôtures, rapports financiers, budgets. Classement par entité et période.</p>
              </article>
              <article className="card">
                <strong>RH</strong>
                <p>Contrats, fiches de paie, attestations, entretiens annuels, formations. Dossier collaborateur.</p>
              </article>
              <article className="card">
                <strong>Santé</strong>
                <p>Procédures, protocoles, documents qualité, audits internes. Traçabilité et versionning.</p>
              </article>
              <article className="card">
                <strong>Industrie & Immobilier</strong>
                <p>Fiches techniques, maintenance, diagnostics, baux, états des lieux. Documentation équipement et bien.</p>
              </article>
            </div>
          </section>

          <section className="section" id="comparatif">
            <div className="section-head">
              <div>
                <span className="kicker">Différenciation</span>
                <h2>Pourquoi BIMCHECK-Rename plutôt que…</h2>
              </div>
              <p className="section-copy">
                Un outil ciblé fait mieux qu’une plateforme générique sur un job
                précis. Voici comparé honnêtement aux alternatives que les
                équipes utilisent aujourd’hui.
              </p>
            </div>

            <div
              style={{ overflowX: 'auto' }}
              role="region"
              aria-label="Comparaison avec les méthodes alternatives"
              tabIndex={0}
            >
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col">Critère</th>
                    <th scope="col" className="us-cell">BIMCHECK-Rename</th>
                    <th scope="col">Macro Excel maison</th>
                    <th scope="col">Renommage manuel</th>
                    <th scope="col">Plateforme CDE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Compte requis</td><td className="us"><span className="no">Non en Free</span></td><td><span className="no">Non</span></td><td><span className="no">Non</span></td><td><span className="ok">Oui</span></td></tr>
                  <tr><td>Fichiers envoyés en ligne</td><td className="us"><span className="no">Non — navigateur</span></td><td><span className="no">Non</span></td><td><span className="no">Non</span></td><td><span className="ok">Oui</span></td></tr>
                  <tr><td>Profils métier pré-câblés</td><td className="us"><span className="ok">7 métiers</span></td><td><span className="no">Aucun</span></td><td><span className="no">Aucun</span></td><td><span className="ok">BIM</span></td></tr>
                  <tr><td>Import CSV / Excel d’entités</td><td className="us"><span className="ok">Oui</span></td><td><span className="ok">Oui mais fragile</span></td><td><span className="no">Non</span></td><td>Via API</td></tr>
                  <tr><td>Aperçu Avant / Après</td><td className="us"><span className="ok">Oui</span></td><td><span className="no">Non</span></td><td><span className="no">Non</span></td><td>Partiel</td></tr>
                  <tr><td>Sync convention équipe</td><td className="us"><span className={PAID_ACCOUNTS_AVAILABLE ? 'ok' : 'no'}>{PAID_ACCOUNTS_AVAILABLE ? 'Team / Cabinet' : 'Export JSON (sync compte à venir)'}</span></td><td><span className="no">Non native</span></td><td><span className="no">Non</span></td><td><span className="ok">Selon plateforme</span></td></tr>
                  <tr><td>Prise en main</td><td className="us"><span className="ok">Essai autonome</span></td><td>Configuration interne</td><td>Immédiate</td><td>Selon plateforme</td></tr>
                  <tr><td>Tarif d’entrée publié</td><td className="us us-cell">{HAS_DIRECT_CHECKOUT ? `Free · Team ${TEAM_PRICE_EUR} €/mois` : `Free · Team ${TEAM_PRICE_EUR} €/mois`}</td><td>Temps interne</td><td>Temps interne</td><td>Selon offre</td></tr>
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
                {PAID_ACCOUNTS_AVAILABLE
                  ? 'Seul le JSON de la convention peut transiter en cloud avec un compte Team ou Cabinet.'
                  : 'La configuration et les fichiers restent locaux ; le paiement Stripe n’envoie jamais vos documents.'}
              </p>
            </div>

            <div className="security-grid">
              <ul className="security-list">
                <li><strong>Traitement 100 % navigateur</strong> — lecture, parsing, renommage et export ZIP côté client.</li>
                <li><strong>Aucune requête sortante de contenu</strong> — visible en direct dans DevTools &gt; Réseau.</li>
                <li><strong>Règles locales et exportables</strong> — JSON / CSV à tout moment ; sync multi-comptes en option future.</li>
                <li><strong>Headers HTTP audités</strong> — HSTS deux ans, X-Frame-Options DENY, CSP stricte.</li>
                <li><strong>CI sécurité automatique</strong> — CodeQL, OWASP ZAP et Lighthouse selon leurs workflows.</li>
                <li><strong>Export conventions</strong> — JSON / CSV à tout moment, pas de verrou.</li>
                <li><strong>Hébergement du site</strong> — Vercel ; vos documents ne sont pas envoyés pendant le renommage local.</li>
              </ul>
              <div className="devtools" aria-hidden="true">
                <div className="devtools-top">
                  <span style={{ color: 'var(--color-primary)' }}>●</span> Illustration — DevTools · Network
                </div>
                <div className="devtools-body">
                  <div className="req"><span>GET /</span><span className="status">200</span></div>
                  <div className="req"><span>GET /app</span><span className="status">200</span></div>
                  <div className="req"><span>GET /_next/static/chunks/main.js</span><span className="status">200</span></div>
                  <div className="req"><span>GET /pdf.worker.min.mjs</span><span className="status">200</span></div>
                  <div className="filter">▼ filtre : renommage en cours</div>
                  <div className="req" style={{ color: 'var(--color-ink-mute)' }}>
                    <span style={{ fontStyle: 'italic' }}>aucune requête sortante</span>
                    <span style={{ color: 'var(--color-success)' }}>✓</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="small-note" style={{ marginTop: 28 }}>
              <a href="/security" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
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
                Les scénarios ci-dessous sont fictifs et servent uniquement à illustrer
                des usages possibles. Ce ne sont ni des témoignages clients ni des résultats mesurés.
              </p>
            </div>

            <div className="grid-3">
              <article className="persona-card">
                <span className="persona-role">Cabinet d’avocats · 8 associés</span>
                <p className="persona-quote">
                  Un cabinet peut préparer une convention commune, la tester sur un lot
                  non sensible et mesurer si elle réduit les reprises avant audit.
                </p>
                <span className="persona-name">— Scénario fictif · cabinet de 8 avocats</span>
              </article>
              <article className="persona-card">
                <span className="persona-role">BIM Coordinator · Agence d’architecture</span>
                <p className="persona-quote">
                  Une agence qui livre 80 fichiers par jalon peut comparer son temps de
                  préparation manuel avec un lot renommé dans l’atelier local.
                </p>
                <span className="persona-name">— Scénario fictif · agence de 18 personnes</span>
              </article>
              <article className="persona-card">
                <span className="persona-role">DAF · PME industrielle</span>
                <p className="persona-quote">
                  Une PME peut construire une règle pour ses justificatifs puis vérifier,
                  sur ses propres données, si le classement devient plus régulier.
                </p>
                <span className="persona-name">— Scénario fictif · PME de 45 salariés</span>
              </article>
            </div>
          </section>

          <section className="section" id="tarifs">
            <div className="section-head">
              <div>
                <span className="kicker">Tarifs</span>
                <h2>Des prix bas pour ne pas freiner l’équipe.</h2>
              </div>
              <p className="section-copy">
                {HAS_DIRECT_CHECKOUT
                  ? `Free pour tester. Team ${TEAM_PRICE_EUR} €/mois et Cabinet ${CABINET_PRICE_EUR} €/mois se paient en ligne (Stripe) — licence activée automatiquement. Devise d’affichage EUR / CHF / USD ci-dessous.`
                  : 'Free est ouvert pour mesurer le gain. Les offres payantes s’affichent dès que le paiement en ligne est branché.'}
              </p>
            </div>

            <LandingPricing />
          </section>

          <section className="section" id="faq">
            <div className="section-head">
              <div>
                <span className="kicker">FAQ</span>
                <h2>Les questions les plus fréquentes.</h2>
              </div>
              <p className="section-copy">
                Réponses directes, multi-métiers. Une question manque ?
                Écrivez-nous — on l’ajoute ici.
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
                <h2>Du lot brut au ZIP propre, dans un même atelier local.</h2>
              </div>
              <p className="section-copy">
                Free sans compte ni carte. Team et Cabinet se paient en ligne quand vous êtes
                convaincu — licence activée automatiquement, fichiers toujours locaux.
              </p>
            </div>
            <div className="cta-row">
              <a className="button primary" href="/app">Essayer sans compte</a>
              <a className="button secondary" href="/pricing">
                {HAS_DIRECT_CHECKOUT ? `Passer à Team — ${TEAM_PRICE_EUR} €/mois` : 'Voir les tarifs'}
              </a>
            </div>
          </section>
        </main>
      </div>

      <footer>
        <div className="wrap foot">
          <span>© 2026 BIMCHECK-Rename — Convention de nommage pour équipes</span>
          <span>
            <a href="/pricing">Tarifs</a> ·{' '}
            <a href="/mentions-legales">Mentions légales</a> ·{' '}
            <a href="/privacy">Confidentialité</a> ·{' '}
            <a href="/conditions">CGU / CGV</a> ·{' '}
            <a href="/security">Sécurité</a> ·{' '}
            <a href="/pilot">Pilote</a> ·{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>Contact</a>
          </span>
        </div>
      </footer>
    </>
  );
}
