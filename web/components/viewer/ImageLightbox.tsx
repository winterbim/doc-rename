'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200] as const;
type ZoomStep = (typeof ZOOM_STEPS)[number];

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState<ZoomStep>(100);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Move focus into the dialog on mount + close on Esc
  useEffect(() => {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      openerRef.current?.focus();
    };
  }, [onClose]);

  // Confine Tab within the lightbox
  useFocusTrap(dialogRef);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      return idx < ZOOM_STEPS.length - 1 ? ZOOM_STEPS[idx + 1] : z;
    });
    setTranslate({ x: 0, y: 0 });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.indexOf(z);
      return idx > 0 ? ZOOM_STEPS[idx - 1] : z;
    });
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setTranslate((t) => ({ x: t.x + dx, y: t.y + dy }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const canZoomIn = ZOOM_STEPS.indexOf(zoom) < ZOOM_STEPS.length - 1;
  const canZoomOut = ZOOM_STEPS.indexOf(zoom) > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Aperçu de ${alt}`}
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="relative flex flex-col max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 rounded-t-xl bg-ink/90 px-4 py-2">
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer l'aperçu"
            className="rounded p-1 text-ink-mute hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 transition-colors"
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

          <div className="mx-1 h-4 w-px bg-line" aria-hidden="true" />

          <button
            type="button"
            onClick={zoomOut}
            disabled={!canZoomOut}
            aria-label="Dézoomer"
            className="rounded p-1 text-ink-mute hover:bg-paper/10 hover:text-paper disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 transition-colors"
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

          <span className="min-w-[3rem] text-center text-xs font-medium text-paper">
            {zoom}%
          </span>

          <button
            type="button"
            onClick={zoomIn}
            disabled={!canZoomIn}
            aria-label="Zoomer"
            className="rounded p-1 text-ink-mute hover:bg-paper/10 hover:text-paper disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 transition-colors"
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

          <button
            type="button"
            onClick={() => { setZoom(100); setTranslate({ x: 0, y: 0 }); }}
            aria-label="Taille réelle (100%)"
            className="ml-1 rounded px-2 py-1 text-xs text-ink-mute hover:bg-paper/10 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        {/* Image area */}
        <div
          className="overflow-hidden rounded-b-xl bg-ink/50"
          style={{ cursor: zoom > 100 ? (dragging.current ? 'grabbing' : 'grab') : 'default' }}
        >
          <div
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom / 100})`,
              transformOrigin: 'center center',
              transition: dragging.current ? 'none' : 'transform 0.1s ease',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="block max-h-[80vh] max-w-[85vw] object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
