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
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-2.5 dark:bg-paper-2">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-sans text-[13px] font-bold tracking-[-0.04em] text-paper"
          >
            BC
          </span>
          <div>
            <h1 className="text-base font-sans font-semibold leading-none tracking-[-0.01em] text-ink">
              BIMCHECK-Rename
            </h1>
            <p className="mt-0.5 text-xs font-sans text-ink-mute">
              Chargement de l&apos;atelier de convention…
            </p>
          </div>
        </div>
      </header>
      <section className="flex flex-1 items-center justify-center px-6 py-16" aria-live="polite">
        <div className="w-full max-w-xl rounded-xl border border-line bg-surface p-8 text-center shadow-sm dark:bg-paper-2">
          <p className="font-sans text-lg text-ink">Préparation de votre espace de renommage.</p>
          <p className="mt-3 text-sm text-ink-soft">
            Profils multi-métiers prêts. Vos fichiers restent dans votre navigateur — aucun upload.
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
    <>
      <noscript>
        <main className="flex min-h-screen items-center justify-center bg-paper px-6 text-ink">
          <div className="max-w-xl rounded-xl border border-line bg-surface p-8 text-center">
            <h1 className="text-2xl font-semibold">JavaScript est requis pour renommer vos fichiers.</h1>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Le traitement s’exécute localement dans votre navigateur. Activez JavaScript puis
              rechargez cette page ; aucun document ne sera envoyé au serveur.
            </p>
          </div>
        </main>
      </noscript>
      <AppContext.Provider value={ctx}>
        <ErrorBoundary>
          <RenamerShell />
        </ErrorBoundary>
      </AppContext.Provider>
    </>
  );
}
