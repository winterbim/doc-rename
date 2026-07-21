/**
 * Tests for lib/rename-engine/zip-io.ts
 * Uses jszip to build test ZIPs in memory, then verifies readZip / writeZip.
 */

import { describe, it, expect, vi } from 'vitest';
import JSZip from 'jszip';
import { readZip, writeZip, isZip, normalizeZipArchiveName } from '../zip-io';

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

function replaceAscii(
  source: ArrayBuffer,
  original: string,
  replacement: string,
  maxReplacements = Number.POSITIVE_INFINITY,
): ArrayBuffer {
  const originalBytes = new TextEncoder().encode(original);
  const replacementBytes = new TextEncoder().encode(replacement);
  expect(replacementBytes).toHaveLength(originalBytes.length);

  const output = new Uint8Array(source.slice(0));
  let replacements = 0;
  for (
    let offset = 0;
    offset <= output.length - originalBytes.length && replacements < maxReplacements;
    offset += 1
  ) {
    const matches = originalBytes.every((byte, index) => output[offset + index] === byte);
    if (!matches) continue;
    output.set(replacementBytes, offset);
    replacements += 1;
    offset += originalBytes.length - 1;
  }
  expect(replacements).toBeGreaterThan(0);
  return output.buffer;
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

describe('normalizeZipArchiveName', () => {
  it('uppercases, strips accents and appends .ZIP', () => {
    expect(normalizeZipArchiveName('livrables été')).toBe('LIVRABLES_ETE.ZIP');
  });

  it('does not duplicate the zip extension', () => {
    expect(normalizeZipArchiveName('plans.zip')).toBe('PLANS.ZIP');
  });

  it.each(['../../outside', 'plans/final', 'bad\u0000name', 'CON'])(
    'returns a portable outer archive name for hostile input %s',
    (input) => {
      const output = normalizeZipArchiveName(input);
      expect(output).toMatch(/^[A-Z0-9_]+\.ZIP$/);
      expect(output).not.toContain('/');
      expect(output).not.toContain('\\');
    },
  );

  it('bounds the outer archive name to one portable filesystem component', () => {
    const output = normalizeZipArchiveName('a'.repeat(1_000));
    expect(new TextEncoder().encode(output).byteLength).toBeLessThanOrEqual(255);
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

  it('reports the uncompressed size, not the compressed byte count', async () => {
    const content = 'A'.repeat(20_000);
    const blob = await buildTestZip([{ path: 'compressible.txt', content }]);
    const [entry] = (await readZip(blob)).filter((item) => !item.isDir);
    expect(entry.size).toBe(content.length);
  });

  it('rejects traversal before JSZip can sanitize and hide the original path', async () => {
    const blob = await buildTestZip([{ path: '../outside.pdf', content: 'blocked' }]);
    await expect(readZip(blob)).rejects.toThrow(/chemin dangereux/i);
  });

  it('rejects ambiguous empty path segments before invoking JSZip', async () => {
    const blob = await buildTestZip([{ path: 'safe/xfile.pdf', content: 'blocked' }]);
    const mutated = replaceAscii(await blob.arrayBuffer(), 'safe/xfile.pdf', 'safe//file.pdf');
    const loadSpy = vi.spyOn(JSZip, 'loadAsync');

    try {
      await expect(readZip(mutated)).rejects.toThrow(/chemin dangereux/i);
      expect(loadSpy).not.toHaveBeenCalled();
    } finally {
      loadSpy.mockRestore();
    }
  });

  it('rejects duplicate central paths instead of allowing JSZip to overwrite one', async () => {
    const blob = await buildTestZip([
      { path: 'safe/one.pdf', content: 'one' },
      { path: 'safe/two.pdf', content: 'two' },
    ]);
    const mutated = replaceAscii(await blob.arrayBuffer(), 'safe/two.pdf', 'safe/one.pdf');
    await expect(readZip(mutated)).rejects.toThrow(/collision de chemins/i);
  });

  it('rejects case-insensitive and Unicode-normalized path collisions', async () => {
    const caseCollision = await buildTestZip([
      { path: 'plans/PLAN.pdf', content: 'one' },
      { path: 'plans/plan.pdf', content: 'two' },
    ]);
    const unicodeCollision = await buildTestZip([
      { path: 'café.pdf', content: 'one' },
      { path: 'cafe\u0301.pdf', content: 'two' },
    ]);

    await expect(readZip(caseCollision)).rejects.toThrow(/collision de chemins/i);
    await expect(readZip(unicodeCollision)).rejects.toThrow(/collision de chemins/i);
  });

  it('rejects a local filename that differs from its central-directory name', async () => {
    const blob = await buildTestZip([{ path: 'safe/one.pdf', content: 'blocked' }]);
    const mutated = replaceAscii(
      await blob.arrayBuffer(),
      'safe/one.pdf',
      'safe/two.pdf',
      1,
    );
    await expect(readZip(mutated)).rejects.toThrow(/noms local et central différents/i);
  });

  it('rejects trailing bytes after the declared ZIP comment', async () => {
    const blob = await buildTestZip([{ path: 'safe.pdf', content: 'ok' }]);
    const data = new Uint8Array(await blob.arrayBuffer());
    const withTrailingJunk = new Uint8Array(data.length + 1);
    withTrailingJunk.set(data);
    withTrailingJunk[data.length] = 0x41;

    await expect(readZip(withTrailingJunk.buffer)).rejects.toThrow(/données finales/i);
  });

  it('applies the entry cap cumulatively across separate archives', async () => {
    const budget = { entries: 4_999 };
    const blob = await buildTestZip([
      { path: 'first.pdf', content: 'one' },
      { path: 'second.pdf', content: 'two' },
    ]);

    await expect(readZip(blob, budget)).rejects.toThrow(/entrées maximum/i);
    expect(budget.entries).toBe(4_999);
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

  it('rejects unsafe output paths', async () => {
    await expect(
      writeZip([{ path: '../outside.pdf', blob: new Blob(['x']) }]),
    ).rejects.toThrow(/Chemin relatif interdit/i);
  });

  it('rejects case-insensitive duplicate output paths instead of overwriting data', async () => {
    await expect(
      writeZip([
        { path: 'plans/PLAN.pdf', blob: new Blob(['first']) },
        { path: 'plans/plan.PDF', blob: new Blob(['second']) },
      ]),
    ).rejects.toThrow(/même chemin ZIP/i);
  });

  it.each(['safe/./file.pdf', 'safe//file.pdf', 'COM9.txt', 'plan.pdf.']) (
    'rejects non-portable output path %s',
    async (path) => {
      await expect(writeZip([{ path, blob: new Blob(['x']) }])).rejects.toThrow();
    },
  );
});
