import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === 'true') {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? '0'),
    sendDefaultPii: false,
    beforeSend(event) {
      if (globalThis.location?.pathname.startsWith('/app')) return null;
      if (event.request) event.request.data = undefined;
      return event;
    },
    beforeSendTransaction(event) {
      return globalThis.location?.pathname.startsWith('/app') ? null : event;
    },
    beforeBreadcrumb(breadcrumb) {
      return globalThis.location?.pathname.startsWith('/app') ? null : breadcrumb;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
