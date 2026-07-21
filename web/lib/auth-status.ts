'use client';

import { useConvexAuth } from 'convex/react';

interface AuthStatus {
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Safe wrapper around Convex's `useConvexAuth`.
 *
 * The root layout uses the base `ConvexProvider` so that static pages can
 * prerender. Auth-enabled pages wrap themselves with `ConvexAuthProvider`.
 * Components that live in both trees (e.g. Header) therefore cannot assume
 * an auth context is present. This hook returns `isAuthenticated: false`
 * when the auth context is missing instead of throwing.
 */
export function useAuthStatus(): AuthStatus {
  try {
    return useConvexAuth();
  } catch {
    return { isLoading: false, isAuthenticated: false };
  }
}
