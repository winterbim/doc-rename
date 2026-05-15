/**
 * Prefetch heavy viewer libs the moment the user has files of a given type
 * in their list. We import the module once and let webpack/Next cache the chunk.
 * Idempotent — calling twice doesn't double-load.
 */
const prefetched = {
  pdf: false,
  docx: false,
  xlsx: false,
  dxf: false,
};

function idle(cb: () => void) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    (window as typeof window & {
      requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => void;
    }).requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 100);
  }
}

export function prefetchForExtension(ext: string): void {
  const lower = ext.toLowerCase();
  if (lower === '.pdf' && !prefetched.pdf) {
    prefetched.pdf = true;
    idle(() => {
      void import('@/components/viewer/PdfPreview');
    });
  } else if ((lower === '.docx' || lower === '.doc') && !prefetched.docx) {
    prefetched.docx = true;
    idle(() => {
      void import('@/components/viewer/DocxPreview');
      void import('mammoth');
    });
  } else if (
    ['.xlsx', '.xls', '.xlsm', '.xlsb', '.ods', '.csv', '.tsv'].includes(lower) &&
    !prefetched.xlsx
  ) {
    prefetched.xlsx = true;
    idle(() => {
      void import('@/components/viewer/SpreadsheetPreview');
      void import('xlsx');
    });
  } else if (lower === '.dxf' && !prefetched.dxf) {
    prefetched.dxf = true;
    idle(() => {
      void import('@/components/viewer/DxfPreview');
      void import('dxf-parser');
    });
  }
}

/** Reset (for tests). */
export function _resetPrefetch(): void {
  prefetched.pdf = false;
  prefetched.docx = false;
  prefetched.xlsx = false;
  prefetched.dxf = false;
}
