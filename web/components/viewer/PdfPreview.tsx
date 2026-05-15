'use client';

import { useState, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { setupPdfWorker } from '@/lib/pdf-config';
import { getObjectUrl } from '@/lib/viewer-cache';
import type { BimFile } from '@/lib/bim/types';

// Configure worker once when this module loads (client-side only)
setupPdfWorker();

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200] as const;
type ZoomStep = (typeof ZOOM_STEPS)[number];

interface PdfPreviewProps {
  file: BimFile;
}

export function PdfPreview({ file }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [zoom, setZoom] = useState<ZoomStep>(100);
  const [loadError, setLoadError] = useState(false);

  // Cached objectURL: reused across re-opens, freed by RenamerShell cleanup hook.
  const objectUrl = getObjectUrl(file.id, file.blob);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: n }: { numPages: number }) => {
      setNumPages(n);
      setPageNumber(1);
      setLoadError(false);
    },
    []
  );

  const onDocumentLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));

  const zoomIn = () => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      return idx < ZOOM_STEPS.length - 1 ? ZOOM_STEPS[idx + 1] : z;
    });
  };
  const zoomOut = () => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      return idx > 0 ? ZOOM_STEPS[idx - 1] : z;
    });
  };

  if (loadError) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-red-500">Impossible de lire le PDF.</p>
      </div>
    );
  }

  const canZoomIn = ZOOM_STEPS.indexOf(zoom) < ZOOM_STEPS.length - 1;
  const canZoomOut = ZOOM_STEPS.indexOf(zoom) > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* PDF toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
        {/* Zoom controls */}
        <button
          type="button"
          onClick={zoomOut}
          disabled={!canZoomOut}
          aria-label="Réduire le zoom"
          className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>

        <span className="min-w-[3rem] text-center text-xs font-medium text-gray-600">
          {zoom}%
        </span>

        <button
          type="button"
          onClick={zoomIn}
          disabled={!canZoomIn}
          aria-label="Augmenter le zoom"
          className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>

        <div className="mx-1 h-4 w-px bg-gray-300" aria-hidden="true" />

        {/* Page navigation */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={pageNumber <= 1}
          aria-label="Page précédente"
          className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-xs text-gray-600 whitespace-nowrap">
          {numPages > 0 ? `Page ${pageNumber} / ${numPages}` : '—'}
        </span>

        <button
          type="button"
          onClick={goToNext}
          disabled={pageNumber >= numPages || numPages === 0}
          aria-label="Page suivante"
          className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 transition-colors"
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* PDF rendering area */}
      <div className="flex flex-1 overflow-auto items-start justify-center bg-gray-100 p-4">
        <Document
            file={objectUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex h-32 items-center justify-center">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
                  role="status"
                  aria-label="Chargement du PDF..."
                />
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={zoom / 100}
              loading={
                <div className="flex h-32 items-center justify-center">
                  <div
                    className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"
                    role="status"
                    aria-label="Chargement de la page..."
                  />
                </div>
              }
            />
          </Document>
      </div>
    </div>
  );
}
