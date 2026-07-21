import { describe, it, expect } from 'vitest';
import { isOtherArchive, archiveLabel } from '../archive-io';

function makeFile(name: string): File {
  return new File([], name);
}

describe('isOtherArchive', () => {
  it('returns true for .rar', () => {
    expect(isOtherArchive(makeFile('project.rar'))).toBe(true);
  });

  it('returns false for .zip (ZIP is JSZip territory)', () => {
    expect(isOtherArchive(makeFile('project.zip'))).toBe(false);
  });

  it('returns true for .7z', () => {
    expect(isOtherArchive(makeFile('model.7z'))).toBe(true);
  });

  it('returns true for .tar.gz', () => {
    expect(isOtherArchive(makeFile('backup.tar.gz'))).toBe(true);
  });

  it('returns true for .tgz', () => {
    expect(isOtherArchive(makeFile('backup.tgz'))).toBe(true);
  });

  it('returns true for .tar', () => {
    expect(isOtherArchive(makeFile('bundle.tar'))).toBe(true);
  });

  it('returns true for .gz', () => {
    expect(isOtherArchive(makeFile('file.gz'))).toBe(true);
  });

  it('returns true for .bz2', () => {
    expect(isOtherArchive(makeFile('file.bz2'))).toBe(true);
  });

  it('returns true for .tar.bz2', () => {
    expect(isOtherArchive(makeFile('file.tar.bz2'))).toBe(true);
  });

  it('returns true for .xz', () => {
    expect(isOtherArchive(makeFile('file.xz'))).toBe(true);
  });

  it('returns true for .tar.xz', () => {
    expect(isOtherArchive(makeFile('file.tar.xz'))).toBe(true);
  });

  it('returns false for .pdf', () => {
    expect(isOtherArchive(makeFile('plan.pdf'))).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isOtherArchive(makeFile('ARCHIVE.RAR'))).toBe(true);
    expect(isOtherArchive(makeFile('MODEL.7Z'))).toBe(true);
  });
});

describe('archiveLabel', () => {
  it('returns RAR for .rar', () => {
    expect(archiveLabel(makeFile('x.rar'))).toBe('RAR');
  });

  it('returns 7z for .7z', () => {
    expect(archiveLabel(makeFile('x.7z'))).toBe('7z');
  });

  it('returns TAR.GZ for .tar.gz', () => {
    expect(archiveLabel(makeFile('x.tar.gz'))).toBe('TAR.GZ');
  });

  it('returns TAR.GZ for .tgz', () => {
    expect(archiveLabel(makeFile('x.tgz'))).toBe('TAR.GZ');
  });

  it('returns TAR.BZ2 for .tar.bz2', () => {
    expect(archiveLabel(makeFile('x.tar.bz2'))).toBe('TAR.BZ2');
  });

  it('returns TAR.XZ for .tar.xz', () => {
    expect(archiveLabel(makeFile('x.tar.xz'))).toBe('TAR.XZ');
  });

  it('returns TAR for .tar', () => {
    expect(archiveLabel(makeFile('x.tar'))).toBe('TAR');
  });

  it('returns GZIP for .gz', () => {
    expect(archiveLabel(makeFile('x.gz'))).toBe('GZIP');
  });

  it('returns BZIP2 for .bz2', () => {
    expect(archiveLabel(makeFile('x.bz2'))).toBe('BZIP2');
  });

  it('returns XZ for .xz', () => {
    expect(archiveLabel(makeFile('x.xz'))).toBe('XZ');
  });
});
