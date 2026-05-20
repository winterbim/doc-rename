import { interpolate, spring, Easing } from 'remotion';

/** Smooth in-out used for most reveals. */
export const easeOutCubic = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Fade + lift used for cards, file rows, panels. */
export function liftIn(opts: {
  frame: number;
  start: number;
  duration?: number;
  distance?: number;
}): { opacity: number; translateY: number } {
  const { frame, start, duration = 18, distance = 24 } = opts;
  const local = frame - start;
  const opacity = interpolate(local, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  const translateY = interpolate(local, [0, duration], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOutCubic,
  });
  return { opacity, translateY };
}

/** Fade-out near the end of a scene. */
export function fadeOut(opts: {
  frame: number;
  end: number;
  duration?: number;
}): number {
  const { frame, end, duration = 14 } = opts;
  return interpolate(frame, [end - duration, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeInOut,
  });
}

/** Stagger helper for lists: returns the start frame of item index. */
export function stagger(start: number, index: number, step = 5): number {
  return start + index * step;
}

/** Soft spring for chips / badges / cursor. */
export function softSpring(opts: {
  frame: number;
  fps: number;
  delay?: number;
}): number {
  const { frame, fps, delay = 0 } = opts;
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, mass: 0.6, stiffness: 110 },
  });
}
