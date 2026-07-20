'use client';

import { useEffect } from 'react';
import { useAppContext } from '@/lib/app-state';

/**
 * Inline toast — shows state.toastMsg for 3 s then auto-dismisses.
 */
export function Toast() {
  const { state, dispatch } = useAppContext();
  const { toastMsg } = state;

  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => dispatch({ type: 'TOAST_CLEAR' }), 3000);
    return () => clearTimeout(id);
  }, [toastMsg, dispatch]);

  if (!toastMsg) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-ink text-paper px-4 py-3 text-sm font-sans shadow-2xl shadow-ink/20"
    >
      <span>{toastMsg}</span>
      <button
        onClick={() => dispatch({ type: 'TOAST_CLEAR' })}
        aria-label="Fermer la notification"
        className="ml-2 text-ink-mute hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper/50 rounded"
      >
        ✕
      </button>
    </div>
  );
}
