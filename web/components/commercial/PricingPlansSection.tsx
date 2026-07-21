'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CurrencySwitcher } from '@/components/commercial/CurrencySwitcher';
import { useCurrency } from '@/lib/hooks/useCurrency';
import {
  getPricingPlans,
  type PricingPlan,
  CURRENCIES,
} from '@/lib/pricing';

function PlanCard({ plan }: { plan: PricingPlan }) {
  const isFree = plan.price === 0;

  return (
    <Card
      variant={plan.highlighted ? 'elevated' : 'default'}
      padding="lg"
      className={`relative flex h-full flex-col ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}
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
            {' '}
            {plan.currency === 'EUR' ? plan.priceUnit : plan.priceUnit}
            {plan.billing}
          </span>
        )}
        {!isFree && plan.currency !== 'EUR' && (
          <p className="mt-1 text-xs text-ink-mute">
            Base {plan.priceEur} € / mois · conversion indicative
          </p>
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
              aria-hidden="true"
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

export function PricingPlansSection() {
  const { currency, setCurrency } = useCurrency();
  const plans = getPricingPlans(currency);
  const meta = CURRENCIES[currency];

  return (
    <div>
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <CurrencySwitcher currency={currency} onChange={setCurrency} />
        <p className="max-w-md text-xs text-ink-mute">
          Affichage en {meta.label}. Les montants hors euro sont des conversions
          indicatives (base EUR). La facturation suit le lien de paiement ou le devis.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
