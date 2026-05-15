import { describe, it, expect } from 'vitest';
import type { BimFile } from '@/lib/bim/types';
import type { AppState } from '@/lib/app-state';
import {
  applySearch,
  applyExtFilter,
  getDistinctExtensions,
  getVisibleFiles,
} from './file-filters';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(
  overrides: Partial<BimFile> & { original: string; extension: string }
): BimFile {
  const { id, original, extension, newName, ...rest } = overrides;
  return {
    id: id ?? original,
    original,
    extension,
    newName,
    blob: new Blob(),
    folder: '',
    size: 0,
    status: 'ready',
    addedAt: new Date(),
    category: 'documents',
    detectedType: null,
    mappedFields: {},
    autoDetected: {},
    cleanedBaseName: null,
    ...rest,
  };
}

const files: BimFile[] = [
  makeFile({ id: '1', original: 'H3_ARC_Plan_001.pdf', extension: '.pdf' }),
  makeFile({ id: '2', original: 'H3_ARC_Plan_002.pdf', extension: '.pdf' }),
  makeFile({ id: '3', original: 'H3_STR_Mur_A.dwg', extension: '.dwg' }),
  makeFile({ id: '4', original: 'PROJ_IFC_Model.ifc', extension: '.ifc' }),
  makeFile({
    id: '5',
    original: 'Photo_facade.jpg',
    extension: '.jpg',
    newName: 'H3_PHOTO_facade.jpg',
  }),
];

// ---------------------------------------------------------------------------
// applySearch
// ---------------------------------------------------------------------------

describe('applySearch', () => {
  it('returns all files when query is empty', () => {
    expect(applySearch(files, '')).toHaveLength(files.length);
  });

  it('returns all files when query is whitespace only', () => {
    expect(applySearch(files, '   ')).toHaveLength(files.length);
  });

  it('matches against original filename (case-insensitive)', () => {
    const result = applySearch(files, 'h3_arc');
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.id)).toEqual(['1', '2']);
  });

  it('matches against newName when set', () => {
    // file 5 has newName containing H3_PHOTO
    const result = applySearch(files, 'H3_PHOTO');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('returns empty array when no match', () => {
    expect(applySearch(files, 'NOMATCHWHATSOEVER')).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    expect(applySearch(files, 'plan')).toHaveLength(2);
    expect(applySearch(files, 'PLAN')).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// applyExtFilter
// ---------------------------------------------------------------------------

describe('applyExtFilter', () => {
  it('returns all files when filter is empty', () => {
    expect(applyExtFilter(files, '')).toHaveLength(files.length);
  });

  it('filters to .pdf only', () => {
    const result = applyExtFilter(files, '.pdf');
    expect(result).toHaveLength(2);
    result.forEach((f) => expect(f.extension.toLowerCase()).toBe('.pdf'));
  });

  it('filters to .dwg only', () => {
    const result = applyExtFilter(files, '.dwg');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('is case-insensitive on extension', () => {
    const mixed = [
      makeFile({ id: 'a', original: 'File.PDF', extension: '.PDF' }),
      makeFile({ id: 'b', original: 'File.pdf', extension: '.pdf' }),
    ];
    expect(applyExtFilter(mixed, '.pdf')).toHaveLength(2);
    expect(applyExtFilter(mixed, '.PDF')).toHaveLength(2);
  });

  it('returns empty when no files have the extension', () => {
    expect(applyExtFilter(files, '.rvt')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getDistinctExtensions
// ---------------------------------------------------------------------------

describe('getDistinctExtensions', () => {
  it('returns sorted distinct lowercase extensions', () => {
    const result = getDistinctExtensions(files);
    expect(result).toEqual(['.dwg', '.ifc', '.jpg', '.pdf']);
  });

  it('returns empty array for empty files list', () => {
    expect(getDistinctExtensions([])).toEqual([]);
  });

  it('deduplicates extensions', () => {
    const dupes = [
      makeFile({ id: 'a', original: 'a.pdf', extension: '.pdf' }),
      makeFile({ id: 'b', original: 'b.pdf', extension: '.pdf' }),
    ];
    expect(getDistinctExtensions(dupes)).toEqual(['.pdf']);
  });

  it('normalizes extension case', () => {
    const mixed = [
      makeFile({ id: 'a', original: 'a.PDF', extension: '.PDF' }),
      makeFile({ id: 'b', original: 'b.pdf', extension: '.pdf' }),
    ];
    expect(getDistinctExtensions(mixed)).toEqual(['.pdf']);
  });
});

// ---------------------------------------------------------------------------
// getVisibleFiles
// ---------------------------------------------------------------------------

describe('getVisibleFiles', () => {
  function makeState(
    searchQuery: string,
    extFilter: string
  ): Pick<AppState, 'files' | 'ui'> {
    return {
      files,
      ui: { searchQuery, extFilter, selectedIds: [], previewingFileId: null, applyScope: 'all' },
    };
  }

  it('returns all files when both filters are empty', () => {
    const result = getVisibleFiles(makeState('', '') as AppState);
    expect(result).toHaveLength(files.length);
  });

  it('applies search filter', () => {
    const result = getVisibleFiles(makeState('plan', '') as AppState);
    expect(result).toHaveLength(2);
  });

  it('applies ext filter', () => {
    const result = getVisibleFiles(makeState('', '.pdf') as AppState);
    expect(result).toHaveLength(2);
  });

  it('composes search and ext filter (AND)', () => {
    // "H3_ARC" and ".pdf" → 2 results
    const result = getVisibleFiles(makeState('H3_ARC', '.pdf') as AppState);
    expect(result).toHaveLength(2);
  });

  it('composition can return zero', () => {
    // "H3_ARC" is only in .pdf files, not .dwg
    const result = getVisibleFiles(makeState('H3_ARC', '.dwg') as AppState);
    expect(result).toHaveLength(0);
  });
});
