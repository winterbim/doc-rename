import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === 'true') {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        event.request.data = undefined;
        event.request.cookies = undefined;
        event.request.headers = undefined;
      }
      return event;
    },
  });
}
