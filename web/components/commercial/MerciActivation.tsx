'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { writeStoredLicense } from '@/lib/license-client';
import { getAccessPlanLabel, normalizeAccessPlan } from '@/lib/usage-limits';
import { Button } from '@/components/ui/Button';
import { CONTACT_EMAIL } from '@/lib/contact';

type ActivationState =
  | { status: 'idle' }
  | { status: 'activating' }
  | {
      status: 'success';
      plan: string;
      email: string;
      expiresAt: number | null;
    }
  | { status: 'error'; message: string }
  | { status: 'missing_session' };

export function MerciActivation() {
  const [state, setState] = useState<ActivationState>({ status: 'idle' });

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const sessionId =
      params.get('session_id')?.trim() ||
      params.get('checkout_session_id')?.trim() ||
      '';
    if (!sessionId.startsWith('cs_')) {
      setState({ status: 'missing_session' });
      return;
    }

    let cancelled = false;
    setState({ status: 'activating' });

    void (async () => {
      try {
        const response = await fetch('/api/license/activate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId }),
          cache: 'no-store',
        });
        const result = (await response.json().catch(() => null)) as
          | {
              activated?: boolean;
              licenseKey?: string;
              plan?: string;
              email?: string;
              expiresAt?: number | null;
              error?: string;
            }
          | null;
        if (cancelled) return;
        if (!response.ok || !result?.activated || !result.licenseKey || !result.plan) {
          setState({
            status: 'error',
            message:
              result?.error ||
              'La licence n’a pas pu être activée automatiquement. Contactez le support avec l’e-mail utilisé pour le paiement.',
          });
          return;
        }
        const plan = normalizeAccessPlan(result.plan);
        writeStoredLicense({
          licenseKey: result.licenseKey,
          plan,
          email: result.email,
          expiresAt: result.expiresAt ?? null,
          activatedAt: Date.now(),
        });
        setState({
          status: 'success',
          plan,
          email: result.email || '',
          expiresAt: result.expiresAt ?? null,
        });
      } catch {
        if (!cancelled) {
          setState({
            status: 'error',
            message: 'Réseau indisponible pendant l’activation. Rechargez cette page.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'activating' || state.status === 'idle') {
    return (
      <div className="mt-6 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm text-ink-soft">
        Activation automatique de votre licence en cours…
      </div>
    );
  }

  if (state.status === 'success') {
    const label = getAccessPlanLabel(normalizeAccessPlan(state.plan));
    return (
      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-left text-sm text-ink">
          <p className="font-semibold text-success">Licence activée automatiquement</p>
          <p className="mt-1 text-ink-soft">
            Plan <strong className="text-ink">{label}</strong>
            {state.email ? (
              <>
                {' '}
                pour <strong className="text-ink">{state.email}</strong>
              </>
            ) : null}
            . Les lots illimités sont disponibles tout de suite dans l’atelier (ce navigateur).
          </p>
          {state.expiresAt ? (
            <p className="mt-1 text-xs text-ink-mute">
              Valable jusqu’au {new Date(state.expiresAt).toLocaleDateString('fr-FR')}.
            </p>
          ) : null}
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/app">Ouvrir l’atelier illimité</Link>
        </Button>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="mt-6 space-y-3 rounded-lg border border-brick/30 bg-brick/5 px-4 py-3 text-left text-sm">
        <p className="font-semibold text-ink">Activation en attente</p>
        <p className="text-ink-soft">{state.message}</p>
        <p className="text-xs text-ink-mute">
          Support :{' '}
          <a className="text-primary underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <Button asChild variant="secondary" size="md">
          <Link href="/app">Continuer vers l’atelier</Link>
        </Button>
      </div>
    );
  }

  // missing_session — opened /merci without Stripe redirect
  return (
    <div className="mt-6 text-sm text-ink-soft">
      Si vous venez de payer, rouvrez le lien de confirmation Stripe (URL contenant{' '}
      <code className="text-xs">session_id</code>). Sinon, le plan Free reste disponible sur{' '}
      <Link className="text-primary underline" href="/app">
        /app
      </Link>
      .
    </div>
  );
}
