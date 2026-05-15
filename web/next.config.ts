import type { NextConfig } from 'next';

const cspDirectives: string[] = [
  "default-src 'self'",
  // Inline styles + Tailwind generated styles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Inline scripts (landing demo widget + Next runtime hydration)
  // 'unsafe-eval' is needed for next/dynamic + react-pdf at the moment.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "font-src 'self' https://fonts.gstatic.com data:",
  // Allow PDF.js worker as same-origin script
  "worker-src 'self' blob:",
  // Object URLs from blobs (PDF, images, ZIP downloads)
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  // blob: required for fetch() against URL.createObjectURL() — used by
  // react-pdf, libarchive.js worker (WASM fetch), mammoth, xlsx, the
  // template export, the error-log download, and per-file downloads.
  "connect-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "manifest-src 'self'",
];

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
