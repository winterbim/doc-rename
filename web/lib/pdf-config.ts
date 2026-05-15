/**
 * PDF.js worker configuration for Next.js.
 * Call setupPdfWorker() once at the top of a 'use client' component tree.
 *
 * The worker file is copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs
 * to public/pdf.worker.min.mjs at install time (via the postinstall script in
 * package.json), and served as a static asset.
 *
 * This works in production builds (Vercel, Turbopack, webpack) without relying
 * on `import.meta.url` resolution, which is unreliable in bundled output.
 */
import { pdfjs } from 'react-pdf';

let configured = false;

export function setupPdfWorker(): void {
  if (configured) return;
  configured = true;
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  // Warm the worker file in the browser cache so PDF.js can fetch it
  // synchronously when a PDF is opened — saves ~200ms cold.
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    link.href = '/pdf.worker.min.mjs';
    document.head.appendChild(link);
  } catch {
    // SSR / non-browser environment — skip silently
  }
}
