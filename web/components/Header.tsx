'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

/**
 * App header — logo + title + version badge + theme toggle.
 */
export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-line bg-white px-6 py-2.5 dark:bg-paper-2">
      {/* Left: logo + title */}
      <div className="flex items-center gap-3">
        {/* BIM cube icon (inline SVG — no external asset needed) */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-ink/20 bg-ink text-paper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-paper dark:text-ink"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-sans font-semibold leading-none text-ink">
            DOC-RENAME
          </h1>
          <p className="mt-0.5 text-xs font-sans text-ink-mute">
            Conventions documentaires par metier
          </p>
        </div>
      </div>

      {/* Right: version + theme toggle */}
      <div className="flex items-center gap-3">
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
