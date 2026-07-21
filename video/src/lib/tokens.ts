/**
 * Design tokens aligned with production SaaS (2026):
 * - Landing: dark navy + cyan/indigo gradient (web/app/page.tsx LANDING_CSS)
 * - App shell: slate surfaces + indigo primary (web/app/globals.css)
 */

export const colors = {
  // Landing dark canvas
  navy: '#0A0F1E',
  navy2: '#0E1628',
  navy3: '#152238',
  inkOnDark: '#E6EDF6',
  inkSoftOnDark: '#A8B6CA',
  inkMuteOnDark: '#7F90A8',
  cyan: '#67E8F9',
  cyanDeep: '#22D3EE',
  indigo: '#6366F1',
  indigoDeep: '#4F46E5',
  success: '#2DD4BF',
  accent: '#818CF8',

  // App light shell
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  ink: '#0F172A',
  inkSoft: '#475569',
  inkMute: '#64748B',
  primary: '#0E7490',
  primarySoft: '#ECFEFF',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  danger: '#DC2626',
  ok: '#047857',

  // Legacy aliases used by older components
  paper: '#F8FAFC',
  paperSoft: '#F1F5F9',
  paperHard: '#FFFFFF',
  muted: '#64748B',
  line: '#E2E8F0',
  lineStrong: '#CBD5E1',
  brick: '#0E7490',
  brickDeep: '#155E75',
  moss: '#047857',
  blue: '#314D63',
  gold: '#67E8F9',
  goldSoft: '#A5F3FC',
} as const;

export const fonts = {
  sans: 'Inter, "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  serif: 'Newsreader, Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
} as const;

export const shadows = {
  card: '0 24px 70px -40px rgba(2, 6, 23, .55)',
  cardSoft: '0 12px 36px -28px rgba(2, 6, 23, .35)',
  glow: '0 12px 40px -12px rgba(34, 211, 238, .45)',
  plan: '0 18px 50px -36px rgba(14, 116, 144, .45)',
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  pill: 999,
} as const;

export const SIZE_16x9 = { width: 1920, height: 1080 };
export const SIZE_9x16 = { width: 1080, height: 1920 };
export const FPS = 30;

/**
 * Real product story (~90 s):
 * problem → product → open /app free → import → convention → rename preview →
 * export ZIP → privacy + pricing → CTA
 */
export const SCENE_FRAMES = {
  problem: 10 * FPS, //  0–10
  solution: 10 * FPS, // 10–20
  imports: 12 * FPS, // 20–32
  nomen: 14 * FPS, // 32–46
  bim: 14 * FPS, // 46–60  (before/after rename in app)
  exportZip: 12 * FPS, // 60–72
  privacy: 10 * FPS, // 72–82  (local-first + Free/Team)
  cta: 8 * FPS, // 82–90
} as const;

export const TOTAL_FRAMES =
  SCENE_FRAMES.problem +
  SCENE_FRAMES.solution +
  SCENE_FRAMES.imports +
  SCENE_FRAMES.nomen +
  SCENE_FRAMES.bim +
  SCENE_FRAMES.exportZip +
  SCENE_FRAMES.privacy +
  SCENE_FRAMES.cta;

export function sceneStartFrames(): Record<keyof typeof SCENE_FRAMES, number> {
  const order: Array<keyof typeof SCENE_FRAMES> = [
    'problem',
    'solution',
    'imports',
    'nomen',
    'bim',
    'exportZip',
    'privacy',
    'cta',
  ];
  let cursor = 0;
  const out: Partial<Record<keyof typeof SCENE_FRAMES, number>> = {};
  for (const key of order) {
    out[key] = cursor;
    cursor += SCENE_FRAMES[key];
  }
  return out as Record<keyof typeof SCENE_FRAMES, number>;
}

export const SITE_URL = 'rename.bimcheck-consulting.com';
export const APP_URL = 'rename.bimcheck-consulting.com/app';
