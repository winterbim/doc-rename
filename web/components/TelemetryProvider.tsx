'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
const telemetryEnabled =
  Boolean(posthogKey) && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === 'true';

let posthogInitialized = false;

export function TelemetryProvider({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!telemetryEnabled || posthogInitialized || !posthogKey) return;

    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      disable_session_recording: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      respect_dnt: true,
      secure_cookie: true,
      person_profiles: 'identified_only',
    });
    posthogInitialized = true;
  }, []);

  useEffect(() => {
    if (!telemetryEnabled || !posthogInitialized) return;
    posthog.capture('$pageview', {
      $current_url: `${globalThis.location.origin}${pathname}`,
      path: pathname,
    });
  }, [pathname]);

  if (!telemetryEnabled) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
