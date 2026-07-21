'use client';
import type { WorkspaceFile } from '@/lib/rename-engine/types';

interface Props { readonly file: WorkspaceFile }

const REASONS: Record<string, string> = {
  '.rvt': "Format propriétaire Autodesk Revit. Une visualisation web complète requiert l'API Autodesk Platform Services (payante).",
  '.rfa': 'Famille Revit propriétaire — même contrainte que .rvt.',
  '.dwg': 'Format propriétaire Autodesk. La visualisation 2D nécessite une bibliothèque payante (Open Design Alliance) ou une conversion DXF.',
  '.nwd': 'Navisworks NWD : format propriétaire Autodesk.',
  '.nwc': 'Cache Navisworks : format propriétaire Autodesk.',
  '.pptx': 'PowerPoint : rendu fidèle complexe (animations, polices, médias). Ouverture dans PowerPoint / Keynote recommandée.',
  '.ppt': 'PowerPoint legacy : voir .pptx.',
  '.skp': 'SketchUp : format propriétaire. Visualisation via SketchUp Viewer recommandée.',
  '.step': 'STEP : modèle CAO 3D paramétrique. Visualisation nécessite un rendu 3D dédié (à venir).',
  '.stp': 'STEP : voir .step.',
  '.iges': 'IGES : modèle CAO 3D. Visualisation 3D non implémentée.',
  '.igs': 'IGES : voir .iges.',
  '.ifc': "IFC : modèle BIM 3D. Une visualisation 3D nécessite ~10 Mo de JavaScript supplémentaires (web-ifc-viewer) — pas encore intégré.",
};

function downloadBlob(file: WorkspaceFile) {
  const url = URL.createObjectURL(file.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.newName ?? file.original;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function NoPreview({ file }: Props) {
  const reason =
    REASONS[file.extension.toLowerCase()] ??
    "Format non supporté pour l'aperçu dans le navigateur.";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-paper-2 text-brick">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-3-3v6M5 8l3-3h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"
          />
        </svg>
      </div>
      <p className="font-sans font-semibold text-ink mb-1">Aperçu non disponible</p>
      <p className="font-sans text-xs uppercase tracking-wider text-ink-mute mb-3">
        {file.extension.replace('.', '')}
      </p>
      <p className="max-w-md text-sm font-sans text-ink-soft leading-relaxed mb-5">
        {reason}
      </p>
      <button
        type="button"
        onClick={() => downloadBlob(file)}
        className="rounded-full bg-ink px-5 py-2 text-sm font-sans font-medium text-paper hover:bg-brick transition-colors"
      >
        Télécharger pour ouvrir
      </button>
    </div>
  );
}
