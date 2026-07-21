'use client';

import { useMemo } from 'react';
import { useAppContext } from '@/lib/app-state';
import { getVisibleFiles } from '@/lib/file-filters';
import { PAID_PILOT_PRICE_LABEL, pilotCta } from '@/lib/pricing';
import { FileRow } from './FileRow';
import { UploadZone } from './UploadZone';
import { SearchAndFilter } from './files/SearchAndFilter';

export function FilesList() {
  const { state, dispatch } = useAppContext();
  const { files, isUploading } = state;

  const visibleFiles = useMemo(() => getVisibleFiles(state), [state]);

  const visibleIds = useMemo(
    () => visibleFiles.map((f) => f.id),
    [visibleFiles]
  );

  const selectedSet = useMemo(
    () => new Set(state.ui.selectedIds),
    [state.ui.selectedIds]
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));

  const renamedCount = files.filter((file) => file.status === 'renamed').length;

  const handleSelectAllToggle = () => {
    if (allVisibleSelected) {
      dispatch({ type: 'FILES_DESELECT_ALL' });
    } else {
      dispatch({ type: 'FILES_SELECT_ALL', ids: visibleIds });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <UploadZone compact={files.length > 0} />

      {isUploading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
          <svg
            className="h-4 w-4 animate-spin text-brick"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Extraction du ZIP en cours…
        </div>
      )}

      {files.length === 0 && !isUploading && (
        <p className="text-center text-sm font-sans text-ink-mute py-4">
          Aucun fichier ajouté. Déposez des fichiers ci-dessus.
        </p>
      )}

      {files.length > 0 && (
        <>
          {/* Search + extension filter */}
          <SearchAndFilter />

          {renamedCount > 0 && (
            <section
              className="rounded-lg border border-brick/30 bg-brick/5 px-4 py-3"
              aria-label="Conversion pilote BIM"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Lot prêt à déposer : {renamedCount} fichier(s) renommé(s).
                  </p>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">
                    Si ce workflow vous évite une reprise manuelle, demandez un échange sur
                    le futur pilote BIM — tarif cible {PAID_PILOT_PRICE_LABEL} : convention
                    reproduite, onboarding 30 min et test sur un lot réel non sensible.
                  </p>
                </div>
                <a
                  href={pilotCta.href}
                  {...(pilotCta.checkout ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-full bg-ink px-4 text-xs font-semibold text-paper transition hover:bg-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
                >
                  {pilotCta.label}
                </a>
              </div>
            </section>
          )}

          {/* Select-all toolbar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectAllToggle}
              className="rounded px-2.5 py-1 text-xs font-medium font-sans text-brick hover:bg-brick/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
            >
              {allVisibleSelected
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>

            {visibleFiles.length !== files.length && (
              <span className="text-xs font-sans text-ink-mute">
                {visibleFiles.length} / {files.length} fichiers
              </span>
            )}
          </div>

          {visibleFiles.length === 0 ? (
            <p className="text-center text-sm font-sans text-ink-mute py-4">
              Aucun fichier ne correspond aux filtres.
            </p>
          ) : (
            <ul className="flex flex-col gap-2 pr-1" aria-label="Liste des fichiers">
              {visibleFiles.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
