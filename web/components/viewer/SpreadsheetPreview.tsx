'use client';
import { useState, useEffect, useRef } from 'react';
import { getSpreadsheetCache, setSpreadsheetCache } from '@/lib/viewer-cache';
import type { BimFile } from '@/lib/bim/types';

interface Props { readonly file: BimFile }

interface SheetData {
  name: string;
  html: string;
}

interface XlsxModule {
  read: (data: ArrayBuffer, opts: { type: string }) => {
    SheetNames: string[];
    Sheets: Record<string, unknown>;
  };
  utils: {
    sheet_to_html: (sheet: unknown, opts?: { id?: string }) => string;
  };
}

export function SpreadsheetPreview({ file }: Props) {
  const cached = getSpreadsheetCache(file.id);
  const [sheetNames, setSheetNames] = useState<string[]>(cached?.sheets.map((s) => s.name) ?? []);
  const [sheetHtml, setSheetHtml] = useState<Record<string, string>>(() => {
    if (!cached) return {};
    return Object.fromEntries(cached.sheets.map((s) => [s.name, s.html]));
  });
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);

  // Keep raw workbook for lazy per-sheet rendering on tab change
  const wbRef = useRef<{
    sheets: Record<string, unknown>;
    xlsx: XlsxModule;
  } | null>(null);

  // Step 1 — read workbook (cache OR parse)
  useEffect(() => {
    const hit = getSpreadsheetCache(file.id);
    if (hit) {
      setSheetNames(hit.sheets.map((s) => s.name));
      setSheetHtml(Object.fromEntries(hit.sheets.map((s) => [s.name, s.html])));
      setActiveIdx(0);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSheetNames([]);
    setSheetHtml({});
    (async () => {
      try {
        const buf = await file.blob.arrayBuffer();
        const xlsx = (await import('xlsx')) as unknown as XlsxModule;
        const wb = xlsx.read(buf, { type: 'array' });
        if (cancelled) return;
        wbRef.current = { sheets: wb.Sheets, xlsx };
        // Render only the FIRST sheet up front; lazy-render others on tab click
        const firstName = wb.SheetNames[0];
        const firstHtml = xlsx.utils.sheet_to_html(wb.Sheets[firstName], { id: `sheet-${firstName}` });
        setSheetNames(wb.SheetNames);
        setSheetHtml({ [firstName]: firstHtml });
        setActiveIdx(0);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file.blob, file.id]);

  // Step 2 — lazy-render the active sheet on tab change
  useEffect(() => {
    const name = sheetNames[activeIdx];
    if (!name) return;
    if (sheetHtml[name] !== undefined) return;
    const wb = wbRef.current;
    if (!wb) return;
    const html = wb.xlsx.utils.sheet_to_html(wb.sheets[name], { id: `sheet-${name}` });
    setSheetHtml((prev) => {
      const next = { ...prev, [name]: html };
      // Update cache with the full set rendered so far
      const allSheets: SheetData[] = sheetNames
        .filter((n) => next[n] !== undefined)
        .map((n) => ({ name: n, html: next[n] }));
      setSpreadsheetCache(file.id, { sheets: allSheets });
      return next;
    });
  }, [activeIdx, sheetNames, sheetHtml, file.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brick border-t-transparent" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex-1 p-6 text-sm text-brick-deep">
        Erreur de lecture : {error}
      </div>
    );
  }

  const activeName = sheetNames[activeIdx];
  const activeHtml = activeName ? sheetHtml[activeName] : '';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {sheetNames.length > 1 && (
        <div className="flex shrink-0 gap-1 border-b border-line bg-paper-2 px-3 py-1.5 overflow-x-auto">
          {sheetNames.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={
                'shrink-0 rounded-md px-3 py-1 text-xs font-sans font-medium transition-colors ' +
                (i === activeIdx
                  ? 'bg-ink text-paper'
                  : 'text-ink-soft hover:bg-paper-3')
              }
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto bg-white">
        {activeHtml === undefined ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brick border-t-transparent" />
          </div>
        ) : (
          <div
            className="spreadsheet-render p-4 text-sm font-sans text-ink"
            dangerouslySetInnerHTML={{ __html: activeHtml }}
          />
        )}
      </div>
    </div>
  );
}
