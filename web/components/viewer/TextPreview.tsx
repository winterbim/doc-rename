'use client';

import { useEffect, useState } from 'react';
import { getTextCache, setTextCache } from '@/lib/viewer-cache';
import type { WorkspaceFile } from '@/lib/rename-engine/types';

const MAX_LINES = 500;
const MAX_SIZE_BYTES = 1024 * 1024; // 1 MB

interface TextPreviewProps {
  file: WorkspaceFile;
}

export function TextPreview({ file }: TextPreviewProps) {
  const cachedText = getTextCache(file.id);
  const [text, setText] = useState<string | null>(cachedText ?? null);
  const [truncated, setTruncated] = useState(false);
  const [oversized, setOversized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hit = getTextCache(file.id);
    if (hit !== undefined) {
      setText(hit);
      // Truncation flags depend on first load; recompute cheaply here
      const lines = hit.split('\n');
      setTruncated(lines.length >= MAX_LINES);
      setOversized(file.blob.size > MAX_SIZE_BYTES);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        let finalText: string;
        if (file.blob.size > MAX_SIZE_BYTES) {
          setOversized(true);
          const slice = file.blob.slice(0, MAX_SIZE_BYTES);
          const raw = await slice.text();
          if (cancelled) return;
          const lines = raw.split('\n');
          finalText = lines.slice(0, MAX_LINES).join('\n');
          setTruncated(lines.length > MAX_LINES);
        } else {
          const raw = await file.blob.text();
          if (cancelled) return;
          const lines = raw.split('\n');
          if (lines.length > MAX_LINES) {
            finalText = lines.slice(0, MAX_LINES).join('\n');
            setTruncated(true);
          } else {
            finalText = raw;
          }
        }
        setText(finalText);
        setTextCache(file.id, finalText);
      } catch {
        if (!cancelled) setError('Impossible de lire le fichier.');
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [file.blob, file.id]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (text === null) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
          role="status"
          aria-label="Chargement..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {(truncated || oversized) && (
        <div className="shrink-0 border-b border-amber-200/30 bg-amber-500/10 px-4 py-2">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {oversized
              ? `Fichier volumineux (${(file.blob.size / 1024 / 1024).toFixed(1)} Mo) — affichage des ${MAX_LINES} premières lignes du premier Mo.`
              : `Affichage limité aux ${MAX_LINES} premières lignes.`}
          </p>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <pre className="font-mono text-xs leading-relaxed text-ink whitespace-pre-wrap break-all">
          {text}
        </pre>
      </div>
    </div>
  );
}
