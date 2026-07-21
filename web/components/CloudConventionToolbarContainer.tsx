'use client';

import { useAuthStatus } from '@/lib/auth-status';
import { CloudConventionToolbar, CloudConventionToolbarLogin } from './CloudConventionToolbar';

/**
 * Cloud save/load toolbar.
 *
 * Uses a safe auth-status hook so it works both during SSR (base Convex
 * provider) and after hydration (auth-enabled provider).
 */
export function CloudConventionToolbarContainer() {
  const { isAuthenticated, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <span className="hidden sm:inline-flex h-8 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    );
  }

  return isAuthenticated ? <CloudConventionToolbar /> : <CloudConventionToolbarLogin />;
}
