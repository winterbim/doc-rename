import type { Metadata } from 'next';
import Link from 'next/link';
import { PilotRequestForm } from '@/components/commercial/PilotRequestForm';
import { HAS_DIRECT_CHECKOUT, PAID_ACCOUNTS_AVAILABLE, PAID_PILOT_PRICE_LABEL, pilotCta } from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Pilote 14 jours',
  description:
    `Demander un échange sur le projet de pilote BIMCHECK-Rename annoncé à ${PAID_PILOT_PRICE_LABEL}. La demande ne réserve rien et ne déclenche aucun paiement.`,
  alternates: {
    canonical: '/pilot',
  },
  openGraph: {
    title: 'Demander un pilote BIMCHECK-Rename',
    description: 'Décrivez votre convention et votre volume. La demande ne déclenche aucun paiement en ligne.',
    url: '/pilot',
  },
};

const outcomes = [
  'Votre convention métier importée ou reproduite dans BIMCHECK-Rename.',
  'Un lot de fichiers renommé avec aperçu Avant / Après.',
  'Un ZIP final prêt à déposer, archiver ou partager.',
  'Un retour clair sur les écarts de convention et la décision Team / Cabinet.',
];

const pilotSteps = [
  ['1', 'Cadrage 15 min', 'Vous décrivez la convention, le métier et le volume de fichiers.'],
  [
    '2',
    HAS_DIRECT_CHECKOUT ? 'Paiement pilote' : 'Validation manuelle',
    HAS_DIRECT_CHECKOUT
      ? `Paiement unique ${PAID_PILOT_PRICE_LABEL} par lien sécurisé.`
      : 'Nous confirmons le périmètre et les conditions par écrit ; la demande en ligne ne déclenche aucun paiement.',
  ],
  ['3', 'Onboarding 30 min', 'On prépare un modèle exploitable et vous testez sur un lot non confidentiel.'],
  ['4', 'Pilote 14 jours', 'Vous renommez vos lots en autonomie, sans compte obligatoire et sans upload fichier.'],
  ['5', 'Décision', 'Team, Cabinet, ou arrêt propre si le gain n’est pas démontré.'],
];

export default function PilotPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-paper">
              BC
            </span>
            BIMCHECK-Rename
          </Link>
          <nav
            className="flex flex-wrap items-center gap-3 text-xs text-ink-soft sm:gap-4 sm:text-sm"
            aria-label="Navigation pilote"
          >
            <Link href="/app" className="hover:text-brick">Essayer l’app</Link>
            <Link href="/security" className="hover:text-brick">Sécurité</Link>
            <Link href="/privacy" className="hover:text-brick">Confidentialité</Link>
          </nav>
        </header>

        <section className="grid gap-10 border-b border-line py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brick">
              Pilote commercial
            </p>
            <h1 className="mt-4 max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
              Étudions un pilote de 14 jours sur votre convention.
            </h1>
            <p className="mt-5 max-w-3xl text-xl leading-8 text-ink-soft">
              Un pilote n’a de sens que s’il prouve un gain sur un lot concret :
              comparez le temps de préparation et les erreurs avant dépôt ou partage,
              sans envoyer les fichiers au serveur pendant le flux de renommage.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={pilotCta.checkout ? pilotCta.href : '#demande'}
                {...(pilotCta.checkout ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-brick"
              >
                {pilotCta.label}
              </a>
              <Link
                href="/app"
                className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink hover:text-paper"
              >
                Tester avec un lot exemple
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-line bg-surface p-5 shadow-sm dark:bg-paper-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brick">
              {HAS_DIRECT_CHECKOUT ? 'Offre disponible aujourd’hui' : 'Projet pilote — demande d’échange'}
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-ink">
              {PAID_PILOT_PRICE_LABEL}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Tarif cible annoncé, à confirmer par écrit avec le périmètre et les conditions avant
              toute commande. La demande actuelle sert uniquement à organiser un échange.
            </p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-soft">
              {outcomes.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-md bg-paper-2 px-3 py-2 text-xs leading-5 text-ink-soft">
              Périmètre envisagé : convention préparée, test sur lot non confidentiel et bilan.
              Tarifs cibles après ouverture : Team 19 € / mois (jusqu’à 10 utilisateurs) ou Cabinet
              49 € / mois (jusqu’à 1 000 utilisateurs et projets). {!PAID_ACCOUNTS_AVAILABLE && 'Les comptes payants ne sont pas encore ouverts. '}
              {!HAS_DIRECT_CHECKOUT && 'Aucun paiement n’est encaissé depuis cette page.'}
            </p>
          </aside>
        </section>

        <section className="border-b border-line py-12">
          <div className="grid gap-4 md:grid-cols-5">
            {pilotSteps.map(([number, title, text]) => (
              <article key={number} className="rounded-lg border border-line bg-surface p-4 dark:bg-paper-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-xs font-bold text-paper">
                  {number}
                </span>
                <h2 className="mt-4 text-lg font-semibold text-ink">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="demande" className="grid min-w-0 gap-10 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brick">
              Demande pilote
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              Décrivez votre besoin, puis partons de votre réalité.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-soft">
              Le bon critère commercial est simple : est-ce que BIMCHECK-Rename réduit
              vraiment le temps passé à préparer vos fichiers avant dépôt, partage ou
              archivage ? Si oui, ce travail pourra préparer une future offre Team ou
              Cabinet lorsqu’elles seront ouvertes. Sinon, vous gardez le diagnostic et
              le modèle de convention préparé.
            </p>
            <div className="mt-6 rounded-lg border border-line bg-surface p-4 dark:bg-paper-2">
              <p className="text-sm font-semibold text-ink">À ne pas envoyer par email</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Fichiers confidentiels, maquettes propriétaires, documents client sensibles.
                Le pilote démarre avec des noms de fichiers, des conventions et des lots non sensibles.
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-line bg-surface p-5 shadow-sm dark:bg-paper-2">
            <PilotRequestForm />
          </div>
        </section>
      </div>
    </main>
  );
}
