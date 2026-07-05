import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  freePlan,
  teamPlan,
  cabinetPlan,
  type PricingPlan,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    'BIMCHECK-Rename — Free pour essayer, Team à 49€/mois, Cabinet à 149€/mois. Local-first, sans upload de fichiers.',
};

const faqs = [
  {
    q: 'Puis-je vraiment tout faire en Free ?',
    a: 'Oui. Le plan Free couvre le renommage local, tous les profils métier et les conventions personnalisées. La limite est de 3 lots de renommage par jour. Pour partager une convention avec votre équipe, il faut passer à Team.',
  },
  {
    q: 'Mes fichiers quittent-ils le navigateur ?',
    a: 'Jamais. Le traitement est 100 % local. Seul le JSON de votre convention est synchronisé en cloud quand vous utilisez Team ou Cabinet.',
  },
  {
    q: 'Que se passe-t-il si je descends de Cabinet à Team ?',
    a: 'Vos projets au-delà de 3 sont conservés en lecture seule. Vous pouvez les réactiver en remontant de plan.',
  },
  {
    q: 'Puis-je payer par virement ou mandat ?',
    a: 'Oui pour Cabinet. Contactez-nous pour un devis et un bon de commande. Team est en paiement en ligne par carte.',
  },
];

function PlanCard({ plan }: { plan: PricingPlan }) {
  const isFree = plan.price === 0;

  return (
    <Card
      variant={plan.highlighted ? 'elevated' : 'default'}
      padding="lg"
      className={`relative flex flex-col h-full ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary">{plan.badge}</Badge>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-ink">{plan.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">{plan.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-5xl font-semibold tracking-tight text-ink">
          {isFree ? 'Gratuit' : plan.price}
        </span>
        {!isFree && (
          <span className="text-lg text-ink-soft">
            {plan.priceUnit}
            {plan.billing}
          </span>
        )}
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-ink-soft">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <Link href={plan.cta.href} target={plan.cta.checkout ? '_blank' : undefined}>
        <Button
          variant={plan.highlighted ? 'primary' : 'secondary'}
          className="w-full"
          size="lg"
        >
          {plan.cta.label}
        </Button>
      </Link>
    </Card>
  );
}

const comparisonRows = [
  { feature: 'Renommage local', free: true, team: true, cabinet: true },
  { feature: 'Tous les profils métier', free: true, team: true, cabinet: true },
  { feature: 'Convention personnalisée', free: true, team: true, cabinet: true },
  { feature: 'Lots par jour', free: '3', team: 'Illimité', cabinet: 'Illimité' },
  { feature: 'Compte équipe', free: false, team: 'Jusqu’à 10', cabinet: 'Illimité' },
  { feature: 'Sync des conventions', free: false, team: true, cabinet: true },
  { feature: 'Templates prêts à l’emploi', free: 'Limités', team: true, cabinet: true },
  { feature: 'Projets', free: '1', team: '3', cabinet: 'Illimités' },
  { feature: 'Audit trail', free: false, team: false, cabinet: true },
  { feature: 'Rapport conformité PDF', free: false, team: false, cabinet: true },
  { feature: 'Connecteur SharePoint', free: false, team: false, cabinet: true },
  { feature: 'Support', free: 'Email', team: 'Email', cabinet: 'Dédié' },
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
      {/* Header */}
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
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface pb-20 pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-indigo-100)_0%,_transparent_50%)] opacity-60" />
          <Container className="relative">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="primary" className="mb-6">
                Sans engagement · Annulation à tout moment
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Une convention unique pour toute votre équipe.
              </h1>
              <p className="mt-6 text-lg text-ink-soft">
                Commencez gratuitement. Passez à Team dès que vous voulez partager
                votre convention. Cabinet pour les besoins audit et conformité.
              </p>
            </div>
          </Container>
        </section>

        {/* Plans */}
        <section className="bg-bg py-16">
          <Container>
            <div className="grid gap-6 lg:grid-cols-3">
              <PlanCard plan={freePlan} />
              <PlanCard plan={teamPlan} />
              <PlanCard plan={cabinetPlan} />
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section className="bg-surface py-20">
          <Container>
            <SectionHeader
              align="center"
              badge="Comparaison"
              title="Tout ce qui est inclus dans chaque plan"
              description="Choisissez le plan qui correspond à votre équipe. Vous pouvez changer à tout moment."
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
                  {comparisonRows.map((row) => (
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

        {/* FAQ */}
        <section className="bg-bg py-20">
          <Container>
            <SectionHeader
              align="center"
              badge="FAQ"
              title="Questions fréquentes"
            />
            <div className="mx-auto mt-12 grid max-w-3xl gap-4">
              {faqs.map((faq) => (
                <Card key={faq.q} variant="default" padding="md">
                  <h3 className="text-base font-semibold text-ink">{faq.q}</h3>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Final CTA */}
        <section className="bg-surface py-20">
          <Container>
            <Card variant="dark" padding="xl" className="text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Prêt à standardiser vos documents ?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                Commencez gratuitement aujourd’hui. Passez à Team ou Cabinet quand
                vous êtes prêt à partager votre convention avec votre équipe.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link href="/app">
                  <Button variant="accent" size="lg">Essayer gratuitement</Button>
                </Link>
                <Link href="/pilot?plan=team">
                  <Button variant="secondary" size="lg" className="border-slate-600 bg-slate-800 text-slate-50 hover:bg-slate-700">
                    Demander une démo Team
                  </Button>
                </Link>
              </div>
            </Card>
          </Container>
        </section>
      </main>

      {/* Footer */}
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
