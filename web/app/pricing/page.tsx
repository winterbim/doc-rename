import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PricingPlansSection } from '@/components/commercial/PricingPlansSection';
import { LEGAL_FOOTER_LINE } from '@/lib/contact';
import {
  planComparisonRows,
  planRoadmapItems,
  TEAM_PRICE_EUR,
  CABINET_PRICE_EUR,
  FREE_DAILY_LOTS,
  PILOT_PRICE_EUR,
  HAS_DIRECT_CHECKOUT,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Tarifs',
  description: `BIMCHECK-Rename : Free gratuit, Team ${TEAM_PRICE_EUR} €/mois, Cabinet ${CABINET_PRICE_EUR} €/mois, Pilote ${PILOT_PRICE_EUR} €. Local-first, paiement Stripe.`,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Tarifs BIMCHECK-Rename',
    description: `Free, Team ${TEAM_PRICE_EUR} €/mois, Cabinet ${CABINET_PRICE_EUR} €/mois. Paiement sécurisé Stripe en production.`,
    url: '/pricing',
  },
};

const faqs = [
  {
    q: 'Puis-je vraiment tout faire en Free ?',
    a: `Oui pour le renommage local : tous les profils métier, convention personnalisée, export ZIP. Limite : ${FREE_DAILY_LOTS} lots par jour. Team (${TEAM_PRICE_EUR} €/mois) lève cette limite.`,
  },
  {
    q: 'Que comprend exactement chaque offre ?',
    a: 'Free couvre le cœur du produit : renommage local, aperçu et ZIP, limité à quelques lots par jour. Team lève la limite de volume pour une équipe avec support email. Cabinet ajoute le multi-équipes, l’onboarding guidé et le support prioritaire. Chaque abonnement donne lieu à une facture Stripe.',
  },
  {
    q: 'Mes fichiers quittent-ils le navigateur ?',
    a: 'Non. Le renommage et le ZIP restent 100 % locaux. Seul un JSON de convention peut être synchronisé plus tard — jamais le contenu des fichiers.',
  },
  {
    q: 'Puis-je afficher les prix en CHF ou USD ?',
    a: 'Oui : utilisez le sélecteur de devise en haut des tarifs. Les montants hors euro sont des conversions indicatives (base EUR). Le prix de référence est en EUR ; Stripe peut proposer un règlement dans votre devise locale — le taux et les éventuels frais de conversion sont affichés avant paiement.',
  },
  {
    q: 'Comment l’accès payant est-il activé ?',
    a: HAS_DIRECT_CHECKOUT
      ? `Paiement Stripe live, puis activation automatique de la licence (lots illimités) sur la page de confirmation. Pilote guidé : ${PILOT_PRICE_EUR} € (paiement unique, 14 jours).`
      : `Dès que le paiement Stripe live est branché, l’activation de licence est automatique après paiement. En attendant : demande via /pilot.`,
  },
  {
    q: 'Comment résilier mon abonnement ?',
    a: 'En self-service depuis le portail client Stripe : le lien « Gérer mon abonnement » figure dans votre email de confirmation Stripe (reçu de paiement). La résiliation prend effet en fin de période. Vous pouvez aussi résilier par simple email — voir les CGU/CGV.',
  },
];

function CheckOrValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <svg className="mx-auto h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (value === false) {
    return (
      <svg className="mx-auto h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return <span className="text-sm text-ink-soft">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-ink">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-paper">
                BC
              </span>
              <span className="hidden font-semibold sm:inline">BIMCHECK-Rename</span>
            </Link>
            <nav className="flex items-center gap-3 text-xs text-ink-soft sm:gap-6 sm:text-sm">
              <Link href="/" className="hover:text-ink">Accueil</Link>
              <Link href="/app" className="hover:text-ink">Essayer</Link>
              <Link href="/pilot" className="hover:text-ink">Pilote</Link>
            </nav>
          </div>
        </Container>
      </header>

      <main>
        <section className="relative overflow-hidden bg-surface pb-20 pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-indigo-100)_0%,_transparent_50%)] opacity-60" />
          <Container className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="primary" className="mb-6">
                {HAS_DIRECT_CHECKOUT
                  ? 'Prix publics · paiement Stripe · licence auto'
                  : 'Free ouvert'}
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Rentabilisé dès le premier jalon.
              </h1>
              <p className="mt-6 text-lg text-ink-soft">
                Free généreux. Team à {TEAM_PRICE_EUR}&nbsp;€/mois. Cabinet à {CABINET_PRICE_EUR}&nbsp;€/mois.
                Changez la devise d’affichage (EUR, CHF, USD) ci-dessous.{' '}
                {HAS_DIRECT_CHECKOUT
                  ? 'Paiement sécurisé Stripe · licence activée automatiquement après paiement · sans compte obligatoire.'
                  : 'Les offres payantes s’ouvrent dès le paiement en ligne branché.'}
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-bg py-16">
          <Container>
            <h2 className="sr-only">Choisir une offre BIMCHECK-Rename</h2>
            <PricingPlansSection />
          </Container>
        </section>

        <section className="bg-surface py-20">
          <Container>
            <SectionHeader
              align="center"
              badge="Comparaison"
              title="Tout ce qui est inclus dans chaque plan"
              description={
                HAS_DIRECT_CHECKOUT
                  ? 'Capacités livrées après paiement : licence automatique sur votre navigateur.'
                  : 'Free disponible maintenant. Team et Cabinet s’achètent dès le paiement en ligne ouvert.'
              }
            />

            <p className="mt-8 text-center text-xs font-medium text-ink-mute sm:hidden">
              Faites glisser le tableau pour comparer les trois offres.
            </p>
            <div
              className="mt-3 overflow-x-auto rounded-2xl border border-border shadow-sm sm:mt-12"
              role="region"
              aria-label="Comparaison détaillée des offres tarifaires"
              tabIndex={0}
            >
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-ink">Fonctionnalité</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-ink">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-primary">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-ink">Cabinet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {planComparisonRows.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 text-sm font-medium text-ink">{row.feature}</td>
                      <td className="px-6 py-4 text-center"><CheckOrValue value={row.free} /></td>
                      <td className="px-6 py-4 text-center bg-primary-2/30"><CheckOrValue value={row.team} /></td>
                      <td className="px-6 py-4 text-center"><CheckOrValue value={row.cabinet} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {planRoadmapItems.length > 0 && (
              <aside
                aria-labelledby="roadmap-title"
                className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-border-2 bg-bg px-6 py-5"
              >
                <h3 id="roadmap-title" className="text-sm font-semibold uppercase tracking-wide text-ink-mute">
                  Feuille de route
                </h3>
                <p className="mt-2 text-sm text-ink-soft">
                  En préparation — non inclus dans les offres actuelles, annoncé ici par transparence :
                </p>
                <ul className="mt-3 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
                  {planRoadmapItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-border-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </Container>
        </section>

        <section className="bg-bg py-20">
          <Container>
            <SectionHeader align="center" badge="FAQ" title="Questions fréquentes" />
            <div className="mx-auto mt-12 grid max-w-3xl gap-4">
              {faqs.map((faq) => (
                <Card key={faq.q} variant="default" padding="md">
                  <h3 className="text-base font-semibold text-ink">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{faq.a}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-surface py-20">
          <Container>
            <Card variant="dark" padding="xl" className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Commencez gratuitement. Passez à Team seulement si le gain est clair.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                {HAS_DIRECT_CHECKOUT
                  ? `Testez sur un lot non confidentiel. Team à ${TEAM_PRICE_EUR} €/mois se paie en ligne ; la licence s’active automatiquement.`
                  : `Testez sur un lot non confidentiel. Team est annoncé à ${TEAM_PRICE_EUR} €/mois.`}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button variant="accent" size="lg" asChild>
                  <Link href="/app">Essayer gratuitement</Link>
                </Button>
                <Button
                    variant="secondary"
                    size="lg"
                    className="!border-slate-600 !bg-slate-800 !text-white hover:!bg-slate-700"
                    asChild
                  >
                  <Link href={HAS_DIRECT_CHECKOUT ? '/pricing' : '/pilot?plan=team'}>
                    {HAS_DIRECT_CHECKOUT ? 'Voir Team & Cabinet' : 'Demander un échange'}
                  </Link>
                </Button>
              </div>
            </Card>
          </Container>
        </section>
      </main>

      <footer className="border-t border-border bg-surface py-10">
        <Container>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-ink-mute">
              © {new Date().getFullYear()} BIMCHECK-Rename. Tous droits réservés.
              <br />
              <small>{LEGAL_FOOTER_LINE}</small>
            </p>
            <div className="flex gap-6 text-sm text-ink-soft">
              <Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link>
              <Link href="/privacy" className="hover:text-ink">Confidentialité</Link>
              <Link href="/conditions" className="hover:text-ink">CGU / CGV</Link>
              <Link href="/security" className="hover:text-ink">Sécurité</Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
