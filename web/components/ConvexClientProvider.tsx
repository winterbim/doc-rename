'use client';

import { ConvexReactClient } from 'convex/react';
import { ConvexAuthNextjsProvider } from '@convex-dev/auth/nextjs';
import { ReactNode } from 'react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

/**
 * Convex + Auth provider.
 *
 * Must be rendered inside {@link ConvexAuthNextjsServerProvider} so that the
 * auth context is available during SSR and after hydration.
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // The Free renamer is deliberately local-first and must remain available if
  // the optional auth/sync backend is not configured or temporarily disabled.
  if (!convex) return children;

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
