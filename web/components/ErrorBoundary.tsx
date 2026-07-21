'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
}

const STORAGE_KEY = 'bimdoc_error_log';
const MAX_ENTRIES = 50;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;
const DOCUMENT_NAME = /\b[^\s"'<>/\\]+\.(?:pdf|docx?|xlsx?|csv|dwg|dxf|ifc|rvt|nwd|png|jpe?g|zip|rar|7z)\b/gi;

export interface ErrorEntry {
  id: string;
  ts: string;
  message: string;
  stack?: string;
  componentStack?: string;
  ua: string;
  url: string;
}

function redact(value: string | undefined): string | undefined {
  return value
    ?.replace(DOCUMENT_NAME, '[nom de fichier masqué]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email masqué]')
    .slice(0, 8_000);
}

function safeUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return '';
  }
}

function retainedEntries(value: unknown, now = Date.now()): ErrorEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ErrorEntry => {
    if (!entry || typeof entry !== 'object') return false;
    const candidate = entry as Partial<ErrorEntry>;
    const timestamp = typeof candidate.ts === 'string' ? Date.parse(candidate.ts) : Number.NaN;
    return Number.isFinite(timestamp) && timestamp >= now - RETENTION_MS;
  });
}

export function appendErrorEntry(entry: ErrorEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list = retainedEntries(raw ? JSON.parse(raw) : []);
    list.unshift({
      ...entry,
      message: redact(entry.message) ?? 'Erreur locale',
      stack: redact(entry.stack),
      componentStack: redact(entry.componentStack),
      url: safeUrl(entry.url),
    });
    if (list.length > MAX_ENTRIES) list.length = MAX_ENTRIES;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage may be full or disabled — fail silently
  }
}

export function downloadErrorLog(): void {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? '[]';
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bimdoc-error-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function clearErrorLog(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getErrorLog(): ErrorEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const entries = retainedEntries(raw ? JSON.parse(raw) : []);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries;
  } catch {
    return [];
  }
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false, errorId: null };

  static getDerivedStateFromError(): State {
    return { hasError: true, errorId: crypto.randomUUID() };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    const entry: ErrorEntry = {
      id: this.state.errorId ?? crypto.randomUUID(),
      ts: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    appendErrorEntry(entry);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-8 text-ink">
          <h1 className="text-xl font-sans font-semibold">Une erreur est survenue.</h1>
          <p className="max-w-md text-center text-sm text-ink-soft">
            L&apos;outil a rencontré un problème inattendu. Le journal d&apos;erreur est conservé
            localement dans votre navigateur — il n&apos;est jamais envoyé à l&apos;extérieur. Vous
            pouvez le télécharger ci-dessous pour nous l&apos;envoyer si besoin.
          </p>
          <p className="font-mono text-xs text-ink-mute">ID: {this.state.errorId}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-brick"
            >
              Recharger l&apos;outil
            </button>
            <button
              type="button"
              onClick={downloadErrorLog}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-brick hover:text-brick dark:bg-paper-2"
            >
              Télécharger le journal
            </button>
            <button
              type="button"
              onClick={clearErrorLog}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-brick hover:text-brick dark:bg-paper-2"
            >
              Effacer le journal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
