'use client';

/**
 * Theme toggle button.
 * Cycles: light → dark → system → light on click.
 * Renders sun (dark mode on), moon (light mode on), monitor (system).
 */

import { useTheme, type Theme } from '@/lib/theme';

const CYCLE_ORDER: Theme[] = ['light', 'dark', 'system'];

function nextTheme(current: Theme): Theme {
  const idx = CYCLE_ORDER.indexOf(current);
  return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
}

const THEME_LABELS: Record<Theme, string> = {
  light: 'clair',
  dark: 'sombre',
  system: 'système',
};

/** Sun icon — shown when in dark mode (click → go to system) */
function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
}

/** Moon icon — shown when in light mode (click → go to dark) */
function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}

/** Monitor icon — shown when in system mode */
function MonitorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') return <SunIcon />;
  if (theme === 'system') return <MonitorIcon />;
  return <MoonIcon />;
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = nextTheme(theme);

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Changer le thème: ${THEME_LABELS[next]}`}
      title={`Thème: ${THEME_LABELS[theme]} (cliquer pour ${THEME_LABELS[next]})`}
      className="flex items-center justify-center rounded-md p-1.5 text-ink-mute hover:bg-paper-2 hover:text-ink dark:hover:bg-paper-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}
