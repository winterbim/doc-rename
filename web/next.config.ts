import type { NextConfig } from 'next';

const cspDirectives: string[] = [
  "default-src 'self'",
  // Inline styles + Tailwind generated styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Next/React only need eval for development diagnostics, never in production.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "font-src 'self' https://fonts.gstatic.com data:",
  // Allow PDF.js worker as same-origin script
  "worker-src 'self' blob:",
  // Object URLs from blobs (PDF, images, ZIP downloads)
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  // blob: required for fetch() against URL.createObjectURL() — used by
  // react-pdf, libarchive.js worker (WASM fetch), mammoth, xlsx, the
  // template export, the error-log download, and per-file downloads.
  // Convex backend (https + wss for sync)
  "connect-src 'self' blob: https://*.convex.cloud wss://*.convex.cloud https://*.ingest.sentry.io https://*.sentry.io https://app.posthog.com https://eu.i.posthog.com https://us.i.posthog.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Origin-Agent-Cluster', value: '?1' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A parent lockfile exists on this workstation. Pin Turbopack to this app so
  // dependency resolution never starts from /home/wina. Do not set
  // outputFileTracingRoot here: Vercel's configured `web` root manages it and
  // expects the generated manifest relative to its own build root.
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Long-cache the PDF.js worker (immutable per version)
      {
        source: '/pdf.worker.min.mjs',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
