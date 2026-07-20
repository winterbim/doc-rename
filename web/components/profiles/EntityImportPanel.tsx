'use client';

import { useState } from 'react';
import { getIndustryProfile, importEntitiesFromText } from '@/lib/profiles';
import { useAppContext } from '@/lib/app-state';
import { checkFilename, checkSize } from '@/lib/upload-guard';

function formatEntityCount(count: number): string {
  return count === 1 ? '1 entité dans ce profil' : `${count} entités dans ce profil`;
}

export function EntityImportPanel() {
  const { state, dispatch } = useAppContext();
  const [text, setText] = useState('');
  const [isImportingFile, setIsImportingFile] = useState(false);
  const profile = getIndustryProfile(state.profileId);
  const entities = state.profileEntities[state.profileId] ?? [];

  function importText(rawText: string, successMessage: string) {
    const imported = importEntitiesFromText(rawText, state.profileId);
    if (imported.length === 0) {
      dispatch({ type: 'TOAST_SHOW', msg: 'Aucune entité exploitable trouvée.' });
      return false;
    }
    dispatch({ type: 'PROFILE_ENTITY_IMPORT', profileId: state.profileId, entities: imported });
    dispatch({ type: 'TOAST_SHOW', msg: successMessage });
    return true;
  }

  function handleImport() {
    if (!importText(text, 'Liste importée.')) return;
    setText('');
  }

  async function handleFileImport(file: File) {
    const filenameCheck = checkFilename(file.name);
    if (!filenameCheck.ok) throw new Error(filenameCheck.reason);

    const sizeCheck = checkSize(file.size);
    if (!sizeCheck.ok) throw new Error(sizeCheck.reason);

    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.ods')) {
      const xlsx = await import('xlsx');
      const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error('Le fichier ne contient aucune feuille.');
      const tableText = xlsx.utils.sheet_to_csv(workbook.Sheets[firstSheetName], {
        FS: '\t',
        blankrows: false,
      });
      importText(tableText, 'Liste Excel importée.');
      return;
    }

    importText(await file.text(), 'Liste fichier importée.');
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 dark:bg-paper-2">
      <label htmlFor="profile-entities" className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
        {profile.entityImportLabel}
      </label>
      <textarea
        id="profile-entities"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Une entrée par ligne, ou collez depuis Excel"
        rows={3}
        className="w-full resize-y rounded-md border border-line bg-surface px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick dark:bg-paper-2"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-ink-mute">{formatEntityCount(entities.length)}</span>
        <div className="flex items-center gap-1.5">
          <label
            className={[
              'rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-soft transition-colors hover:border-brick hover:text-brick dark:bg-paper-2',
              isImportingFile ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
            title="Importer une liste Excel, ODS, CSV, TSV ou TXT"
          >
            {isImportingFile ? 'Import en cours...' : 'Fichier'}
            <input
              type="file"
              accept=".xlsx,.xls,.ods,.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
              disabled={isImportingFile}
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setIsImportingFile(true);
                try {
                  await handleFileImport(file);
                } catch (error) {
                  dispatch({
                    type: 'TOAST_SHOW',
                    msg: error instanceof Error ? error.message : 'Fichier invalide.',
                  });
                } finally {
                  setIsImportingFile(false);
                  event.target.value = '';
                }
              }}
            />
          </label>
          <button
            type="button"
            onClick={handleImport}
            disabled={!text.trim()}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-ink-soft transition-colors hover:border-brick hover:text-brick disabled:cursor-not-allowed disabled:opacity-50 dark:bg-paper-2"
          >
            Coller
          </button>
        </div>
      </div>

      {entities.length > 0 && (
        <div className="flex max-h-24 flex-wrap gap-1 overflow-auto">
          {entities.slice(0, 24).map((entity) => (
            <span
              key={entity.id}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-1.5 py-0.5 text-[10px] text-ink-soft"
              title={entity.label}
            >
              {entity.code}
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'PROFILE_ENTITY_REMOVE',
                    profileId: state.profileId,
                    entityId: entity.id,
                  })
                }
                aria-label={`Supprimer ${entity.code}`}
                className="text-ink-mute hover:text-brick"
              >
                x
              </button>
            </span>
          ))}
          {entities.length > 24 && (
            <span className="text-[10px] text-ink-mute">+{entities.length - 24}</span>
          )}
        </div>
      )}
    </div>
  );
}
