'use client';

import { useState, useRef, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { useAppContext } from '@/lib/app-state';
import type { BimFile } from '@/lib/bim/types';
import { NameEditorModal } from './NameEditorModal';
import { FileTypePill } from './FileTypePill';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const statusColors: Record<string, string> = {
  ready: 'bg-paper-2 text-ink-mute',
  renamed: 'bg-olive/15 text-olive',
  error: 'bg-brick/10 text-brick-deep',
};

const statusLabels: Record<string, string> = {
  ready: 'Prêt',
  renamed: 'Renommé',
  error: 'Erreur',
};

interface FileRowProps {
  file: BimFile;
}

export function FileRow({ file }: FileRowProps) {
  const { state, dispatch } = useAppContext();
  const [modalOpen, setModalOpen] = useState(false);
  const editBtnRef = useRef<HTMLButtonElement>(null);

  const isSelected = state.ui.selectedIds.includes(file.id);

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    // Restore focus to the trigger button
    editBtnRef.current?.focus();
  }, []);

  const handleApply = useCallback(
    (newName: string) => {
      dispatch({ type: 'FILE_RENAME_OVERRIDE', fileId: file.id, newName });
      setModalOpen(false);
      editBtnRef.current?.focus();
    },
    [dispatch, file.id]
  );

  return (
    <>
      <li
        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-[1px] transition-all ${
          isSelected
            ? 'bg-gold-soft/15 border-brick/50'
            : 'border-line bg-white hover:border-line-2'
        }`}
      >
        {/* Selection checkbox */}
        <label className="shrink-0 cursor-pointer">
          <span className="sr-only">Sélectionner {file.original}</span>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() =>
              dispatch({ type: 'FILE_SELECT_TOGGLE', fileId: file.id })
            }
            className="h-4 w-4 cursor-pointer rounded border-line text-brick focus:ring-brick focus:ring-offset-0"
          />
        </label>

        {/* Colored extension pill */}
        <FileTypePill name={file.original} />

        {/* Names */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-mono text-ink" title={file.original}>
            {file.original}
          </p>
          {file.newName ? (
            <p className="truncate text-xs font-mono text-olive font-medium mt-0.5" title={file.newName}>
              {/* Arrow right */}
              <span aria-hidden="true" className="mr-1 text-ink-mute">→</span>
              {file.newName}
            </p>
          ) : (
            <p className="truncate font-sans text-xs text-ink-mute mt-0.5">
              {file.folder ? `/${file.folder}/` : 'Racine'}
            </p>
          )}
        </div>

        {/* Size */}
        <span className="shrink-0 text-xs text-ink-mute hidden sm:block">
          {formatBytes(file.size)}
        </span>

        {/* Status badge */}
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[file.status]}`}
        >
          {statusLabels[file.status]}
        </span>

        {/* Preview button */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'PREVIEW_OPEN', fileId: file.id })}
          aria-label={`Aperçu de ${file.original}`}
          className="shrink-0 rounded p-1 text-ink-mute hover:bg-paper-2 hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>

        {/* Download button */}
        <button
          type="button"
          onClick={() => saveAs(file.blob, file.newName ?? file.original)}
          aria-label={`Télécharger ${file.newName ?? file.original}`}
          title="Télécharger ce fichier"
          className="shrink-0 rounded p-1 text-ink-mute hover:bg-paper-2 hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        </button>

        {/* Edit button */}
        <button
          ref={editBtnRef}
          type="button"
          onClick={handleOpenModal}
          aria-label={`Modifier le nom de ${file.original}`}
          className="shrink-0 rounded p-1 text-ink-mute hover:bg-paper-2 hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
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
              d="M15.232 5.232l3.536 3.536M9 13l-4 1 1-4 9.5-9.5a2.5 2.5 0 013.536 3.536L9 13z"
            />
          </svg>
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => dispatch({ type: 'FILE_REMOVE', id: file.id })}
          aria-label={`Supprimer ${file.original}`}
          className="shrink-0 rounded p-1 text-ink-mute hover:bg-brick/10 hover:text-brick-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </li>

      {modalOpen && (
        <NameEditorModal
          file={file}
          defaultSeparator={state.separator}
          onApply={handleApply}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
