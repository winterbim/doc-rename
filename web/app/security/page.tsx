import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sécurité — BimDoc Renamer',
  description:
    "Audit sécurité de BimDoc Renamer : architecture local-first, CSP stricte, headers HTTP audités, scans CodeQL et OWASP ZAP en CI. Vérifiable dans DevTools > Réseau.",
  alternates: {
    canonical: '/security',
  },
};

const sections = [
  { href: '#architecture', label: 'Architecture' },
  { href: '#headers', label: 'Headers HTTP' },
  { href: '#csp', label: 'CSP' },
  { href: '#ci', label: 'CI Sécurité' },
  { href: '#deps', label: 'Dépendances' },
  { href: '#incident', label: 'Incidents' },
  { href: '#entreprise', label: 'Entreprise' },
  { href: '#audit', label: 'Auditer vous-même' },
];

const headers: Array<{ name: string; value: string; why: string }> = [
  {
    name: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
    why: 'Force HTTPS pendant 2 ans, soumis à la HSTS preload list.',
  },
  {
    name: 'X-Frame-Options',
    value: 'DENY',
    why: 'Empêche tout embed dans un iframe → bloque le clickjacking.',
  },
  {
    name: 'X-Content-Type-Options',
    value: 'nosniff',
    why: 'Empêche le navigateur de deviner le MIME → bloque les attaques MIME-sniffing.',
  },
  {
    name: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
    why: "Limite ce qui fuite dans le header Referer vers d’autres origines.",
  },
  {
    name: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    why: 'Désactive toutes les API navigateur sensibles, dont FLoC.',
  },
  {
    name: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: blob:; …",
    why: 'Verrouille les origines autorisées pour scripts, styles, images, fonts, connect.',
  },
];

const ciChecks: Array<{ name: string; what: string; when: string }> = [
  {
    name: 'CodeQL',
    what: 'Analyse statique JavaScript/TypeScript par GitHub.',
    when: 'À chaque push et chaque PR sur main.',
  },
  {
    name: 'OWASP ZAP Baseline',
    what: 'Scan dynamique passif sur l’instance Vercel preview.',
    when: 'À chaque PR ouverte vers main.',
  },
  {
    name: 'Lighthouse CI',
    what: 'Audit performance, accessibilité, bonnes pratiques, SEO.',
    when: 'À chaque PR ouverte vers main.',
  },
  {
    name: 'npm audit (omit dev)',
    what: 'Vulnérabilités connues sur les dépendances de production.',
    when: 'Au build de production et avant chaque déploiement.',
  },
  {
    name: 'TypeScript --noEmit',
    what: 'Vérification de types stricte (noUncheckedIndexedAccess, strict).',
    when: 'Pre-commit hook + CI.',
  },
];

const auditSteps: string[] = [
  "Ouvrez https://bimdoc-renamer.vercel.app/app dans un onglet vierge.",
  'Ouvrez les DevTools du navigateur (F12 ou ⌘⌥I).',
  "Allez dans l’onglet Réseau (Network), filtre « Fetch / XHR ».",
  'Glissez 10 fichiers PDF/DWG/IFC sur la zone de dépôt.',
  "Composez une convention puis cliquez sur « Renommer tout ».",
  "Cliquez sur « Télécharger tout (ZIP) ».",
  'Constat attendu : aucune requête sortante ne contient le contenu de vos fichiers. Seuls les assets statiques de l’app sont chargés (JS, CSS, fonts).',
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-sm font-sans font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
          ← Retour à BimDoc Renamer
        </Link>

        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Sécurité · Architecture local-first
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Vérifiez vous-même. <em className="font-serif italic font-normal text-brick">Ouvrez l’onglet Réseau.</em>
          </h1>
          <p className="mt-5 max-w-3xl font-sans text-xl leading-8 text-ink-soft">
            BimDoc Renamer traite les fichiers à 100 % dans votre navigateur.
            Aucune requête sortante de contenu pendant un renommage — c’est
            mesurable, et c’est notre première ligne de défense.
            Cette page documente tout ce que vous pouvez auditer.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">
            Dernière mise à jour : 2026-05-20.
          </p>
        </header>

        <nav
          aria-label="Sommaire sécurité"
          className="sticky top-0 z-10 -mx-6 mt-8 flex flex-wrap gap-1 border-b border-line bg-paper/95 px-6 py-3 text-xs font-sans backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
        >
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-full border border-line bg-white px-3 py-1 font-medium text-ink-soft transition-colors hover:border-brick hover:text-brick"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <section id="architecture" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            1. Architecture local-first
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Le cœur de BimDoc Renamer est une application Next.js statique +
            React qui lit, parse, renomme et empaquette vos fichiers entièrement
            côté client. Le serveur ne voit ni le contenu, ni les noms d’origine,
            ni les noms générés.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-5">
              <p className="text-xs font-mono uppercase tracking-wide text-brick">Côté navigateur</p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                <li>• Lecture File API</li>
                <li>• Parsing PDF (pdf.js), DOCX (mammoth), XLSX (SheetJS)</li>
                <li>• Extraction ZIP (JSZip) / RAR / 7z (libarchive WASM)</li>
                <li>• Détection catégorie + génération nom</li>
                <li>• Empaquetage ZIP de sortie</li>
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <p className="text-xs font-mono uppercase tracking-wide text-muted">Côté serveur</p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                <li>• Servir les fichiers statiques Next.js</li>
                <li>• (Optionnel) gérer l’authentification compte Pro</li>
                <li>• <strong className="text-ink">Aucun upload de fichier utilisateur</strong></li>
                <li>• <strong className="text-ink">Aucun stockage de contenu document</strong></li>
              </ul>
            </div>
          </div>
        </section>

        <section id="headers" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            2. Headers HTTP audités
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Tous les headers sensibles sont définis au niveau de la plateforme
            (middleware Vercel + config Next.js) et appliqués à chaque réponse.
            Vous pouvez les vérifier avec <code className="rounded bg-paper-2 px-1.5 py-0.5 font-mono text-sm">curl -I</code>.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Header</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Valeur</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Pourquoi</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((h) => (
                  <tr key={h.name} className="border-b border-line">
                    <td className="px-4 py-3 font-mono text-xs text-brick">{h.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{h.value}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{h.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="csp" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            3. Content Security Policy stricte
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            La CSP applique le principe du moindre privilège : seul ce qui est
            nécessaire est autorisé. Aucun <code className="rounded bg-paper-2 px-1 font-mono text-xs">unsafe-eval</code>,
            aucun script tiers inline non hashé.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-line bg-ink p-5 text-xs leading-relaxed text-paper">
{`default-src 'self';
script-src 'self' 'unsafe-inline'  // strict-dynamic à venir
style-src  'self' 'unsafe-inline';
img-src    'self' data: blob:;
font-src   'self' data:;
connect-src 'self' https://*.sentry.io https://*.posthog.com;
worker-src 'self' blob:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;`}
          </pre>
          <p className="mt-4 text-sm text-muted">
            Note : <code className="rounded bg-paper-2 px-1 font-mono text-xs">unsafe-inline</code> reste
            nécessaire en V1 pour le CSS-in-JS de la landing. Suppression prévue avec migration nonces (Q3 2026).
          </p>
        </section>

        <section id="ci" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            4. CI sécurité automatique
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Chaque commit passe par un pipeline d’analyse statique et dynamique.
            Aucun build ne part en production sans passer toutes les vérifications.
          </p>
          <div className="mt-6 grid gap-3">
            {ciChecks.map((c) => (
              <div key={c.name} className="rounded-lg border border-line bg-white p-4 sm:flex sm:items-start sm:gap-4">
                <div className="sm:w-48 sm:shrink-0">
                  <p className="font-mono text-sm font-semibold text-brick">{c.name}</p>
                  <p className="mt-1 text-xs text-muted">{c.when}</p>
                </div>
                <p className="mt-2 text-sm text-ink-soft sm:mt-0">{c.what}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Les workflows GitHub sont publics dans <code className="rounded bg-paper-2 px-1 font-mono text-xs">.github/workflows/</code> :
            <span className="text-ink-soft"> codeql.yml, zap.yml, lighthouse.yml, e2e.yml</span>.
          </p>
        </section>

        <section id="deps" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            5. Dépendances
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Dépendances de runtime minimales et bien connues. Pas de SDK
            propriétaire opaque, pas de SaaS tiers manipulant le contenu fichier.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-brick">Cœur métier</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>• Next.js 16 · React 19 · TypeScript 5</li>
                <li>• jszip — empaquetage ZIP</li>
                <li>• libarchive.js — extraction RAR/7z/TAR (WASM)</li>
                <li>• pdfjs-dist + react-pdf — aperçu PDF</li>
                <li>• mammoth — aperçu DOCX</li>
                <li>• xlsx (SheetJS) — aperçu tableurs</li>
                <li>• dxf-parser — aperçu DXF</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wide text-muted">Observabilité (opt-in)</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>• @sentry/nextjs — erreurs runtime, jamais sur contenu</li>
                <li>• posthog-js — analytics produit, jamais sur contenu</li>
              </ul>
              <p className="mt-3 text-xs text-muted">
                Les deux sont désactivables via env vars vides. Aucune donnée
                personnelle n’est envoyée par défaut.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-muted">
            Audit npm prod : <code className="rounded bg-paper-2 px-1 font-mono text-xs">npm audit --omit=dev</code> exécuté à chaque build.
          </p>
        </section>

        <section id="incident" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            6. Réponse à incident
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            En cas de vulnérabilité découverte (CVE dans une dépendance, faille
            applicative, etc.), nous suivons un protocole simple :
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
            <li>Évaluation gravité : critique (24 h), élevée (72 h), moyenne (7 j), faible (sprint).</li>
            <li>Correctif déployé via Vercel sans coupure de service.</li>
            <li>Communication publique sur <code className="rounded bg-paper-2 px-1 font-mono text-xs">/changelog</code> (à venir) pour les incidents critiques et élevés.</li>
            <li>Notification email aux clients Pro / Team / Entreprise impactés.</li>
          </ol>
          <p className="mt-5 text-sm">
            Pour signaler une faille de manière confidentielle :{' '}
            <a href="mailto:security@bimdoc-renamer.com" className="text-brick font-semibold underline underline-offset-2">
              security@bimdoc-renamer.com
            </a>
            . Réponse sous 48 h ouvrées.
          </p>
        </section>

        <section id="entreprise" className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            7. Engagement Entreprise (en préparation)
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Pour les grands comptes AEC qui ne peuvent pas adopter un SaaS sans
            audit, les options suivantes sont en préparation. Contactez-nous si
            elles correspondent à votre cas — votre demande nourrit la roadmap.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-white p-5">
              <p className="font-sans font-semibold text-ink">Mode SaaS Entreprise</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>• SSO SAML 2.0 + OIDC (Entra ID, Okta, Google Workspace)</li>
                <li>• Tenant isolé, data residency EU choisie</li>
                <li>• DPA RGPD + sub-processors list publique</li>
                <li>• Logs d’audit (qui a renommé quoi, sans contenu)</li>
                <li>• Conventions partagées par organisation</li>
                <li>• Branding personnalisable (logo, couleurs)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-white p-5">
              <p className="font-sans font-semibold text-ink">Mode on-premise</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-soft">
                <li>• Image Docker / Helm chart</li>
                <li>• Aucun appel sortant en mode standalone</li>
                <li>• Licence par poste ou par déploiement</li>
                <li>• Activation hors ligne possible</li>
                <li>• Documentation d’installation administrative</li>
                <li>• Support 1 jour ouvré</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-sm">
            Documents Entreprise disponibles sur demande sous NDA :
            <span className="text-ink-soft"> Security Whitepaper (10 p.), DPA template, architecture de référence, pricing matrix.</span>
          </p>
          <a
            href="mailto:contact@bimdoc-renamer.com?subject=Entreprise%20-%20%C3%A9valuation%20s%C3%A9curit%C3%A9"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brick"
          >
            Demander le Security Whitepaper →
          </a>
        </section>

        <section id="audit" className="py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            8. Auditer vous-même — 5 minutes
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Vous n’avez pas besoin de nous croire sur parole. Voici exactement
            comment vérifier le local-first depuis votre navigateur :
          </p>
          <ol className="mt-6 grid gap-3 text-sm text-ink-soft">
            {auditSteps.map((step, i) => (
              <li key={step} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                <span className="font-serif text-2xl italic text-brick">{String(i + 1).padStart(2, '0')}</span>
                <span className="pt-1">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brick"
            >
              Lancer l’app pour auditer →
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Politique de confidentialité
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-line py-8 text-sm text-ink-mute">
          <p>
            BimDoc Renamer — sécurité contact :{' '}
            <a href="mailto:security@bimdoc-renamer.com" className="text-brick font-semibold underline underline-offset-2">
              security@bimdoc-renamer.com
            </a>
            . PGP key sur demande.
          </p>
        </footer>
      </div>
    </main>
  );
}
