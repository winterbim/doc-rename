import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PricingPlansSection } from '@/components/commercial/PricingPlansSection';
import {
  planComparisonRows,
  TEAM_PRICE_EUR,
  CABINET_PRICE_EUR,
  FREE_DAILY_LOTS,
  PILOT_PRICE_EUR,
  HAS_DIRECT_CHECKOUT,
  PAID_ACCOUNTS_AVAILABLE,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Tarifs',
  description: `BIMCHECK-Rename Free est ouvert. Team à ${TEAM_PRICE_EUR} €/mois et Cabinet à ${CABINET_PRICE_EUR} €/mois sont des tarifs cibles non ouverts. Local-first.`,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Tarifs BIMCHECK-Rename',
    description: `Free est ouvert. Tarifs cibles Team ${TEAM_PRICE_EUR} €/mois et Cabinet ${CABINET_PRICE_EUR} €/mois, sans achat en ligne tant que les comptes restent fermés.`,
    url: '/pricing',
  },
};

const faqs = [
  {
    q: 'Puis-je vraiment tout faire en Free ?',
    a: `Oui pour le renommage local : tous les profils métier, convention personnalisée, export ZIP. Limite : ${FREE_DAILY_LOTS} lots par jour. Team (${TEAM_PRICE_EUR} €/mois) est un tarif cible ; les comptes équipe ne sont pas encore ouverts.`,
  },
  {
    q: 'Pourquoi des prix aussi bas ?',
    a: 'Parce que le Free fait déjà le cœur du produit : renommage local, aperçu et ZIP. Les futures offres payantes visent le volume, la collaboration et le support — pas un faux CDE.',
  },
  {
    q: 'Mes fichiers quittent-ils le navigateur ?',
    a: 'Non. Le renommage et le ZIP restent 100 % locaux. En Team/Cabinet, seul le JSON de convention peut être synchronisé — jamais le contenu des fichiers.',
  },
  {
    q: 'Puis-je afficher les prix en CHF ou USD ?',
    a: 'Oui : utilisez le sélecteur de devise en haut des tarifs. Les montants hors euro sont des conversions indicatives (base EUR). Aucune facturation n’est ouverte actuellement.',
  },
  {
    q: 'Comment l’accès payant est-il activé ?',
    a: HAS_DIRECT_CHECKOUT
      ? `Après paiement Stripe ou devis, activation manuelle sous 1 jour ouvré. Pilote guidé disponible à ${PILOT_PRICE_EUR} € (paiement unique).`
      : `Les souscriptions en ligne ne sont pas ouvertes. Vous pouvez demander un échange pour Team, Cabinet ou le pilote annoncé à ${PILOT_PRICE_EUR} €, sans paiement ni engagement depuis le site.`,
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
                {PAID_ACCOUNTS_AVAILABLE ? 'Prix publics · annulation à tout moment' : 'Free ouvert · tarifs payants cibles'}
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Des tarifs pensés pour ne pas vous faire fuir.
              </h1>
              <p className="mt-6 text-lg text-ink-soft">
                Free généreux. Team à {TEAM_PRICE_EUR}&nbsp;€/mois. Cabinet à {CABINET_PRICE_EUR}&nbsp;€/mois.
                Changez la devise d’affichage (EUR, CHF, USD) ci-dessous.{' '}
                {!PAID_ACCOUNTS_AVAILABLE && 'Les comptes payants ne sont pas encore ouverts.'}
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
              description={PAID_ACCOUNTS_AVAILABLE
                ? 'Capacités disponibles avec chaque plan.'
                : 'Free est disponible aujourd’hui. Les colonnes Team et Cabinet décrivent un périmètre cible non encore ouvert.'}
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
                {PAID_ACCOUNTS_AVAILABLE
                  ? 'Commencez gratuitement. Passez à une offre payante seulement si elle est utile.'
                  : 'Commencez gratuitement. Les offres payantes ne sont pas encore ouvertes.'}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                Testez sur un lot non confidentiel et mesurez le résultat. Le tarif cible Team est
                de {TEAM_PRICE_EUR}&nbsp;€ / mois, sans possibilité de souscrire aujourd’hui.
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
                  <Link href="/pilot?plan=team">Demander à être recontacté</Link>
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
