'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

/**
 * App header — logo + title + version badge + theme toggle.
 */
export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-2.5 dark:bg-paper-2">
      {/* Left: brand mark + title — matches landing wordmark */}
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-ink bg-ink font-sans text-[13px] font-bold tracking-[-0.04em] text-paper"
        >
          BD
        </span>
        <div>
          <h1 className="text-base font-sans font-semibold leading-none tracking-[-0.01em] text-ink">
            BimDoc Renamer
          </h1>
          <p className="mt-0.5 text-xs font-sans text-ink-mute">
            Convention ISO 19650 / SIA — livrables BIM
          </p>
        </div>
      </div>

      {/* Right: version + theme toggle */}
      <div className="flex items-center gap-3">
        <Link
          href="/pilot"
          className="hidden md:inline-flex items-center gap-1 text-xs text-ink-mute hover:text-brick transition-colors"
          aria-label="Demander un pilote BimDoc Renamer"
        >
          Pilote
        </Link>
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1 text-xs text-ink-mute hover:text-brick transition-colors"
          aria-label="Retour à la présentation"
        >
          À propos
        </Link>
        <span className="hidden md:inline-flex text-[10px] uppercase tracking-wider font-sans font-medium text-ink-mute">
          v3.0.0
        </span>
        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
