/**
 * Theme provider hook — light / dark / system.
 *
 * - Reads preference from localStorage key `bim_theme` on mount.
 * - Falls back to 'system' (follows prefers-color-scheme).
 * - Writes `data-theme` attribute on <html> so Tailwind v4 @custom-variant
 *   and CSS variables pick it up.
 * - SSR-safe: initial render returns `resolvedTheme = 'light'`; useEffect
 *   corrects it after mount (no hydration mismatch).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '@/lib/rename-engine/config/defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContext {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = STORAGE_KEYS.THEME;

function readStoredTheme(): Theme {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // SSR or private browsing — ignore
  }
  return 'system';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'light') return 'light';
  if (theme === 'dark') return 'dark';
  // 'system': check matchMedia
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
  } catch {
    // Ignore
  }
  return 'light';
}

function applyTheme(resolved: ResolvedTheme): void {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', resolved);
    }
  } catch {
    // Ignore SSR
  }
}

// ---------------------------------------------------------------------------
// useTheme hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContext {
  // SSR-safe initial state: always 'light' until useEffect runs
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // On mount: read from localStorage, derive resolved, apply to DOM
  useEffect(() => {
    const stored = readStoredTheme();
    const resolved = resolveTheme(stored);
    setThemeState(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  // Listen for system preference changes when theme === 'system'
  useEffect(() => {
    if (!mounted || theme !== 'system') return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mounted, theme]);

  const setTheme = useCallback((t: Theme) => {
    const resolved = resolveTheme(t);
    setThemeState(t);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, t);
    } catch {
      // Private browsing — ignore
    }
  }, []);

  return { theme, resolvedTheme, setTheme };
}
