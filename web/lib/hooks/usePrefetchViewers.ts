'use client';
import { useEffect, useRef } from 'react';
import type { BimFile } from '@/lib/bim/types';

const PDF_EXTS = new Set(['.pdf']);
const DOCX_EXTS = new Set(['.docx', '.doc']);
const SPREADSHEET_EXTS = new Set(['.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.csv', '.tsv']);
const DXF_EXTS = new Set(['.dxf']);

/** What chunks have we already kicked off in this session? Avoid redundant imports. */
const alreadyPrefetched = new Set<string>();

function prefetchPdfViewer() {
  if (alreadyPrefetched.has('pdf')) return;
  alreadyPrefetched.add('pdf');
  import('@/components/viewer/PdfPreview').catch(() => {
    // Silent fail — user click flow still works
    alreadyPrefetched.delete('pdf');
  });
}
function prefetchDocxViewer() {
  if (alreadyPrefetched.has('docx')) return;
  alreadyPrefetched.add('docx');
  import('@/components/viewer/DocxPreview').catch(() => {
    alreadyPrefetched.delete('docx');
  });
}
function prefetchSpreadsheetViewer() {
  if (alreadyPrefetched.has('spreadsheet')) return;
  alreadyPrefetched.add('spreadsheet');
  import('@/components/viewer/SpreadsheetPreview').catch(() => {
    alreadyPrefetched.delete('spreadsheet');
  });
}
function prefetchDxfViewer() {
  if (alreadyPrefetched.has('dxf')) return;
  alreadyPrefetched.add('dxf');
  import('@/components/viewer/DxfPreview').catch(() => {
    alreadyPrefetched.delete('dxf');
  });
}

/**
 * For each unique extension in the file list, kick off a background import of
 * the matching viewer chunk. By the time the user clicks the eye button, the
 * chunk is in the browser cache and the parse can start immediately.
 *
 * Runs whenever `files.length` changes. Idempotent — already-fetched chunks
 * are skipped.
 */
export function usePrefetchViewers(files: BimFile[]): void {
  const lastSizeRef = useRef(0);
  useEffect(() => {
    if (files.length === lastSizeRef.current) return;
    lastSizeRef.current = files.length;

    // Defer to next tick so we don't block initial render
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rIC = (window as any).requestIdleCallback as
      | ((cb: () => void, opts: { timeout: number }) => number)
      | undefined;
    const id: number = rIC
      ? rIC(() => prefetch(), { timeout: 800 })
      : window.setTimeout(prefetch, 100);

    function prefetch() {
      const exts = new Set<string>();
      for (const f of files) exts.add(f.extension.toLowerCase());
      for (const ext of exts) {
        if (PDF_EXTS.has(ext)) prefetchPdfViewer();
        else if (DOCX_EXTS.has(ext)) prefetchDocxViewer();
        else if (SPREADSHEET_EXTS.has(ext)) prefetchSpreadsheetViewer();
        else if (DXF_EXTS.has(ext)) prefetchDxfViewer();
      }
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cIC = (window as any).cancelIdleCallback as
        | ((id: number) => void)
        | undefined;
      if (cIC) {
        cIC(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, [files]);
}
