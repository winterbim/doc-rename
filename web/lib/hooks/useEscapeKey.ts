'use client';

import { useEffect } from 'react';

/**
 * Calls `onEscape` whenever the Escape key is pressed.
 * Cleans up the event listener on unmount or when dependencies change.
 */
export function useEscapeKey(onEscape: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        onEscape();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, enabled]);
}
