'use client';

import { useFileDrop } from '@/lib/hooks/useFileDrop';
import { useFileIngestion } from '@/lib/hooks/useFileIngestion';

interface UploadZoneProps {
  /** When true, renders as a compact bar (~40px) instead of the full drop zone. */
  readonly compact?: boolean;
}

export function UploadZone({ compact = false }: UploadZoneProps) {
  const { processFiles } = useFileIngestion();

  const { isDragging, handleDragEnter, handleDragOver, handleDragLeave, handleDrop, openFilePicker, inputRef } =
    useFileDrop({ onFiles: processFiles });

  const sharedDragProps = {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.ifc,.rvt,.nwd,.png,.jpg,.jpeg,.zip,.rar,.7z,.tar,.gz,.tgz,.bz2,.xz"
      className="sr-only"
      aria-hidden="true"
      tabIndex={-1}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) processFiles(files);
        e.target.value = '';
      }}
    />
  );

  /* ── Compact bar (shown when files are already loaded) ── */
  if (compact) {
    return (
      <div
        {...sharedDragProps}
        onClick={openFilePicker}
        role="button"
        tabIndex={0}
        aria-label="Ajouter des fichiers. Cliquez ou glissez ici"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') openFilePicker();
        }}
        className={[
          'flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-xs font-sans font-medium transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
          isDragging
            ? 'border-brick bg-brick/5 text-brick'
            : 'border-dashed border-line bg-paper-2/40 text-ink-soft hover:border-brick/50 hover:bg-paper-2/70 hover:text-brick',
        ].join(' ')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {isDragging ? 'Relâchez pour ajouter' : 'Ajouter des fichiers ou glisser un ZIP'}
        {hiddenInput}
      </div>
    );
  }

  /* ── Full drop zone (shown when no files loaded yet) ── */
  return (
    <div
      {...sharedDragProps}
      onClick={openFilePicker}
      role="button"
      tabIndex={0}
      aria-label="Zone de dépôt de fichiers. Cliquez ou glissez vos fichiers ici"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openFilePicker();
      }}
      className={[
        'relative flex max-h-[200px] min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick',
        isDragging
          ? 'border-brick bg-brick/5'
          : 'border-line bg-paper-2/40 hover:border-brick/50 hover:bg-paper-2/70',
      ].join(' ')}
    >
      {/* Upload icon */}
      <svg
        className={`mb-3 h-10 w-10 transition-colors ${isDragging ? 'text-brick' : 'text-ink-mute'}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-sm font-sans font-medium text-ink">
        {isDragging ? 'Relâchez pour ajouter' : 'Glissez vos fichiers / un ZIP ici'}
      </p>
      <p className="mt-1 text-xs font-sans text-ink-soft">
        ou{' '}
        <span className="font-medium text-brick underline underline-offset-2">
          cliquez pour parcourir
        </span>
      </p>
      <p className="mt-2 text-xs text-ink-mute">
        PDF, DWG, IFC, RVT, images — ou ZIP / RAR / 7z / TAR / GZIP
      </p>

      {hiddenInput}
    </div>
  );
}
