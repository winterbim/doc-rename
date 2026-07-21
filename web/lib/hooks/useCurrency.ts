'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  type CurrencyCode,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  isCurrencyCode,
} from '@/lib/pricing';

function readStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (isCurrencyCode(raw)) return raw;
  } catch {
    /* private mode */
  }
  return DEFAULT_CURRENCY;
}

/**
 * Display currency preference (EUR / CHF / USD).
 * Persisted in localStorage; does not change billing backend — only UI + optional Stripe link.
 */
export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCurrencyState(readStoredCurrency());
    setReady(true);
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  return { currency, setCurrency, ready };
}
