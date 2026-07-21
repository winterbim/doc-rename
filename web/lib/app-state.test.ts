import { describe, expect, it } from 'vitest';
import { appReducer, initialState } from './app-state';
import type { WorkspaceFile } from './rename-engine/types';

function makeFile(overrides: Partial<WorkspaceFile> = {}): WorkspaceFile {
  return {
    id: 'f1',
    original: 'plan.pdf',
    newName: 'OLD_PLAN.pdf',
    extension: '.pdf',
    blob: new Blob(['x']),
    folder: '',
    size: 1,
    status: 'renamed',
    addedAt: new Date('2026-01-01T00:00:00Z'),
    category: 'documents',
    mappedFields: { project: 'OLD' },
    autoDetected: {},
    cleanedBaseName: null,
    ...overrides,
  };
}

describe('appReducer profile changes', () => {
  it('activates the selected profile immediately with its default fields', () => {
    const state = {
      ...initialState,
      fields: {
        ...initialState.fields,
        values: { project: 'SYSY', building: 'BAT', docType: 'PLAN' },
      },
    };

    const next = appReducer(state, { type: 'PROFILE_CHANGE', profileId: 'finance' });

    expect(next.profileId).toBe('finance');
    expect(next.fields.activeFieldIds).toEqual([
      'entity',
      'year',
      'month',
      'docType',
      'reference',
      'status',
    ]);
    expect(next.fields.values).toEqual({});
    expect(next.separator).toBe('_');
  });

  it('keeps imported files but clears stale generated names', () => {
    const next = appReducer(
      {
        ...initialState,
        files: [makeFile()],
      },
      { type: 'PROFILE_CHANGE', profileId: 'hr' },
    );

    expect(next.files).toHaveLength(1);
    expect(next.files[0].original).toBe('plan.pdf');
    expect(next.files[0].newName).toBeUndefined();
    expect(next.files[0].status).toBe('ready');
    expect(next.files[0].mappedFields).toEqual({});
  });

  it('returns the same state when selecting the already active profile', () => {
    const next = appReducer(initialState, {
      type: 'PROFILE_CHANGE',
      profileId: initialState.profileId,
    });

    expect(next).toBe(initialState);
  });
});

describe('appReducer active fields', () => {
  it('keeps valid profile-specific fields when activating available fields', () => {
    const state = {
      ...initialState,
      profileId: 'finance' as const,
      fields: {
        activeFieldIds: ['entity', 'docType'],
        values: {},
        workLotPart: null,
      },
    };

    const next = appReducer(state, {
      type: 'FIELDS_SET_ACTIVE',
      fieldIds: ['entity', 'docType', 'reference', 'version'],
    });

    expect(next.fields.activeFieldIds).toEqual([
      'entity',
      'docType',
      'reference',
      'version',
    ]);
  });
});

describe('appReducer output normalization', () => {
  it('normalizes manual rename overrides', () => {
    const next = appReducer(
      {
        ...initialState,
        files: [makeFile({ status: 'ready', newName: undefined })],
      },
      { type: 'FILE_RENAME_OVERRIDE', fileId: 'f1', newName: 'façade été.pdf' },
    );

    expect(next.files[0].newName).toBe('FACADE ETE.PDF');
    expect(next.files[0].status).toBe('renamed');
  });

  it('does not mark a traversal-like manual override as downloadable', () => {
    const next = appReducer(
      { ...initialState, files: [makeFile({ status: 'ready', newName: undefined })] },
      { type: 'FILE_RENAME_OVERRIDE', fileId: 'f1', newName: '../../document.pdf' },
    );
    expect(next.files[0].status).toBe('error');
  });

  it('normalizes simple replace results', () => {
    const next = appReducer(
      {
        ...initialState,
        files: [makeFile({ newName: 'PLAN.pdf' })],
      },
      {
        type: 'FILES_REPLACE_TEXT',
        find: 'PLAN',
        replace: 'façade',
        caseSensitive: true,
        regex: false,
        fileIds: ['f1'],
      },
    );

    expect(next.files[0].newName).toBe('FACADE.PDF');
    expect(next.files[0].status).toBe('renamed');
  });

  it.each([
    { regex: false, find: 'PLAN', replace: '../../evil', expected: '../../EVIL.PDF' },
    { regex: true, find: '^PLAN', replace: 'CON', expected: 'CON.PDF' },
  ])('marks invalid replace results as errors', ({ regex, find, replace, expected }) => {
    const next = appReducer(
      {
        ...initialState,
        files: [makeFile({ newName: 'PLAN.pdf' })],
      },
      {
        type: 'FILES_REPLACE_TEXT',
        find,
        replace,
        caseSensitive: true,
        regex,
        fileIds: ['f1'],
      },
    );

    expect(next.files[0].newName).toBe(expected);
    expect(next.files[0].status).toBe('error');
  });

  it('validates batch replacement names before marking them downloadable', () => {
    const next = appReducer(
      {
        ...initialState,
        files: [makeFile({ newName: 'PLAN.pdf' })],
      },
      {
        type: 'FILES_REPLACE_BATCH',
        updates: [{ id: 'f1', newName: '../outside.pdf' }],
      },
    );

    expect(next.files[0].newName).toBe('../OUTSIDE.PDF');
    expect(next.files[0].status).toBe('error');
  });
});
