'use client';

import {
  type CurrencyCode,
  CURRENCIES,
  CURRENCY_OPTIONS,
} from '@/lib/pricing';

interface CurrencySwitcherProps {
  currency: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * EUR / CHF / USD toggle for public pricing surfaces.
 */
export function CurrencySwitcher({
  currency,
  onChange,
  className = '',
  size = 'md',
}: CurrencySwitcherProps) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div
      className={`inline-flex items-center rounded-full border border-border bg-surface p-0.5 ${className}`}
      role="group"
      aria-label="Choisir la devise d’affichage"
    >
      {CURRENCY_OPTIONS.map((code) => {
        const active = code === currency;
        return (
          <button
            key={code}
            type="button"
            onClick={() => onChange(code)}
            aria-pressed={active}
            title={CURRENCIES[code].label}
            className={[
              pad,
              'rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active
                ? 'bg-primary text-paper shadow-sm'
                : 'text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
