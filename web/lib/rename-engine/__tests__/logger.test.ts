import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, LOG_LEVELS, type LogLevel } from '../logger';

// Use createLogger() for each test so the singleton is not polluted.
describe('logger', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Default level = INFO (0) — everything should emit
  // -------------------------------------------------------------------------
  describe('at default INFO level', () => {
    it('info() emits console.info with [INFO] prefix', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.info('hello', 'world');
      expect(infoSpy).toHaveBeenCalledOnce();
      expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'hello', 'world');
    });

    it('warn() emits console.warn with [WARN] prefix', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.warn('low disk');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'low disk');
    });

    it('error() emits console.error with [ERROR] prefix', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.error('boom');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'boom');
    });
  });

  // -------------------------------------------------------------------------
  // Level = WARN — info should be silent
  // -------------------------------------------------------------------------
  describe('at WARN level', () => {
    it('info() is silent when level is set to WARN', () => {
      const log = createLogger(LOG_LEVELS.WARN);
      log.info('should be suppressed');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('warn() still emits at WARN level', () => {
      const log = createLogger(LOG_LEVELS.WARN);
      log.warn('this is a warning');
      expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('error() still emits at WARN level', () => {
      const log = createLogger(LOG_LEVELS.WARN);
      log.error('critical');
      expect(errorSpy).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // Level = ERROR — only errors should get through
  // -------------------------------------------------------------------------
  describe('at ERROR level', () => {
    it('info() is silent when level is ERROR', () => {
      const log = createLogger(LOG_LEVELS.ERROR);
      log.info('should be suppressed');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('warn() is silent when level is ERROR', () => {
      const log = createLogger(LOG_LEVELS.ERROR);
      log.warn('should be suppressed');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('error() always outputs even at ERROR level', () => {
      const log = createLogger(LOG_LEVELS.ERROR);
      log.error('fatal', { code: 42 });
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'fatal', { code: 42 });
    });
  });

  // -------------------------------------------------------------------------
  // setLevel() dynamically changes behaviour
  // -------------------------------------------------------------------------
  describe('setLevel()', () => {
    it('raises level from INFO to WARN — info becomes silent', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.setLevel(LOG_LEVELS.WARN);
      log.info('now silent');
      expect(infoSpy).not.toHaveBeenCalled();
    });

    it('lowers level from ERROR back to INFO — info emits again', () => {
      const log = createLogger(LOG_LEVELS.ERROR);
      log.setLevel(LOG_LEVELS.INFO);
      log.info('now visible');
      expect(infoSpy).toHaveBeenCalledOnce();
    });

    it('level getter reflects setLevel() change', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.setLevel(LOG_LEVELS.WARN);
      expect(log.level).toBe(1 satisfies LogLevel);
    });
  });

  // -------------------------------------------------------------------------
  // Multi-argument and edge cases
  // -------------------------------------------------------------------------
  describe('multi-argument logging', () => {
    it('forwards all extra args to console', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      const obj = { foo: 'bar' };
      log.info('msg', obj, 123, null);
      expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'msg', obj, 123, null);
    });

    it('logs with zero extra args (only prefix)', () => {
      const log = createLogger(LOG_LEVELS.INFO);
      log.info();
      expect(infoSpy).toHaveBeenCalledWith('[INFO]');
    });
  });
});
