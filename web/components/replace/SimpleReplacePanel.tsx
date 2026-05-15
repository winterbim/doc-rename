'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '@/lib/app-state';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getVisibleFiles } from '@/lib/file-filters';

/**
 * Count how many files would be affected by a find/replace without applying it.
 */
function countAffected(
  sources: string[],
  find: string,
  caseSensitive: boolean,
  regex: boolean
): number {
  if (!find) return 0;
  let count = 0;
  for (const source of sources) {
    try {
      if (regex) {
        const flags = caseSensitive ? '' : 'i';
        const re = new RegExp(find, flags);
        if (re.test(source)) count++;
      } else {
        const haystack = caseSensitive ? source : source.toLowerCase();
        const needle = caseSensitive ? find : find.toLowerCase();
        if (haystack.includes(needle)) count++;
      }
    } catch {
      // invalid regex — count 0 for this file
    }
  }
  return count;
}

export function SimpleReplacePanel() {
  const { state, dispatch } = useAppContext();

  const [find, setFind] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexMode, setRegexMode] = useState(false);

  const debouncedFind = useDebounce(find, 150);

  const visibleFiles = useMemo(() => getVisibleFiles(state), [state]);

  // Determine target files: selected (filtered to visible) or all visible
  const selectedSet = useMemo(
    () => new Set(state.ui.selectedIds),
    [state.ui.selectedIds]
  );
  const targetFiles = useMemo(() => {
    const visibleSelected = visibleFiles.filter((f) => selectedSet.has(f.id));
    return visibleSelected.length > 0 ? visibleSelected : visibleFiles;
  }, [visibleFiles, selectedSet]);

  const affectedCount = useMemo(() => {
    const sources = targetFiles.map((f) => f.newName ?? f.original);
    return countAffected(sources, debouncedFind, caseSensitive, regexMode);
  }, [targetFiles, debouncedFind, caseSensitive, regexMode]);

  const handleApply = () => {
    if (!find) return;
    const fileIds = targetFiles.map((f) => f.id);
    dispatch({
      type: 'FILES_REPLACE_TEXT',
      find,
      replace: replaceWith,
      caseSensitive,
      regex: regexMode,
      fileIds,
    });
  };

  const hasSelection = state.ui.selectedIds.length > 0;
  const usingSelection = hasSelection && targetFiles.length < visibleFiles.length;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-[10px] font-sans font-medium uppercase tracking-[0.15em] text-ink-mute mb-2.5">
        Remplacement simple
      </h2>

      {/* Find input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="replace-find" className="text-xs font-sans font-medium text-ink-soft">
          Rechercher
        </label>
        <input
          id="replace-find"
          type="text"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Texte à trouver…"
          className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink placeholder-ink-mute focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition"
        />
      </div>

      {/* Replace input */}
      <div className="flex flex-col gap-1">
        <label htmlFor="replace-with" className="text-xs font-sans font-medium text-ink-soft">
          Remplacer par
        </label>
        <input
          id="replace-with"
          type="text"
          value={replaceWith}
          onChange={(e) => setReplaceWith(e.target.value)}
          placeholder="(vide = supprimer)"
          className="rounded-md border border-line bg-white px-2.5 py-1.5 text-sm text-ink placeholder-ink-mute focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition"
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft select-none">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line text-brick focus:ring-brick focus:ring-offset-0"
          />
          Sensible à la casse
        </label>

        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-soft select-none">
          <input
            type="checkbox"
            checked={regexMode}
            onChange={(e) => setRegexMode(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line text-brick focus:ring-brick focus:ring-offset-0"
          />
          Mode expression régulière
        </label>
      </div>

      {/* Live preview */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="rounded-md bg-paper-2/40 px-3 py-2 text-xs text-ink-mute"
      >
        {!find ? (
          <span>Saisissez un texte à rechercher.</span>
        ) : affectedCount === 0 ? (
          <span>Aucun fichier ne sera affecté.</span>
        ) : (
          <span>
            <span className="font-semibold text-brick">{affectedCount}</span>{' '}
            fichier{affectedCount !== 1 ? 's' : ''} seront affectés
            {usingSelection ? ' (sélection)' : ''}.
          </span>
        )}
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={handleApply}
        disabled={!find || affectedCount === 0}
        className="w-full rounded-full bg-ink px-3 py-2 text-sm font-sans font-medium text-paper hover:bg-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick disabled:cursor-not-allowed disabled:opacity-40 transition"
      >
        Appliquer
        {usingSelection ? ' à la sélection' : ''}
      </button>
    </div>
  );
}
