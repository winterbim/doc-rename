'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useAppContext } from '@/lib/app-state';
import { useAccessPlan } from '@/lib/hooks/useAccessPlan';
import { getPlanFeatures } from '@/lib/plan-features';
import {
  MAX_LIBRARY_ENTRIES,
  deleteConvention,
  duplicateConvention,
  getConvention,
  listConventions,
  saveConvention,
  updateConvention,
  type ConventionEntry,
} from '@/lib/convention-library';

/**
 * Bibliothèque de conventions multi-clients — fonctionnalité Cabinet.
 * Un cabinet jongle entre plusieurs clients/projets : chaque convention
 * (profil + champs + séparateur + entités) s'enregistre sous un nom et se
 * recharge en un clic. Les autres plans voient un aperçu verrouillé.
 */
export function ConventionLibrary() {
  const { state, dispatch } = useAppContext();
  const { plan } = useAccessPlan();
  const { conventionLibrary } = getPlanFeatures(plan);

  const [entries, setEntries] = useState<ConventionEntry[]>(() => listConventions());
  const [selectedId, setSelectedId] = useState('');
  const [newName, setNewName] = useState('');

  const refresh = useCallback(() => setEntries(listConventions()), []);

  const handleLoad = useCallback(() => {
    const entry = getConvention(selectedId);
    if (!entry) return;
    dispatch({ type: 'STATE_HYDRATE', slices: entry.slices });
    dispatch({ type: 'TOAST_SHOW', msg: `Convention « ${entry.name} » chargée.` });
  }, [selectedId, dispatch]);

  const handleSaveNew = useCallback(() => {
    const entry = saveConvention(newName, state);
    if (!entry) {
      dispatch({
        type: 'TOAST_SHOW',
        msg: newName.trim()
          ? `Bibliothèque pleine (${MAX_LIBRARY_ENTRIES} conventions max).`
          : 'Donnez un nom (client ou projet) à la convention.',
      });
      return;
    }
    setNewName('');
    setSelectedId(entry.id);
    refresh();
    dispatch({ type: 'TOAST_SHOW', msg: `Convention « ${entry.name} » enregistrée.` });
  }, [newName, state, dispatch, refresh]);

  const handleUpdate = useCallback(() => {
    const entry = updateConvention(selectedId, state);
    if (!entry) return;
    refresh();
    dispatch({ type: 'TOAST_SHOW', msg: `Convention « ${entry.name} » mise à jour.` });
  }, [selectedId, state, dispatch, refresh]);

  const handleDuplicate = useCallback(() => {
    const copy = duplicateConvention(selectedId);
    if (!copy) return;
    setSelectedId(copy.id);
    refresh();
    dispatch({ type: 'TOAST_SHOW', msg: `Convention dupliquée : « ${copy.name} ».` });
  }, [selectedId, dispatch, refresh]);

  const handleDelete = useCallback(() => {
    const entry = getConvention(selectedId);
    if (!entry) return;
    deleteConvention(selectedId);
    setSelectedId('');
    refresh();
    dispatch({ type: 'TOAST_SHOW', msg: `Convention « ${entry.name} » supprimée.` });
  }, [selectedId, dispatch, refresh]);

  if (!conventionLibrary) {
    return (
      <div className="rounded-md border border-dashed border-line bg-paper-2/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-ink-mute">
            Conventions clients
          </span>
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-brick-deep">
            Cabinet
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-ink-mute">
          Enregistrez une convention par client ou projet et basculez en un clic.{' '}
          <Link href="/pricing" className="font-semibold text-brick underline underline-offset-2">
            Découvrir Cabinet
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 dark:bg-paper-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-mute">
          Conventions clients
        </span>
        <span className="rounded-full border border-olive/30 bg-olive/10 px-2 py-0.5 text-[10px] font-medium text-olive">
          {entries.length}/{MAX_LIBRARY_ENTRIES}
        </span>
      </div>

      {entries.length > 0 && (
        <div className="flex items-center gap-1.5">
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            aria-label="Convention enregistrée"
            className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick dark:bg-paper-2"
          >
            <option value="">Choisir une convention…</option>
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleLoad}
            disabled={!selectedId}
            className="rounded-md border border-brick bg-brick px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-brick-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Charger
          </button>
        </div>
      )}

      {selectedId && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={handleUpdate}
            className="text-[11px] font-medium text-ink-soft underline-offset-2 hover:text-brick hover:underline"
          >
            Mettre à jour avec la convention active
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            className="text-[11px] font-medium text-ink-soft underline-offset-2 hover:text-brick hover:underline"
          >
            Dupliquer
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-[11px] font-medium text-ink-soft underline-offset-2 hover:text-brick hover:underline"
          >
            Supprimer
          </button>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSaveNew();
          }}
          placeholder="Client ou projet (ex. DUPONT)"
          aria-label="Nom de la nouvelle convention"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick dark:bg-paper-2"
        />
        <button
          type="button"
          onClick={handleSaveNew}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink-soft transition-colors hover:border-brick hover:text-brick dark:bg-paper-2"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}
