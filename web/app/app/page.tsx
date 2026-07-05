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
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-ink bg-ink font-sans text-[13px] font-bold tracking-[-0.04em] text-paper"
          >
            BD
          </span>
          <div>
            <h1 className="text-base font-sans font-semibold leading-none tracking-[-0.01em] text-ink">
              BIMCHECK-Rename
            </h1>
            <p className="mt-0.5 text-xs font-sans text-ink-mute">
              Chargement de l&apos;atelier de renommage BIM…
            </p>
          </div>
        </div>
      </header>
      <section className="flex flex-1 items-center justify-center px-6 py-16" aria-live="polite">
        <div className="w-full max-w-xl rounded-xl border border-line bg-white p-8 text-center shadow-sm dark:bg-paper-2">
          <p className="font-sans text-lg text-ink">Préparation de votre lot BIM.</p>
          <p className="mt-3 text-sm text-ink-soft">
            Convention ISO 19650 / SIA 2051 prête à appliquer. Vos fichiers restent dans votre navigateur.
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
