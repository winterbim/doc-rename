'use client';

import { useState, useEffect } from 'react';

/**
 * Debounce a value by `delay` milliseconds.
 * Used for the live preview to avoid re-computing on every keystroke.
 */
export function useDebounce<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
