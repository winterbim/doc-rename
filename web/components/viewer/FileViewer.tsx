'use client';

import { Suspense, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/lib/app-state';
import type { WorkspaceFile } from '@/lib/rename-engine/types';
import { ImagePreview } from './ImagePreview';
import { TextPreview } from './TextPreview';
import { NoPreview } from './NoPreview';
import { ViewerSkeleton } from './ViewerSkeleton';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { checkPreviewSize } from '@/lib/preview-guard';

// PDF preview is SSR-disabled (PDF.js requires window/canvas)
const PdfPreview = dynamic(
  () => import('./PdfPreview').then((m) => ({ default: m.PdfPreview })),
  { ssr: false }
);

// Heavy libs (mammoth, xlsx, dxf-parser) — lazy-loaded only when needed
const DocxPreview = dynamic(
  () => import('./DocxPreview').then((m) => ({ default: m.DocxPreview })),
  { ssr: false }
);
const SpreadsheetPreview = dynamic(
  () => import('./SpreadsheetPreview').then((m) => ({ default: m.SpreadsheetPreview })),
  { ssr: false }
);
const DxfPreview = dynamic(
  () => import('./DxfPreview').then((m) => ({ default: m.DxfPreview })),
  { ssr: false }
);

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.xml',
  '.html',
  '.htm',
  '.css',
  '.scss',
  '.sass',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.c',
  '.h',
  '.cc',
  '.cpp',
  '.cxx',
  '.hpp',
  '.java',
  '.cs',
  '.py',
  '.rb',
  '.go',
  '.rs',
  '.php',
  '.sh',
  '.bash',
  '.zsh',
  '.ps1',
  '.bat',
  '.cmd',
  '.sql',
  '.yaml',
  '.yml',
  '.toml',
  '.ini',
  '.cfg',
  '.conf',
  '.log',
]);
const TEXT_FILENAMES = new Set([
  'makefile',
  'dockerfile',
  'readme',
  'license',
  'changelog',
  '.env',
  '.gitignore',
  '.dockerignore',
]);
const DOCX_EXTENSIONS = new Set(['.docx', '.doc']);
const SPREADSHEET_EXTENSIONS = new Set(['.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.csv', '.tsv']);
const DXF_EXTENSIONS = new Set(['.dxf']);

function pickPreviewComponent(file: WorkspaceFile): React.ReactNode {
  const ext = file.extension.toLowerCase();
  const baseName = file.original.split(/[\\/]/).pop()?.toLowerCase() ?? file.original.toLowerCase();
  const previewSize = checkPreviewSize(ext, file.category, file.blob.size);

  if (!previewSize.ok) {
    return (
      <NoPreview
        file={file}
        title="Aperçu désactivé pour ce fichier"
        reason={`${previewSize.reason} Le renommage et le téléchargement restent disponibles.`}
      />
    );
  }

  if (ext === '.pdf') {
    return <PdfPreview file={file} />;
  }

  if (IMAGE_EXTENSIONS.has(ext) || file.category === 'images') {
    return <ImagePreview file={file} />;
  }

  if (DOCX_EXTENSIONS.has(ext)) {
    return <DocxPreview file={file} />;
  }

  if (SPREADSHEET_EXTENSIONS.has(ext)) {
    return <SpreadsheetPreview file={file} />;
  }

  if (DXF_EXTENSIONS.has(ext)) {
    return <DxfPreview file={file} />;
  }

  if (
    TEXT_EXTENSIONS.has(ext) ||
    TEXT_FILENAMES.has(baseName) ||
    file.blob.type.startsWith('text/')
  ) {
    return <TextPreview file={file} />;
  }

  // Fallback — unsupported (includes .ifc, .rvt, .dwg, .pptx, etc.)
  return <NoPreview file={file} />;
}

export function FileViewer() {
  const { state, dispatch } = useAppContext();
  const { previewingFileId } = state.ui;

  const file = previewingFileId
    ? state.files.find((f) => f.id === previewingFileId) ?? null
    : null;

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useFocusTrap(panelRef, Boolean(file));

  const close = useCallback(() => {
    dispatch({ type: 'PREVIEW_CLOSE' });
  }, [dispatch]);

  // Esc key
  useEffect(() => {
    if (!file) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, close]);

  // Move focus into the modal, then restore it to the preview trigger.
  useEffect(() => {
    if (file && !wasOpenRef.current) {
      openerRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      wasOpenRef.current = true;
      closeButtonRef.current?.focus();
    } else if (!file && wasOpenRef.current) {
      openerRef.current?.focus();
      openerRef.current = null;
      wasOpenRef.current = false;
    }
  }, [file]);

  useEffect(() => () => openerRef.current?.focus(), []);

  if (!file) return null;

  return (
    <>
      {/* Backdrop — clicking it closes the viewer */}
      <div
        className="fixed inset-0 z-[490] bg-black/20"
        aria-hidden="true"
        onClick={close}
      />

      {/* Viewer panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Aperçu de ${file.original}`}
        className="fixed bottom-4 left-4 right-4 top-20 z-[500] flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-xl dark:bg-paper-2 dark:border-line-2 sm:bottom-6 sm:left-auto sm:right-6 sm:top-28 sm:w-[min(48vw,720px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-mono text-ink"
              title={file.original}
            >
              {file.original}
            </p>
            <p className="mt-0.5 text-xs font-sans text-ink-mute uppercase tracking-wide">
              {file.extension.replace('.', '')} &middot; {formatBytes(file.size)}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Fermer l'aperçu"
            className="shrink-0 rounded p-1.5 text-ink-mute hover:bg-paper-3 hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Suspense fallback={<ViewerSkeleton />}>
            {pickPreviewComponent(file)}
          </Suspense>
        </div>
      </div>
    </>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
