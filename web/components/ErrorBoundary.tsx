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

export interface ErrorEntry {
  id: string;
  ts: string;
  message: string;
  stack?: string;
  componentStack?: string;
  ua: string;
  url: string;
}

export function appendErrorEntry(entry: ErrorEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: ErrorEntry[] = raw ? (JSON.parse(raw) as ErrorEntry[]) : [];
    list.unshift(entry);
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
    return raw ? (JSON.parse(raw) as ErrorEntry[]) : [];
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
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
