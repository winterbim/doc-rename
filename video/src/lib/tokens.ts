/**
 * Design tokens lifted verbatim from the production landing CSS
 * (web/app/page.tsx). Keep these in sync if the brand palette evolves.
 */

export const colors = {
  paper: '#F7F3EA',
  paperSoft: '#EEE7DA',
  paperHard: '#FFFAF0',
  ink: '#241F19',
  inkSoft: '#5B5045',
  muted: '#817466',
  line: '#D8CDBB',
  lineStrong: '#B8AA95',
  brick: '#A54835',
  brickDeep: '#8C3722',
  moss: '#4F6948',
  blue: '#314D63',
  gold: '#C0913F',
  goldSoft: '#E0B96B',
} as const;

export const fonts = {
  sans: 'Inter, "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  serif: 'Newsreader, Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
} as const;

export const shadows = {
  card: '0 24px 70px -44px rgba(36, 31, 25, .45)',
  cardSoft: '0 12px 36px -28px rgba(36, 31, 25, .35)',
  plan: '0 18px 50px -36px rgba(165, 72, 53, .55)',
} as const;

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  pill: 999,
} as const;

/** Master 16:9 size — also informs scaling for the 9:16 variant. */
export const SIZE_16x9 = { width: 1920, height: 1080 };
export const SIZE_9x16 = { width: 1080, height: 1920 };

/** Single source of truth: 30 fps everywhere (long form + shorts). */
export const FPS = 30;

/**
 * Master scene durations (in frames @ 30fps).
 * Times match the brief in seconds.
 */
export const SCENE_FRAMES = {
  problem: 10 * FPS, //   0 – 10  s
  solution: 10 * FPS, //  10 – 20 s
  imports: 12 * FPS, //   20 – 32 s
  nomen: 16 * FPS, //     32 – 48 s
  bim: 12 * FPS, //       48 – 60 s
  others: 12 * FPS, //    60 – 72 s
  exportZip: 10 * FPS, // 72 – 82 s
  privacy: 8 * FPS, //    82 – 90 s
  cta: 4 * FPS, //        90 – 94 s  (gentle hold past 90)
} as const;

export const TOTAL_FRAMES =
  SCENE_FRAMES.problem +
  SCENE_FRAMES.solution +
  SCENE_FRAMES.imports +
  SCENE_FRAMES.nomen +
  SCENE_FRAMES.bim +
  SCENE_FRAMES.others +
  SCENE_FRAMES.exportZip +
  SCENE_FRAMES.privacy +
  SCENE_FRAMES.cta;

/** Cumulative scene starts — handy for sequencing & subtitle offsets. */
export function sceneStartFrames(): Record<keyof typeof SCENE_FRAMES, number> {
  const order: Array<keyof typeof SCENE_FRAMES> = [
    'problem',
    'solution',
    'imports',
    'nomen',
    'bim',
    'others',
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
