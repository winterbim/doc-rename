import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/contact';
import { HAS_DIRECT_CHECKOUT, PAID_PILOT_PRICE_LABEL } from '@/lib/pricing';
import { PAID_ACCOUNTS_ENABLED } from '@/lib/features';
import { MerciActivation } from '@/components/commercial/MerciActivation';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Merci — BIMCHECK-Rename',
  description: 'Confirmation de paiement et activation automatique de licence BIMCHECK-Rename.',
  robots: { index: false, follow: false },
};

/**
 * Post-checkout landing. Stripe success URL must include:
 *   https://rename.bimcheck-consulting.com/merci?session_id={CHECKOUT_SESSION_ID}
 * License is activated automatically (webhook + optional Stripe session verify).
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
            Paiement
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Merci — activation en cours.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {HAS_DIRECT_CHECKOUT ? (
              <>
                Votre licence est <strong className="text-ink">activée automatiquement</strong> dès
                confirmation du paiement Stripe. Aucune action manuelle de notre part n’est
                requise pour débloquer les lots illimités sur ce navigateur.
              </>
            ) : (
              <>
                Aucun paiement n’est encaissé sur le site actuellement. Pour un pilote ou une offre
                équipe, contactez-nous afin de confirmer le périmètre et la facturation.
              </>
            )}
          </p>

          {HAS_DIRECT_CHECKOUT && <MerciActivation />}

          <ul className="mt-6 space-y-2 text-left text-sm text-ink-soft">
            <li>• Team / Cabinet : lots illimités dès activation (ce navigateur).</li>
            <li>• Pilote {PAID_PILOT_PRICE_LABEL} : accès illimité 14 jours + onboarding sur demande.</li>
            {PAID_ACCOUNTS_ENABLED && (
              <li>• Créez un compte pour synchroniser les conventions cloud (optionnel).</li>
            )}
          </ul>

          {!HAS_DIRECT_CHECKOUT && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/app">Ouvrir l’atelier</Link>
              </Button>
            </div>
          )}

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
