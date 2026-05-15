import { describe, it, expect } from 'vitest';
import {
  checkFilename,
  checkSize,
  checkBatchSize,
  checkZipMagic,
  MAX_FILE_SIZE,
  MAX_BATCH_SIZE,
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

  it('accepts tab + LF + CR (not blocked) — those are 0x09/0x0a/0x0d', () => {
    // Tabs/newlines are rare in filenames but not classed as dangerous here.
    expect(checkFilename('plan\tname.pdf').ok).toBe(true);
  });

  it('rejects names > 255 chars', () => {
    expect(checkFilename('a'.repeat(256) + '.pdf').ok).toBe(false);
  });

  it('accepts names with dots that are not traversal', () => {
    expect(checkFilename('plan.v2.final.pdf').ok).toBe(true);
    expect(checkFilename('.gitignore').ok).toBe(true);
  });
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
