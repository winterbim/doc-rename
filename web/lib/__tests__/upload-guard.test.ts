import { describe, it, expect } from 'vitest';
import {
  checkFilename,
  checkArchivePath,
  checkSize,
  checkBatchSize,
  checkArchiveEntryCount,
  checkExtractedBatchSize,
  reserveArchiveEntries,
  checkZipMagic,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
  MAX_ARCHIVE_ENTRIES,
} from '../upload-guard';

describe('upload-guard: checkFilename', () => {
  it('accepts a normal name', () => {
    expect(checkFilename('plan_facade.pdf').ok).toBe(true);
  });

  it('rejects empty', () => {
    expect(checkFilename('').ok).toBe(false);
  });

  it('rejects path traversal', () => {
    expect(checkFilename('../etc/passwd').ok).toBe(false);
    expect(checkFilename('a/../b').ok).toBe(false);
    expect(checkFilename('a\\..\\b').ok).toBe(false);
  });

  it('rejects control chars', () => {
    expect(checkFilename('plan\x00.pdf').ok).toBe(false);
    expect(checkFilename('plan\x1f.pdf').ok).toBe(false);
  });

  it('rejects whitespace controls and bidi override characters', () => {
    expect(checkFilename('plan\tname.pdf').ok).toBe(false);
    expect(checkFilename('plan\nname.pdf').ok).toBe(false);
    expect(checkFilename('plan\u202ename.pdf').ok).toBe(false);
  });

  it('rejects names > 255 chars', () => {
    expect(checkFilename('a'.repeat(256) + '.pdf').ok).toBe(false);
  });

  it('uses the UTF-8 byte length and rejects trailing Windows aliases', () => {
    expect(checkFilename(`${'é'.repeat(128)}.pdf`).ok).toBe(false);
    expect(checkFilename('plan.pdf ').ok).toBe(false);
  });

  it('accepts names with dots that are not traversal', () => {
    expect(checkFilename('plan.v2.final.pdf').ok).toBe(true);
    expect(checkFilename('.gitignore').ok).toBe(true);
  });
});

describe('upload-guard: checkArchivePath', () => {
  it('accepts a normal nested relative path', () => {
    expect(checkArchivePath('plans/phase-1/facade.pdf').ok).toBe(true);
  });

  it.each(['../secret.pdf', 'plans/../../secret.pdf', '/etc/passwd', 'C:\\secret.pdf']) (
    'rejects traversal or absolute path %s',
    (path) => expect(checkArchivePath(path).ok).toBe(false),
  );

  it('rejects control characters and overlong path components', () => {
    expect(checkArchivePath('folder/evil\u0000.pdf').ok).toBe(false);
    expect(checkArchivePath(`folder/${'x'.repeat(256)}.pdf`).ok).toBe(false);
  });

  it.each(['safe/./file.pdf', 'safe//file.pdf', 'safe/file.pdf/']) (
    'rejects non-canonical archive path %s',
    (path) => expect(checkArchivePath(path).ok).toBe(false),
  );
});

describe('upload-guard: checkSize', () => {
  it('accepts 1 byte', () => expect(checkSize(1).ok).toBe(true));
  it('accepts file exactly at cap', () => expect(checkSize(MAX_FILE_SIZE).ok).toBe(true));
  it('rejects > cap', () => expect(checkSize(MAX_FILE_SIZE + 1).ok).toBe(false));
  it('rejects negative', () => expect(checkSize(-1).ok).toBe(false));
  it('rejects NaN', () => expect(checkSize(Number.NaN).ok).toBe(false));
  it('rejects Infinity', () => expect(checkSize(Number.POSITIVE_INFINITY).ok).toBe(false));
});

describe('upload-guard: checkBatchSize', () => {
  it('accepts under cap', () => expect(checkBatchSize(MAX_BATCH_SIZE - 1).ok).toBe(true));
  it('rejects over cap', () => expect(checkBatchSize(MAX_BATCH_SIZE + 1).ok).toBe(false));
});

describe('upload-guard: checkArchiveEntryCount', () => {
  it('accepts the cap and rejects the next entry', () => {
    expect(checkArchiveEntryCount(MAX_ARCHIVE_ENTRIES).ok).toBe(true);
    expect(checkArchiveEntryCount(MAX_ARCHIVE_ENTRIES + 1).ok).toBe(false);
  });

  it('enforces one cumulative cap across multiple reservations', () => {
    const budget = { entries: 0 };
    expect(reserveArchiveEntries(budget, 3_000).ok).toBe(true);
    expect(reserveArchiveEntries(budget, 2_000).ok).toBe(true);
    expect(budget.entries).toBe(MAX_ARCHIVE_ENTRIES);
    expect(reserveArchiveEntries(budget, 1).ok).toBe(false);
    expect(budget.entries).toBe(MAX_ARCHIVE_ENTRIES);
  });
});

describe('upload-guard: extracted archive budget', () => {
  it('rejects invalid and oversized totals', () => {
    expect(checkExtractedBatchSize(1).ok).toBe(true);
    expect(checkExtractedBatchSize(Number.POSITIVE_INFINITY).ok).toBe(false);
    expect(checkExtractedBatchSize(501 * 1024 * 1024).ok).toBe(false);
  });
});

describe('upload-guard: checkZipMagic', () => {
  it('accepts standard ZIP local file header (PK\\x03\\x04)', async () => {
    const blob = new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00])]);
    const r = await checkZipMagic(blob);
    expect(r.ok).toBe(true);
  });

  it('accepts empty-archive marker (PK\\x05\\x06)', async () => {
    const blob = new Blob([new Uint8Array([0x50, 0x4b, 0x05, 0x06])]);
    expect((await checkZipMagic(blob)).ok).toBe(true);
  });

  it('rejects wrong magic', async () => {
    const blob = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])]); // JPEG header
    const r = await checkZipMagic(blob);
    expect(r.ok).toBe(false);
  });

  it('rejects too-small blob', async () => {
    const blob = new Blob([new Uint8Array([0x50])]);
    expect((await checkZipMagic(blob)).ok).toBe(false);
  });

  it('rejects PK with unknown signature byte', async () => {
    const blob = new Blob([new Uint8Array([0x50, 0x4b, 0x99, 0x99])]);
    expect((await checkZipMagic(blob)).ok).toBe(false);
  });
});
