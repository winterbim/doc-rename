'use client';
import { useState, useEffect } from 'react';
import { getDocxCache, setDocxCache } from '@/lib/viewer-cache';
import { sanitizeDocumentHtml } from '@/lib/sanitize-html';
import type { WorkspaceFile } from '@/lib/rename-engine/types';

interface Props { readonly file: WorkspaceFile }

export function DocxPreview({ file }: Props) {
  const cached = getDocxCache(file.id);
  const [html, setHtml] = useState<string | null>(cached?.html ?? null);
  const [warnings, setWarnings] = useState<string[]>(cached?.warnings ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    // Cache hit: skip the conversion entirely
    const hit = getDocxCache(file.id);
    if (hit) {
      setHtml(hit.html);
      setWarnings(hit.warnings);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setHtml(null);
    (async () => {
      try {
        const buf = await file.blob.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        if (cancelled) return;
        const safe = await sanitizeDocumentHtml(result.value);
        if (cancelled) return;
        const warn = result.messages.filter((m) => m.type === 'warning').map((m) => m.message);
        setHtml(safe);
        setWarnings(warn);
        setDocxCache(file.id, { html: safe, warnings: warn });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file.blob, file.id]);

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
  return (
    <div className="flex-1 overflow-auto bg-paper p-6">
      <div
        className="docx-render mx-auto max-w-3xl bg-doc-surface p-8 shadow-md font-serif text-doc-ink leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html ?? '' }}
      />
      {warnings.length > 0 && (
        <details className="mx-auto max-w-3xl mt-4 text-xs text-ink-mute">
          <summary className="cursor-pointer font-sans uppercase tracking-wider">
            {warnings.length} avertissement(s) de conversion
          </summary>
          <ul className="mt-2 list-disc pl-4">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
