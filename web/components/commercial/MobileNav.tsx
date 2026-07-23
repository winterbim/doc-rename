'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

export interface MobileNavLink {
  href: string;
  label: string;
}

/**
 * Menu burger accessible pour les en-têtes en mobile (P1-3) :
 * - bouton avec aria-expanded / aria-controls ;
 * - piège de focus dans le panneau ouvert (Tab cycle) ;
 * - fermeture par Escape (retour du focus sur le bouton) et par clic de lien.
 *
 * Sans style imposé : le parent fournit les classes (landing CSS ou Tailwind).
 */
export function MobileNav({
  links,
  buttonClassName = '',
  panelClassName = '',
  linkClassName = '',
  label = 'Menu',
}: {
  links: MobileNavLink[];
  buttonClassName?: string;
  panelClassName?: string;
  linkClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  // Escape ferme, Tab reste dans le panneau (focus trap)
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      );

    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [buttonRef.current, ...focusables()].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      if (items.length === 0) return;
      const current = document.activeElement as HTMLElement | null;
      const index = current ? items.indexOf(current) : -1;
      const next = event.shiftKey
        ? (index <= 0 ? items.length - 1 : index - 1)
        : (index === items.length - 1 ? 0 : index + 1);
      event.preventDefault();
      items[next]?.focus();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClassName}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {/* Icône burger / croix */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          style={{ width: 20, height: 20 }}
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
        <span className="sr-only">{label}</span>
      </button>

      {open ? (
        <div id={panelId} ref={panelRef} className={panelClassName}>
          <nav aria-label={`${label} mobile`}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={linkClassName}
                onClick={() => close(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
