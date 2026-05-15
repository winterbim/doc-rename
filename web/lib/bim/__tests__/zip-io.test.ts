/**
 * Tests for lib/bim/zip-io.ts
 * Uses jszip to build test ZIPs in memory, then verifies readZip / writeZip.
 */

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { readZip, writeZip, isZip } from '../zip-io';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Blob ZIP with an arbitrary set of { path, content } entries. */
async function buildTestZip(
  entries: Array<{ path: string; content: string }>,
): Promise<Blob> {
  const zip = new JSZip();
  for (const e of entries) {
    zip.file(e.path, e.content);
  }
  return zip.generateAsync({ type: 'blob' });
}

// ---------------------------------------------------------------------------
// isZip
// ---------------------------------------------------------------------------

describe('isZip', () => {
  it('returns true for .zip file', () => {
    const file = new File([], 'archive.zip', { type: 'application/zip' });
    expect(isZip(file)).toBe(true);
  });

  it('returns true for .ZIP (uppercase)', () => {
    const file = new File([], 'ARCHIVE.ZIP');
    expect(isZip(file)).toBe(true);
  });

  it('returns false for .pdf', () => {
    const file = new File([], 'document.pdf');
    expect(isZip(file)).toBe(false);
  });

  it('returns false for .docx', () => {
    const file = new File([], 'report.docx');
    expect(isZip(file)).toBe(false);
  });

  it('returns false for empty name', () => {
    const file = new File([], '');
    expect(isZip(file)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// readZip — basic
// ---------------------------------------------------------------------------

describe('readZip — basic', () => {
  it('returns 3 entries for a 3-file ZIP', async () => {
    const blob = await buildTestZip([
      { path: 'a.pdf', content: 'aaa' },
      { path: 'b.dwg', content: 'bbb' },
      { path: 'c.ifc', content: 'ccc' },
    ]);
    const entries = await readZip(blob);
    const files = entries.filter((e) => !e.isDir);
    expect(files).toHaveLength(3);
  });

  it('returns entries with correct paths', async () => {
    const blob = await buildTestZip([
      { path: 'plan.pdf', content: 'x' },
      { path: 'drawing.dwg', content: 'y' },
    ]);
    const entries = await readZip(blob);
    const paths = entries.map((e) => e.path);
    expect(paths).toContain('plan.pdf');
    expect(paths).toContain('drawing.dwg');
  });

  it('entry.blob() resolves to a Blob', async () => {
    const blob = await buildTestZip([{ path: 'file.txt', content: 'hello' }]);
    const entries = await readZip(blob);
    const entry = entries.find((e) => e.name === 'file.txt');
    expect(entry).toBeDefined();
    const b = await entry!.blob();
    expect(b).toBeInstanceOf(Blob);
    expect(b.size).toBeGreaterThan(0);
  });

  it('reads the correct content from blob()', async () => {
    const blob = await buildTestZip([{ path: 'hello.txt', content: 'world' }]);
    const entries = await readZip(blob);
    const entry = entries.find((e) => e.name === 'hello.txt');
    expect(entry).toBeDefined();
    const b = await entry!.blob();
    const text = await b.text();
    expect(text).toBe('world');
  });
});

// ---------------------------------------------------------------------------
// readZip — nested structure
// ---------------------------------------------------------------------------

describe('readZip — nested paths', () => {
  it('sets correct folder for nested entries', async () => {
    const blob = await buildTestZip([
      { path: 'docs/plan.pdf', content: 'x' },
      { path: 'cad/drawing.dwg', content: 'y' },
      { path: 'top.pdf', content: 'z' },
    ]);
    const entries = await readZip(blob);
    const files = entries.filter((e) => !e.isDir);

    const plan = files.find((e) => e.name === 'plan.pdf');
    expect(plan).toBeDefined();
    expect(plan!.folder).toBe('docs');

    const drawing = files.find((e) => e.name === 'drawing.dwg');
    expect(drawing).toBeDefined();
    expect(drawing!.folder).toBe('cad');

    const top = files.find((e) => e.name === 'top.pdf');
    expect(top).toBeDefined();
    expect(top!.folder).toBe('');
  });

  it('sets correct name for nested entries', async () => {
    const blob = await buildTestZip([
      { path: 'subfolder/report.pdf', content: 'r' },
    ]);
    const entries = await readZip(blob);
    const file = entries.find((e) => !e.isDir && e.path === 'subfolder/report.pdf');
    expect(file).toBeDefined();
    expect(file!.name).toBe('report.pdf');
  });

  it('handles deeply nested paths', async () => {
    const blob = await buildTestZip([
      { path: 'a/b/c/deep.pdf', content: 'd' },
    ]);
    const entries = await readZip(blob);
    const file = entries.find((e) => e.name === 'deep.pdf');
    expect(file).toBeDefined();
    expect(file!.folder).toBe('a/b/c');
  });
});

// ---------------------------------------------------------------------------
// readZip — macOS artefact filtering
// ---------------------------------------------------------------------------

describe('readZip — macOS filtering', () => {
  it('excludes __MACOSX entries', async () => {
    const zip = new JSZip();
    zip.file('doc.pdf', 'hello');
    zip.file('__MACOSX/._doc.pdf', 'macos-meta');
    const blob = await zip.generateAsync({ type: 'blob' });
    const entries = await readZip(blob);
    const paths = entries.map((e) => e.path);
    expect(paths.some((p) => p.startsWith('__MACOSX'))).toBe(false);
  });

  it('excludes .DS_Store entries', async () => {
    const zip = new JSZip();
    zip.file('doc.pdf', 'hello');
    zip.file('subfolder/.DS_Store', 'ds');
    const blob = await zip.generateAsync({ type: 'blob' });
    const entries = await readZip(blob);
    const paths = entries.map((e) => e.path);
    expect(paths.some((p) => p.includes('.DS_Store'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// readZip — accepts ArrayBuffer
// ---------------------------------------------------------------------------

describe('readZip — ArrayBuffer input', () => {
  it('accepts an ArrayBuffer as source', async () => {
    const zip = new JSZip();
    zip.file('buffer-test.pdf', 'buf');
    const ab = await zip.generateAsync({ type: 'arraybuffer' });
    const entries = await readZip(ab);
    const files = entries.filter((e) => !e.isDir);
    expect(files.some((e) => e.name === 'buffer-test.pdf')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// writeZip
// ---------------------------------------------------------------------------

describe('writeZip', () => {
  it('produces a non-empty Blob', async () => {
    const result = await writeZip([
      { path: 'file1.pdf', blob: new Blob(['aaa'], { type: 'application/pdf' }) },
    ]);
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBeGreaterThan(0);
  });

  it('written ZIP can be re-read by readZip (round-trip)', async () => {
    const entries = [
      { path: 'docs/plan.pdf', blob: new Blob(['plan content']) },
      { path: 'cad/drawing.dwg', blob: new Blob(['dwg content']) },
    ];
    const zipped = await writeZip(entries);
    const readBack = await readZip(zipped);
    const files = readBack.filter((e) => !e.isDir);

    expect(files.some((e) => e.path === 'docs/plan.pdf')).toBe(true);
    expect(files.some((e) => e.path === 'cad/drawing.dwg')).toBe(true);
  });

  it('round-trip preserves content', async () => {
    const original = 'Hello BIM world!';
    const zipped = await writeZip([
      { path: 'hello.txt', blob: new Blob([original]) },
    ]);
    const readBack = await readZip(zipped);
    const entry = readBack.find((e) => e.name === 'hello.txt');
    expect(entry).toBeDefined();
    const b = await entry!.blob();
    const text = await b.text();
    expect(text).toBe(original);
  });

  it('handles an empty entry list (produces valid empty ZIP)', async () => {
    const result = await writeZip([]);
    expect(result).toBeInstanceOf(Blob);
    // An empty ZIP is still a valid Blob (has PK header at minimum)
    expect(result.size).toBeGreaterThan(0);
  });

  it('preserves folder paths in the written ZIP', async () => {
    const zipped = await writeZip([
      { path: 'a/b/file.pdf', blob: new Blob(['x']) },
    ]);
    const readBack = await readZip(zipped);
    const file = readBack.find((e) => !e.isDir && e.name === 'file.pdf');
    expect(file).toBeDefined();
    expect(file!.folder).toBe('a/b');
  });
});
