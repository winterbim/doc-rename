'use client';

import { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { FilesList } from './FilesList';
import { ActionBar } from './ActionBar';
import { CloudConventionToolbarContainer } from './CloudConventionToolbarContainer';
import { StatsFooter } from './StatsFooter';
import { NomenclatureBuilder } from './nomenclature/NomenclatureBuilder';
import { Toast } from './ui/Toast';
import { SimpleReplacePanel } from './replace/SimpleReplacePanel';
import { PrefixActionsPanel } from './prefixes/PrefixActionsPanel';
import { FileViewer } from './viewer/FileViewer';
import { useAppContext, type AppState } from '@/lib/app-state';
import { loadPersistedState, persistState } from '@/lib/persistence';
import { clearViewerCacheFor, clearAllViewerCaches } from '@/lib/viewer-cache';
import { setupPdfWorker } from '@/lib/pdf-config';
import { appendErrorEntry } from '@/components/ErrorBoundary';

/**
 * Hook: revoke object URLs and clear parsed caches for files that have been
 * removed from state since the last render.
 */
function useViewerCacheCleanup(state: AppState) {
  const prevIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const currentIds = new Set(state.files.map((f) => f.id));
    for (const id of prevIdsRef.current) {
      if (!currentIds.has(id)) clearViewerCacheFor(id);
    }
    prevIdsRef.current = currentIds;
  }, [state.files]);
}

/**
 * Hook: capture window.onerror + unhandledrejection into the local error log.
 * Privacy-preserving: entries stay in localStorage, never sent externally.
 */
function useGlobalErrorHandler(): void {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      appendErrorEntry({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        message: event.message,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        ua: navigator.userAgent,
        url: globalThis.location.href,
      });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      appendErrorEntry({
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        message: reason.message,
        stack: reason.stack,
        ua: navigator.userAgent,
        url: globalThis.location.href,
      });
    };
    globalThis.addEventListener('error', onError);
    globalThis.addEventListener('unhandledrejection', onRejection);
    return () => {
      globalThis.removeEventListener('error', onError);
      globalThis.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
}

/**
 * Hook: load persisted state on mount, debounce-save on every state change.
 * Only mounts once — no infinite loop risk.
 */
function usePersistence() {
  const { state, dispatch } = useAppContext();
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const slices = loadPersistedState();
    const hasContent = Object.keys(slices).length > 0;
    if (hasContent) {
      dispatch({ type: 'STATE_HYDRATE', slices });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistState(state);
  }, [state]);
}

/**
 * Main layout:
 *   Header (logo + theme + lang)
 *   Sticky toolbar (stats + primary actions — always visible)
 *   Main 3-pane grid:
 *     Left  — Nomenclature configuration
 *     Center — Files list
 *     Right  — Replace + prefix panels (collapsible, hidden when empty)
 */
export function RenamerShell() {
  usePersistence();
  useGlobalErrorHandler();
  const { state } = useAppContext();
  const [rightPaneOpen, setRightPaneOpen] = useState(false);

  // Clear stale viewer caches when files are removed
  useViewerCacheCleanup(state);

  // On first mount: flush any caches left from a previous session, and
  // inject the <link rel="prefetch"> for the PDF.js worker so it is in the
  // browser cache before the user opens any PDF.
  useEffect(() => {
    clearAllViewerCaches();
    setupPdfWorker();
  }, []);

  // Auto-open right pane when user selects files (so Simple Replace surfaces)
  useEffect(() => {
    if (state.ui.selectedIds.length > 0 && !rightPaneOpen) {
      setRightPaneOpen(true);
    }
  }, [state.ui.selectedIds.length, rightPaneOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:h-screen lg:overflow-hidden">
      <Header />

      {/* UPGRADE BANNER — soft paywall for team sync */}
      <div className="border-b border-border bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-white/90">
            <span className="font-semibold text-white">Nouveau :</span>{' '}
            partagez cette convention avec votre équipe et gardez une version d’or synchronisée.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition-colors"
          >
            Voir les offres Team
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* STICKY TOOLBAR — always visible primary actions */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white/95 dark:bg-paper-2/95 backdrop-blur px-5 py-2 shadow-sm">
        <StatsFooter compact />
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <CloudConventionToolbarContainer />
          </div>
          <ActionBar />
          <button
            type="button"
            onClick={() => setRightPaneOpen((o) => !o)}
            aria-pressed={rightPaneOpen}
            aria-label="Afficher les outils Remplacer & Préfixes"
            className="hidden xl:inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Outils
          </button>
        </div>
      </div>

      <main className="flex flex-1 gap-0 lg:min-h-0 lg:overflow-hidden">
        {/* LEFT PANE — Nomenclature */}
        <aside
          className="hidden lg:flex w-80 shrink-0 flex-col gap-0 border-r border-line bg-white dark:bg-paper-2 min-h-0 overflow-y-auto"
          aria-label="Configuration de la nomenclature"
        >
          <div className="border-t-2 border-gold" aria-hidden="true" />
          <div className="p-4 flex-1">
            <NomenclatureBuilder />
          </div>
        </aside>

        {/* CENTER PANE — Files */}
        <section
          className="flex flex-1 min-w-0 flex-col min-h-0 overflow-y-auto"
          aria-label="Fichiers à renommer"
        >
          <div className="flex-1 p-5">
            {/* Mobile: collapsed nomenclature */}
            <div className="lg:hidden mb-5 rounded-xl border border-line bg-white dark:bg-paper-2 p-4 shadow-sm">
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-ink list-none flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brick" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuration de la nomenclature
                </summary>
                <div className="mt-4">
                  <NomenclatureBuilder />
                </div>
              </details>
            </div>

            <FilesList />
          </div>
        </section>

        {/* RIGHT PANE — Replace + Prefix panels (collapsible) */}
        {rightPaneOpen && (
          <aside
            className="hidden xl:flex w-72 shrink-0 flex-col border-l border-line bg-white dark:bg-paper-2 min-h-0 overflow-hidden"
            aria-label="Remplacement de texte et gestion des préfixes"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-2 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-mute font-sans">
                Outils
              </span>
              <button
                type="button"
                onClick={() => setRightPaneOpen(false)}
                aria-label="Masquer le panneau d'outils"
                className="rounded p-1 text-ink-mute hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
              <SimpleReplacePanel />
              <hr className="border-line" />
              <PrefixActionsPanel />
            </div>
          </aside>
        )}
      </main>

      <Toast />
      <FileViewer />
    </div>
  );
}
