'use client';

import { useReducer, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AppContext, appReducer, initialState } from '@/lib/app-state';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const RenamerShell = dynamic(
  () => import('@/components/RenamerShell').then((mod) => mod.RenamerShell),
  {
    ssr: false,
    loading: () => <AppLoadingState />,
  },
);

function AppLoadingState() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="flex items-center justify-between border-b border-line bg-white px-6 py-2.5 dark:bg-paper-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/20 bg-ink" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-paper"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-sans font-semibold leading-none text-ink">
              DOC-RENAME
            </h1>
            <p className="mt-0.5 text-xs font-sans text-ink-mute">
              Chargement de l&apos;outil de nommage BIM...
            </p>
          </div>
        </div>
      </header>
      <section className="flex flex-1 items-center justify-center px-6 py-16" aria-live="polite">
        <div className="w-full max-w-xl rounded-xl border border-line bg-white p-8 text-center shadow-sm dark:bg-paper-2">
          <p className="font-sans text-lg text-ink">Préparation de l&apos;espace de renommage.</p>
          <p className="mt-3 text-sm text-ink-soft">
            Les fichiers restent traités localement dans votre navigateur.
          </p>
        </div>
      </section>
    </main>
  );
}

/**
 * /app page — provides the AppContext, renders the RenamerShell.
 * Single source of truth for all app state (useReducer pattern).
 */
export default function AppPage() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const ctx = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <AppContext.Provider value={ctx}>
      <ErrorBoundary>
        <RenamerShell />
      </ErrorBoundary>
    </AppContext.Provider>
  );
}
