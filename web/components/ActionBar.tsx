'use client';

import { useCallback } from 'react';
import { saveAs } from 'file-saver';
import { useAppContext } from '@/lib/app-state';
import { batchGenerate } from '@/lib/bim/nomenclature';
import { getActiveFieldsForProfile, normalizeFieldValuesForGeneration } from '@/lib/profiles';
import { writeZip } from '@/lib/bim/zip-io';
import { Button } from './ui/Button';

export function ActionBar() {
  const { state, dispatch } = useAppContext();
  const { files, fields, separator, isRenaming } = state;
  const { selectedIds, applyScope } = state.ui;

  const hasFiles = files.length > 0;
  const hasSelection = selectedIds.length > 0;

  // Effective file set for actions
  const targetFiles =
    applyScope === 'selection' && hasSelection
      ? files.filter((f) => selectedIds.includes(f.id))
      : files;

  const hasTarget = targetFiles.length > 0;
  const hasRenamed = targetFiles.some((f) => f.status === 'renamed');

  // --- Scope toggle ---

  const handleScopeChange = useCallback(
    (scope: 'selection' | 'all') => {
      dispatch({ type: 'APPLY_SCOPE_SET', scope });
    },
    [dispatch],
  );

  // --- Rename ---

  const handleRename = useCallback(() => {
    if (!hasTarget) return;
    dispatch({ type: 'RENAME_ALL_START' });

    const ctx = {
      activeFields: getActiveFieldsForProfile(
        fields,
        state.profileId,
        state.profileEntities[state.profileId] ?? [],
      ),
      fieldValues: normalizeFieldValuesForGeneration(fields.values, state.profileId, separator),
      separator,
      workLotPart: fields.workLotPart ?? undefined,
    };

    try {
      // batchGenerate accepts any subset of files
      const results = batchGenerate(targetFiles, ctx);
      dispatch({ type: 'RENAME_ALL_COMPLETE', results });
      const renamed = results.filter((r) => r.errors.length === 0).length;
      dispatch({
        type: 'TOAST_SHOW',
        msg: `${renamed}/${targetFiles.length} fichier(s) renommé(s)`,
      });
    } catch (err) {
      dispatch({ type: 'RENAME_ALL_COMPLETE', results: [] });
      dispatch({
        type: 'TOAST_SHOW',
        msg: `Erreur lors du renommage: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, [hasTarget, targetFiles, fields, separator, state.profileId, state.profileEntities, dispatch]);

  // --- Download ZIP ---

  const handleDownloadZip = useCallback(async () => {
    const renamedFiles = targetFiles.filter((f) => f.newName && f.status === 'renamed');
    if (renamedFiles.length === 0) {
      dispatch({
        type: 'TOAST_SHOW',
        msg: 'Renommez les fichiers avant de télécharger le ZIP',
      });
      return;
    }

    try {
      const entries = renamedFiles.map((f) => ({
        path: f.folder ? `${f.folder}/${f.newName!}` : f.newName!,
        blob: f.blob,
      }));
      const zipBlob = await writeZip(entries);
      saveAs(zipBlob, 'renamed.zip');
      dispatch({ type: 'TOAST_SHOW', msg: 'ZIP téléchargé !' });
    } catch (err) {
      dispatch({
        type: 'TOAST_SHOW',
        msg: `Erreur ZIP: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, [targetFiles, dispatch]);

  // --- Reset ---

  const handleReset = useCallback(() => {
    dispatch({ type: 'FILES_RESET' });
    dispatch({ type: 'TOAST_SHOW', msg: 'Liste effacée' });
  }, [dispatch]);

  // --- Labels ---

  const renameLabel =
    applyScope === 'selection' && hasSelection
      ? 'Renommer la sélection'
      : 'Renommer tout';

  const zipLabel =
    applyScope === 'selection' && hasSelection
      ? `Télécharger la sélection (ZIP)`
      : 'Télécharger tout (ZIP)';

  // Segmented control: "selection" option is disabled (but shown) when no files selected
  const selectionDisabled = !hasSelection;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Apply-to segmented control */}
      {hasFiles && (
        <div
          className="flex items-center gap-1.5 rounded-full border border-line bg-paper-2/60 px-1 py-1 text-xs font-sans"
          role="group"
          aria-label="Appliquer à"
        >
          <span className="pl-1.5 pr-0.5 text-ink-mute shrink-0 hidden sm:inline">
            Appliquer à :
          </span>

          {/* Selection segment */}
          <button
            type="button"
            role="radio"
            aria-checked={applyScope === 'selection'}
            disabled={selectionDisabled}
            onClick={() => handleScopeChange('selection')}
            className={[
              'rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
              applyScope === 'selection' && !selectionDisabled
                ? 'bg-ink text-paper font-medium'
                : selectionDisabled
                  ? 'text-ink-mute cursor-not-allowed opacity-50'
                  : 'text-ink-soft hover:bg-paper-2',
            ].join(' ')}
          >
            Sélection{hasSelection ? ` (${selectedIds.length})` : ' (0)'}
          </button>

          {/* All-files segment */}
          <button
            type="button"
            role="radio"
            aria-checked={applyScope === 'all'}
            onClick={() => handleScopeChange('all')}
            className={[
              'rounded-full px-3 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
              applyScope === 'all'
                ? 'bg-ink text-paper font-medium'
                : 'text-ink-soft hover:bg-paper-2',
            ].join(' ')}
          >
            Tous les fichiers
          </button>
        </div>
      )}

      {/* Primary actions */}
      <Button
        variant="primary"
        onClick={handleRename}
        disabled={!hasTarget}
        loading={isRenaming}
        aria-label={`${renameLabel} selon la nomenclature active`}
      >
        {/* Rename icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h9" />
        </svg>
        {renameLabel}
      </Button>

      <Button
        variant="secondary"
        onClick={handleDownloadZip}
        disabled={!hasRenamed}
        aria-label={zipLabel}
      >
        {/* Download icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
          />
        </svg>
        {zipLabel}
      </Button>

      <Button
        variant="ghost"
        onClick={handleReset}
        disabled={!hasFiles}
        aria-label="Supprimer tous les fichiers de la liste"
      >
        Tout effacer
      </Button>
    </div>
  );
}
