'use client';

import { useCallback, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { useAppContext } from '@/lib/app-state';
import { batchGenerate, normalizeOutputName } from '@/lib/bim/nomenclature';
import { getActiveFieldsForProfile, normalizeFieldValuesForGeneration } from '@/lib/profiles';
import { normalizeZipArchiveName, writeZip } from '@/lib/bim/zip-io';
import { useFileIngestion } from '@/lib/hooks/useFileIngestion';
import { Button } from './ui/Button';

function normalizeZipFolder(folder: string): string {
  return folder
    .split('/')
    .map(normalizeOutputName)
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');
}

export function ActionBar() {
  const { state, dispatch } = useAppContext();
  const { files, fields, separator, isRenaming, isUploading } = state;
  const { selectedIds, applyScope } = state.ui;
  const [zipName, setZipName] = useState('FICHIERS_RENOMMES');
  const { processFiles } = useFileIngestion();
  const addInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenAddPicker = useCallback(() => {
    addInputRef.current?.click();
  }, []);

  const handleAddInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(event.target.files ?? []);
      if (incoming.length > 0) {
        await processFiles(incoming);
      }
      event.target.value = '';
    },
    [processFiles],
  );

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
        msg: `${renamed}/${targetFiles.length} fichier(s) renommé(s).`,
      });
    } catch (err) {
      dispatch({ type: 'RENAME_ALL_COMPLETE', results: [] });
      dispatch({
        type: 'TOAST_SHOW',
        msg: `Erreur lors du renommage: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, [
    hasTarget,
    targetFiles,
    fields,
    separator,
    state.profileId,
    state.profileEntities,
    dispatch,
  ]);

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
      const entries = renamedFiles.map((f) => {
        const folder = normalizeZipFolder(f.folder);
        const filename = normalizeOutputName(f.newName!);
        return {
          path: folder ? `${folder}/${filename}` : filename,
          blob: f.blob,
        };
      });
      const zipBlob = await writeZip(entries);
      saveAs(zipBlob, normalizeZipArchiveName(zipName));
      dispatch({ type: 'TOAST_SHOW', msg: 'ZIP téléchargé !' });
    } catch (err) {
      dispatch({
        type: 'TOAST_SHOW',
        msg: `Erreur ZIP: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }, [targetFiles, zipName, dispatch]);

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

      {/* Add more files — shortcut to the upload picker, available even when
          the dropzone is scrolled out of view. */}
      <Button
        variant="secondary"
        onClick={handleOpenAddPicker}
        loading={isUploading}
        aria-label="Ajouter des fichiers à la liste"
      >
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
            d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5M20 14a8 8 0 01-14 5"
          />
        </svg>
        Ajouter des fichiers
      </Button>
      <input
        ref={addInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.ifc,.rvt,.nwd,.png,.jpg,.jpeg,.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleAddInputChange}
      />

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

      {hasFiles && (
        <label className="flex min-w-0 items-center gap-1.5 text-xs text-ink-mute">
          <span className="hidden sm:inline">Nom ZIP</span>
          <input
            type="text"
            value={zipName}
            onChange={(event) => setZipName(event.target.value)}
            placeholder="FICHIERS_RENOMMES"
            className="w-36 rounded-md border border-line bg-white px-2 py-1 text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick"
            aria-label="Nom du fichier ZIP"
          />
        </label>
      )}

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
