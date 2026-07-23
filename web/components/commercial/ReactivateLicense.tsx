'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { useAppContext } from '@/lib/app-state';
import { getDeviceId, writeStoredLicense } from '@/lib/license-client';
import { getAccessPlanLabel, normalizeAccessPlan } from '@/lib/usage-limits';

/**
 * « Déjà client ? » — réactivation d'une licence payée sur CE poste
 * (changement de PC, navigateur vidé). Clé bcr_… ou email de paiement.
 * Bascule automatique : l'ancien poste est déconnecté au-delà du quota.
 */
export function ReactivateLicense() {
  const { dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = useCallback(async () => {
    const raw = value.trim();
    if (!raw) {
      setError('Saisissez votre clé bcr_… ou votre email de paiement.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const isKey = raw.toLowerCase().startsWith('bcr_');
      const response = await fetch('/api/license/reactivate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(isKey ? { licenseKey: raw } : { email: raw.toLowerCase() }),
          deviceId: getDeviceId(),
        }),
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
      if (!response.ok || !result?.activated || !result.licenseKey || !result.plan) {
        setError(result?.error ?? 'Réactivation impossible pour le moment.');
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
      setOpen(false);
      setValue('');
      dispatch({
        type: 'TOAST_SHOW',
        msg: `Licence ${getAccessPlanLabel(plan)} réactivée sur ce poste.`,
      });
    } catch {
      setError('Réseau indisponible — réessayez.');
    } finally {
      setBusy(false);
    }
  }, [value, dispatch]);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="font-semibold text-ink-soft underline underline-offset-2 hover:text-brick"
      >
        Déjà client ?
      </button>

      {open && (
        <span
          id={panelId}
          className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-line bg-surface p-3 text-left shadow-lg dark:bg-paper-2"
        >
          <span className="block text-xs font-semibold text-ink">
            Réactiver ma licence sur ce poste
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-ink-mute">
            Clé de licence (bcr_…) ou email de paiement Stripe. L’ancien poste sera
            déconnecté si votre quota de postes est atteint.
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void submit();
              if (event.key === 'Escape') setOpen(false);
            }}
            placeholder="bcr_… ou email@societe.fr"
            aria-label="Clé de licence ou email de paiement"
            className="mt-2 w-full rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick dark:bg-paper-2"
          />
          {error && (
            <span className="mt-1.5 block text-[11px] leading-snug text-brick-deep" role="alert">
              {error}
            </span>
          )}
          <span className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-[11px] text-ink-mute hover:text-ink"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={busy}
              className="rounded-md border border-brick bg-brick px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brick-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Réactivation…' : 'Réactiver'}
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
