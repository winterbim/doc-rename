'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { WorkspaceFile } from '@/lib/rename-engine/types';

const ImageLightbox = dynamic(
  () => import('./ImageLightbox').then((m) => ({ default: m.ImageLightbox })),
  { ssr: false }
);

interface ImagePreviewProps {
  file: WorkspaceFile;
}

export function ImagePreview({ file }: ImagePreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file.blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file.blob]);

  if (!objectUrl) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          role="status"
          aria-label="Chargement..."
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label={`Ouvrir l'aperçu plein écran de ${file.original}`}
          className="group relative overflow-hidden rounded-lg border border-line shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={objectUrl}
            alt={file.original}
            className="block max-h-[calc(100vh-280px)] max-w-full object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-paper/90 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-ink"
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
            </div>
          </div>
        </button>
        <p className="text-xs text-ink-mute">Cliquez pour agrandir</p>
      </div>

      {lightboxOpen && objectUrl && (
        <ImageLightbox
          src={objectUrl}
          alt={file.original}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
