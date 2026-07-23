import type { IndustryProfileId } from '@/lib/profiles';

/**
 * Per-métier line icons for the ProfilePicker bubbles.
 * Stroke uses `currentColor` so the parent controls the color (selected =
 * inverted, idle = ink-soft). Paths are drawn on a 24×24 grid.
 */
const PROFILE_ICON_PATHS: Record<IndustryProfileId, string> = {
  'bim-construction':
    'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 11h.01M15 11h.01',
  finance:
    'M2 7a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7ZM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6 12h.01M18 12h.01',
  hr: 'M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.4M21 20a5.5 5.5 0 0 0-4-5.3',
  healthcare: 'M22 12h-4l-3 8L9 4l-3 8H2',
  administration:
    'M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM9 3v2h6V3M9 11h6M9 15h4',
  legal:
    'M12 3v18M7 21h10M6 6h12M6 6l-3 6h6l-3-6ZM18 6l-3 6h6l-3-6ZM10 3h4',
  industry: 'M3 21V10l6 4V10l6 4V6l6 4v11H3ZM3 21h18M8 21v-3M13 21v-3',
  'real-estate': 'M3 11.5 12 4l9 7.5M5 10v11h14V10M10 21v-6h4v6',
  custom: 'M4 8h16M4 16h16M9 6v4M15 14v4',
};

const CUSTOM_KNOBS: Record<IndustryProfileId, boolean> = {
  'bim-construction': false,
  finance: false,
  hr: false,
  healthcare: false,
  administration: false,
  legal: false,
  industry: false,
  'real-estate': false,
  custom: true,
};

export function ProfileIcon({
  id,
  className = 'h-5 w-5',
}: {
  id: IndustryProfileId;
  className?: string;
}) {
  const d = PROFILE_ICON_PATHS[id] ?? PROFILE_ICON_PATHS.custom;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
      {CUSTOM_KNOBS[id] ? (
        <>
          <circle cx="9" cy="10" r="2" />
          <circle cx="15" cy="14" r="2" />
        </>
      ) : null}
    </svg>
  );
}
