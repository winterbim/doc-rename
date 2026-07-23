'use client';

import { useFileDrop } from '@/lib/hooks/useFileDrop';
import { useFileIngestion } from '@/lib/hooks/useFileIngestion';
import { useAppContext } from '@/lib/app-state';
import { getActiveFieldsForProfile } from '@/lib/profiles';

interface UploadZoneProps {
  /** When true, renders as a compact bar (~40px) instead of the full drop zone. */
  readonly compact?: boolean;
}

function createDemoFiles(): File[] {
  return [
    new File(['%PDF-1.4\n% BIMCHECK demo fixture\n'], 'facade etage 1 FINAL v2.pdf', {
      type: 'application/pdf',
    }),
    new File(['0\nSECTION\n2\nENTITIES\n0\nENDSEC\n0\nEOF\n'], 'plan rdc copie.dwg', {
      type: 'application/acad',
    }),
    new File(['BIMCHECK demo document\n'], 'rapport synthese v3.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    new File(['ISO-10303-21;\nHEADER;\nENDSEC;\nEND-ISO-10303-21;\n'], 'maquette structure ifc export.ifc', {
      type: 'application/octet-stream',
    }),
    new File(['Lot;Emetteur;Discipline\nARC;AGC;A\nSTR;BET;S\n'], 'bordereau diffusion revA.csv', {
      type: 'text/csv',
    }),
  ];
}

export function UploadZone({ compact = false }: UploadZoneProps) {
  const { processFiles } = useFileIngestion();
  const { state, dispatch } = useAppContext();

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

  const handleLoadDemo = () => {
    void processFiles(createDemoFiles(), { demo: true });

    // P0-2 : la démo doit démontrer la convention, pas la casse. On pré-remplit
    // les champs actifs vides avec leur valeur d'exemple (les placeholders sont
    // les segments du modèle affiché : PROJET, BAT, CVC, PLAN, ENT, 001…) pour
    // que « Renommer tout » produise immédiatement des noms structurés.
    const activeDefs = getActiveFieldsForProfile(
      state.fields,
      state.profileId,
      state.profileEntities[state.profileId] ?? [],
    );
    for (const def of activeDefs) {
      if (def.id === 'filename') continue;
      const current = state.fields.values[def.id];
      if (!current && def.placeholder && def.inputType !== 'date') {
        dispatch({ type: 'FIELD_VALUE_SET', fieldId: def.id, value: def.placeholder });
      }
    }
  };

  /* ── Compact bar (shown when files are already loaded) ── */
  if (compact) {
    return (
      <div
        {...sharedDragProps}
        className={[
          'flex h-10 items-center rounded-lg border text-xs font-sans font-medium transition-colors duration-150',
          isDragging
            ? 'border-brick bg-brick/5 text-brick'
            : 'border-dashed border-line bg-paper-2/40 text-ink-soft hover:border-brick/50 hover:bg-paper-2/70 hover:text-brick',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={openFilePicker}
          className="flex h-full w-full cursor-pointer items-center gap-2 rounded-lg px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
          aria-label={isDragging ? 'Relâchez pour ajouter' : 'Ajouter des fichiers ou glisser un ZIP'}
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
        </button>
        {hiddenInput}
      </div>
    );
  }

  /* ── Full drop zone (shown when no files loaded yet) ── */
  return (
    <div className="flex flex-col gap-3">
      <div
        {...sharedDragProps}
        className={[
          'relative flex max-h-[200px] min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors duration-150',
          isDragging
            ? 'border-brick bg-brick/5'
            : 'border-line bg-paper-2/40 hover:border-brick/50 hover:bg-paper-2/70',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={openFilePicker}
          className="flex min-h-[136px] w-full cursor-pointer flex-col items-center justify-center rounded-xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
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

          <span className="text-sm font-sans font-medium text-ink">
            {isDragging ? 'Relâchez pour ajouter' : 'Glissez vos fichiers ou un ZIP ici,'}
          </span>
          <span className="mt-1 text-xs font-sans text-ink-soft">
            ou{' '}
            <span className="font-medium text-brick underline underline-offset-2">
              cliquez pour parcourir
            </span>
          </span>
          <span className="mt-2 text-xs text-ink-soft">
            PDF, DWG, IFC, RVT, images — ou ZIP / RAR / 7z / TAR / GZIP
          </span>
        </button>

        {hiddenInput}
      </div>

      <button
        type="button"
        onClick={handleLoadDemo}
        className="inline-flex min-h-9 items-center justify-center self-center rounded-full border border-line bg-surface px-4 text-xs font-sans font-semibold text-ink-soft transition-colors hover:border-brick hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick dark:bg-paper-2"
      >
        Charger un lot exemple
      </button>
    </div>
  );
}
