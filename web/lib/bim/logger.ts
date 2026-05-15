/**
 * BIM Logger — ported from the legacy browser extension.
 *
 * Replaces window.Logger global with a plain named export.
 * Pure TypeScript — no DOM, no chrome.*, no window.*.
 *
 * Severity levels match the JS source:
 *   INFO  = 0
 *   WARN  = 1
 *   ERROR = 2
 */

export type LogLevel = 0 | 1 | 2;

export const LOG_LEVELS = {
  INFO: 0 as const,
  WARN: 1 as const,
  ERROR: 2 as const,
} satisfies Record<string, LogLevel>;

export interface Logger {
  /** Current minimum level. Messages below this are suppressed. */
  level: LogLevel;
  /** Log at INFO level (suppressed when level > INFO) */
  info(...args: unknown[]): void;
  /** Log at WARN level (suppressed when level > WARN) */
  warn(...args: unknown[]): void;
  /** Log at ERROR level (always emitted — ERROR is the highest severity) */
  error(...args: unknown[]): void;
  /** Set the minimum active level */
  setLevel(level: LogLevel): void;
}

function createLogger(initialLevel: LogLevel = LOG_LEVELS.INFO): Logger {
  // Mutable state — intentionally isolated inside the factory so tests can
  // create fresh instances without cross-contamination.
  let currentLevel: LogLevel = initialLevel;

  return {
    get level(): LogLevel {
      return currentLevel;
    },
    set level(l: LogLevel) {
      currentLevel = l;
    },

    info(...args: unknown[]): void {
      if (currentLevel <= LOG_LEVELS.INFO) {
        // JS source uses console.log for INFO — keep identical behaviour.
        console.info('[INFO]', ...args);
      }
    },

    warn(...args: unknown[]): void {
      if (currentLevel <= LOG_LEVELS.WARN) {
        console.warn('[WARN]', ...args);
      }
    },

    error(...args: unknown[]): void {
      if (currentLevel <= LOG_LEVELS.ERROR) {
        console.error('[ERROR]', ...args);
      }
    },

    setLevel(level: LogLevel): void {
      currentLevel = level;
    },
  };
}

/**
 * Singleton logger — drop-in replacement for window.Logger.
 * Import and use directly:
 *   import { logger } from '@/lib/bim/logger';
 *   logger.info('Processing', file.original);
 */
export const logger: Logger = createLogger();

/**
 * Factory exposed for testing / isolated contexts that need their own
 * logger with controllable state.
 */
export { createLogger };
