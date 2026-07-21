import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/contact';
import { HAS_DIRECT_CHECKOUT, PAID_PILOT_PRICE_LABEL } from '@/lib/pricing';
import { PAID_ACCOUNTS_ENABLED } from '@/lib/features';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Merci — BIMCHECK-Rename',
  description: 'Confirmation et prochaines étapes BIMCHECK-Rename.',
  robots: { index: false, follow: false },
};

/**
 * Post-checkout landing (Stripe success URL or manual confirmation).
 * V1 provisioning is human-in-the-loop within 1 business day.
 */
export default function MerciPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-paper">
                BC
              </span>
              BIMCHECK-Rename
            </Link>
          </div>
        </Container>
      </header>

      <Container size="md" className="py-16">
        <Card variant="elevated" padding="lg" className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-success">
            Prochaine étape
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Merci — préparons la suite.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {HAS_DIRECT_CHECKOUT ? (
              <>
                Si votre règlement vient d’être confirmé, BIMCHECK-Rename provisionne les plans
                payants sous <strong className="text-ink">1 jour ouvré</strong>. Vous recevrez un
                email avec la suite.
              </>
            ) : (
              <>
                Aucun paiement n’est encaissé sur le site actuellement. Pour un pilote ou une offre
                équipe, contactez-nous afin de confirmer le périmètre et la facturation.
              </>
            )}
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-ink-soft">
            <li>• En attendant, le plan Free reste utilisable sur <Link className="text-primary underline" href="/app">/app</Link>.</li>
            {PAID_ACCOUNTS_ENABLED && <li>• Créez un compte pour préparer la synchronisation des conventions.</li>}
            <li>• Pilote {PAID_PILOT_PRICE_LABEL} : nous vous contactons pour le créneau d’onboarding.</li>
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/app">Ouvrir l’atelier</Link>
            </Button>
            {PAID_ACCOUNTS_ENABLED && (
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Se connecter</Link>
              </Button>
            )}
          </div>
          <p className="mt-8 text-xs text-ink-mute">
            Question ?{' '}
            <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>
              {CONTACT_EMAIL}
            </a>
          </p>
        </Card>
      </Container>
    </main>
  );
}
