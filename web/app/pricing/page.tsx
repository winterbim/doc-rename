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
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Tarifs',
  description: `BIMCHECK-Rename — Free pour essayer, Team à ${TEAM_PRICE_EUR}€/mois, Cabinet à ${CABINET_PRICE_EUR}€/mois. Devise EUR, CHF ou USD. Local-first.`,
};

const faqs = [
  {
    q: 'Puis-je vraiment tout faire en Free ?',
    a: `Oui pour le renommage local : tous les profils métier, convention personnalisée, export ZIP. Limite : ${FREE_DAILY_LOTS} lots par jour. Pour lots illimités et partager la convention en équipe, passez à Team (${TEAM_PRICE_EUR} €/mois).`,
  },
  {
    q: 'Pourquoi des prix aussi bas ?',
    a: 'Parce que le Free fait déjà le cœur du produit (renommage local). On monétise le volume, la collab et le support — pas un faux CDE. Voir docs/product/PRICING_AUDIT.md.',
  },
  {
    q: 'Mes fichiers quittent-ils le navigateur ?',
    a: 'Non. Le renommage et le ZIP restent 100 % locaux. En Team/Cabinet, seul le JSON de convention peut être synchronisé — jamais le contenu des fichiers.',
  },
  {
    q: 'Puis-je afficher les prix en CHF ou USD ?',
    a: 'Oui : utilisez le sélecteur de devise en haut des tarifs. Les montants hors euro sont des conversions indicatives (base EUR). La facturation suit Stripe ou le devis.',
  },
  {
    q: 'Comment l’accès payant est-il activé ?',
    a: `Après paiement Stripe ou devis, activation manuelle sous 1 jour ouvré. Pilote guidé disponible à ${PILOT_PRICE_EUR} € (paiement unique).`,
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
              <span className="font-semibold">BIMCHECK-Rename</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-ink-soft">
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
                Prix publics · annulation à tout moment
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Des tarifs pensés pour ne pas vous faire fuir.
              </h1>
              <p className="mt-6 text-lg text-ink-soft">
                Free généreux. Team à {TEAM_PRICE_EUR}&nbsp;€/mois. Cabinet à {CABINET_PRICE_EUR}&nbsp;€/mois.
                Changez la devise d’affichage (EUR, CHF, USD) ci-dessous.
              </p>
            </div>
          </Container>
        </section>

        <section className="bg-bg py-16">
          <Container>
            <PricingPlansSection />
          </Container>
        </section>

        <section className="bg-surface py-20">
          <Container>
            <SectionHeader
              align="center"
              badge="Comparaison"
              title="Tout ce qui est inclus dans chaque plan"
              description="Uniquement des capacités livrées aujourd’hui — pas de promesses roadmap."
            />

            <div className="mt-12 overflow-hidden rounded-2xl border border-border shadow-sm">
              <table className="w-full text-left">
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
                Commencez gratuitement. Payez seulement si l’équipe suit.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                Testez sur un vrai lot. Si le gain de temps est clair, Team à {TEAM_PRICE_EUR}&nbsp;€
                suffit pour la plupart des équipes.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/app">
                  <Button variant="accent" size="lg">Essayer gratuitement</Button>
                </Link>
                <Link href="/pilot?plan=team">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="border-slate-600 bg-slate-800 text-slate-50 hover:bg-slate-700"
                  >
                    Demander une démo Team
                  </Button>
                </Link>
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
              <Link href="/security" className="hover:text-ink">Sécurité</Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
