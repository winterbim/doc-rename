'use client';

import Link from 'next/link';
import { useAuthStatus } from '@/lib/auth-status';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { PAID_ACCOUNTS_ENABLED } from '@/lib/features';
import { MobileNav } from './commercial/MobileNav';

/**
 * App header — modern brand bar with navigation, auth and upgrade CTA.
 */
export function Header() {
  const { isAuthenticated, isLoading } = useAuthStatus();

  return (
    <header className="relative flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-6">
      {/* Left: brand mark + title */}
      <Link href="/" className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-sans text-[13px] font-bold text-paper shadow-sm shadow-indigo-900/10"
        >
          BC
        </span>
        <div>
          <h1 className="text-base font-sans font-semibold leading-none tracking-tight text-ink">
            BIMCHECK-Rename
          </h1>
          <p className="mt-0.5 text-xs font-sans text-ink-mute">
            Convention de nommage local-first
          </p>
        </div>
      </Link>

      {/* Right: nav + upgrade + auth + theme */}
      <div className="flex items-center gap-2 sm:gap-4">
        <nav className="hidden md:flex items-center gap-4 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink transition-colors">
            Accueil
          </Link>
          <Link href="/pricing" className="hover:text-ink transition-colors">
            Tarifs
          </Link>
          <Link href="/pilot" className="hover:text-ink transition-colors">
            Pilote
          </Link>
        </nav>

        <Link
          href="/pricing"
          className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-paper shadow-sm shadow-indigo-900/10 hover:bg-indigo-700 transition-colors"
        >
          <Badge variant="soft" size="sm" className="bg-indigo-400/20 text-indigo-50 border-0">
            Team
          </Badge>
          Voir Team
        </Link>

        {PAID_ACCOUNTS_ENABLED && (isLoading ? (
          <span className="hidden sm:inline-flex h-8 w-16 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        ) : isAuthenticated ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account">Mon compte</Link>
          </Button>
        ) : (
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Se connecter</Link>
          </Button>
        ))}

        <span className="hidden lg:inline-flex text-[10px] uppercase tracking-wider font-sans font-medium text-ink-mute">
          v0.3.0
        </span>

        <ThemeToggle />

        {/* P1-3 — navigation mobile (la nav inline est masquée sous md) */}
        <div className="md:hidden">
          <MobileNav
            label="Navigation"
            buttonClassName="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink hover:border-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
            panelClassName="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-line bg-surface p-2 shadow-lg"
            linkClassName="block rounded-lg px-3.5 py-2.5 text-sm font-semibold text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
            links={[
              { href: '/', label: 'Accueil' },
              { href: '/pricing', label: 'Tarifs' },
              { href: '/pilot', label: 'Pilote' },
              { href: '/iso-19650', label: 'Guide ISO 19650' },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
