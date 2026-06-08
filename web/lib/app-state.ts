/**
 * App-level state shape, reducer, initial state, and React context.
 * Phase C — single useReducer owned by app/page.tsx, exposed via Context.
 */
'use client';

import { createContext, useContext } from 'react';
import type { BimFile, PrefixRule } from '@/lib/bim/types';
import {
  loadTemplate,
  setFieldValue,
  setActiveFields,
  type FieldsState,
} from '@/lib/bim/fields';
import { normalizeOutputName } from '@/lib/bim/nomenclature';
import {
  createDefaultState as createDefaultCleanerState,
  type CleanerState,
} from '@/lib/bim/filename-cleaner';
import {
  DEFAULT_PROFILE_ID,
  applyProfileTemplate,
  createDefaultFieldsForProfile,
  getIndustryProfile,
  getProfileFieldDefinitions,
  getProfileTemplate,
  isIndustryProfileId,
  mergeProfileEntities,
  normalizeFieldValue,
  type IndustryProfileId,
  type ProfileEntitiesById,
  type ProfileEntity,
} from '@/lib/profiles';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AppUiState {
  searchQuery: string;
  extFilter: string; // '' = all, '.pdf', '.dwg', etc.
  selectedIds: string[];
  previewingFileId: string | null;
  /** Controls whether primary actions (rename, download) act on the selection
   *  or on all files. Auto-set when selectedIds changes. */
  applyScope: 'selection' | 'all';
}

export interface AppState {
  files: BimFile[];
  profileId: IndustryProfileId;
  profileEntities: ProfileEntitiesById;
  fields: FieldsState;
  separator: string;
  cleaner: CleanerState;
  prefixRules: PrefixRule[];
  isUploading: boolean;
  isRenaming: boolean;
  preview: string;
  toastMsg: string | null;
  ui: AppUiState;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Persisted slices that can be restored from localStorage.
 * Intentionally omits files, ui.*, isUploading, isRenaming, preview, toastMsg.
 */
export interface PersistedSlices {
  profileId?: IndustryProfileId;
  profileEntities?: ProfileEntitiesById;
  fields?: {
    activeFieldIds?: string[];
    values?: Record<string, string>;
  };
  separator?: string;
  cleaner?: CleanerState;
  prefixRules?: PrefixRule[];
}

export type Action =
  | { type: 'FILES_ADD'; files: BimFile[] }
  | { type: 'FILE_REMOVE'; id: string }
  | { type: 'FILES_RESET' }
  | { type: 'FIELD_VALUE_SET'; fieldId: string; value: string }
  | { type: 'FIELDS_SET_ACTIVE'; fieldIds: string[] }
  | { type: 'TEMPLATE_LOAD'; templateId: string }
  | { type: 'PROFILE_CHANGE'; profileId: IndustryProfileId }
  | { type: 'PROFILE_ENTITY_IMPORT'; profileId: IndustryProfileId; entities: ProfileEntity[] }
  | { type: 'PROFILE_ENTITY_REMOVE'; profileId: IndustryProfileId; entityId: string }
  | { type: 'SEPARATOR_SET'; separator: string }
  | { type: 'RENAME_ALL_START' }
  | {
      type: 'RENAME_ALL_COMPLETE';
      results: Array<{ fileId: string; newName: string; errors: string[] }>;
    }
  | { type: 'PREVIEW_UPDATE'; preview: string }
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_END' }
  | { type: 'TOAST_SHOW'; msg: string }
  | { type: 'TOAST_CLEAR' }
  | { type: 'FILE_RENAME_OVERRIDE'; fileId: string; newName: string }
  // Wave D-2 — search, filter, selection, replace
  | { type: 'SEARCH_SET'; query: string }
  | { type: 'EXT_FILTER_SET'; ext: string }
  | { type: 'FILE_SELECT_TOGGLE'; fileId: string }
  | { type: 'FILES_SELECT_ALL'; ids: string[] }
  | { type: 'FILES_DESELECT_ALL' }
  | {
      type: 'FILES_REPLACE_TEXT';
      find: string;
      replace: string;
      caseSensitive: boolean;
      regex: boolean;
      fileIds: string[];
    }
  | {
      type: 'FILES_REPLACE_BATCH';
      updates: Array<{
        id: string;
        cleanedBaseName?: string | null;
        mappedFields?: Record<string, string>;
        newName?: string;
      }>;
    }
  // Wave E-1 — file viewer
  | { type: 'PREVIEW_OPEN'; fileId: string }
  | { type: 'PREVIEW_CLOSE' }
  // Wave E-2 — hydrate from localStorage
  | { type: 'STATE_HYDRATE'; slices: PersistedSlices }
  // Wave UI-1 — apply scope toggle
  | { type: 'APPLY_SCOPE_SET'; scope: 'selection' | 'all' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialState: AppState = {
  files: [],
  profileId: DEFAULT_PROFILE_ID,
  profileEntities: {},
  fields: createDefaultFieldsForProfile(DEFAULT_PROFILE_ID),
  separator: '_',
  cleaner: createDefaultCleanerState(),
  prefixRules: [],
  isUploading: false,
  isRenaming: false,
  preview: '',
  toastMsg: null,
  ui: {
    searchQuery: '',
    extFilter: '',
    selectedIds: [],
    previewingFileId: null,
    applyScope: 'selection',
  },
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'FILES_ADD':
      return { ...state, files: [...state.files, ...action.files] };

    case 'FILE_REMOVE':
      return { ...state, files: state.files.filter((f) => f.id !== action.id) };

    case 'FILES_RESET':
      return { ...state, files: [] };

    case 'FIELD_VALUE_SET':
      if (isIndustryProfileId(state.profileId)) {
        return {
          ...state,
          fields: {
            ...state.fields,
            values: {
              ...state.fields.values,
              [action.fieldId]: normalizeFieldValue(
                action.value,
                state.profileId,
                state.separator === '-' || state.separator === '.' ? state.separator : '_',
              ),
            },
          },
        };
      }
      return {
        ...state,
        fields: setFieldValue(state.fields, action.fieldId, action.value),
      };

    case 'FIELDS_SET_ACTIVE':
      if (isIndustryProfileId(state.profileId)) {
        const validProfileFieldIds = new Set(
          getProfileFieldDefinitions(
            state.profileId,
            state.profileEntities[state.profileId] ?? [],
          ).map((field) => field.id),
        );
        return {
          ...state,
          fields: {
            ...state.fields,
            activeFieldIds: action.fieldIds.filter((fieldId) =>
              validProfileFieldIds.has(fieldId),
            ),
          },
        };
      }
      return {
        ...state,
        fields: setActiveFields(state.fields, action.fieldIds),
      };

    case 'TEMPLATE_LOAD': {
      const profileTemplate = getProfileTemplate(state.profileId, action.templateId);
      if (profileTemplate) {
        return {
          ...state,
          fields: applyProfileTemplate(state.fields, profileTemplate),
          separator: profileTemplate.defaultSeparator,
        };
      }

      const newFields = loadTemplate(state.fields, action.templateId, false);
      // Also update separator from template defaults
      const templates: Record<string, { separator: string }> = {
        'swiss-bim': { separator: '_' },
        'french-bim': { separator: '-' },
        iso19650: { separator: '-' },
      };
      const sep = templates[action.templateId]?.separator ?? state.separator;
      return { ...state, fields: newFields, separator: sep };
    }

    case 'PROFILE_CHANGE': {
      if (action.profileId === state.profileId) return state;
      const profile = getIndustryProfile(action.profileId);
      return {
        ...state,
        profileId: action.profileId,
        fields: createDefaultFieldsForProfile(action.profileId),
        separator: profile.defaultSeparator,
        preview: '',
        files: state.files.map((file) => ({
          ...file,
          newName: undefined,
          mappedFields: {},
          status: 'ready' as const,
        })),
      };
    }

    case 'PROFILE_ENTITY_IMPORT': {
      const current = state.profileEntities[action.profileId] ?? [];
      return {
        ...state,
        profileEntities: {
          ...state.profileEntities,
          [action.profileId]: mergeProfileEntities(current, action.entities),
        },
      };
    }

    case 'PROFILE_ENTITY_REMOVE':
      return {
        ...state,
        profileEntities: {
          ...state.profileEntities,
          [action.profileId]: (state.profileEntities[action.profileId] ?? []).filter(
            (entity) => entity.id !== action.entityId,
          ),
        },
      };

    case 'SEPARATOR_SET':
      return { ...state, separator: action.separator };

    case 'RENAME_ALL_START':
      return { ...state, isRenaming: true };

    case 'RENAME_ALL_COMPLETE': {
      const resultMap = new Map(action.results.map((r) => [r.fileId, r]));
      const updatedFiles = state.files.map((f) => {
        const res = resultMap.get(f.id);
        if (!res) return f;
        return {
          ...f,
          newName: normalizeOutputName(res.newName),
          status: res.errors.length > 0 ? ('error' as const) : ('renamed' as const),
        };
      });
      return { ...state, isRenaming: false, files: updatedFiles };
    }

    case 'PREVIEW_UPDATE':
      return { ...state, preview: action.preview };

    case 'UPLOAD_START':
      return { ...state, isUploading: true };

    case 'UPLOAD_END':
      return { ...state, isUploading: false };

    case 'TOAST_SHOW':
      return { ...state, toastMsg: action.msg };

    case 'TOAST_CLEAR':
      return { ...state, toastMsg: null };

    case 'FILE_RENAME_OVERRIDE':
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.fileId
            ? { ...f, newName: normalizeOutputName(action.newName), status: 'renamed' as const }
            : f
        ),
      };

    // ------------------------------------------------------------------
    // Wave D-2 — search / filter / selection
    // ------------------------------------------------------------------

    case 'SEARCH_SET':
      return { ...state, ui: { ...state.ui, searchQuery: action.query } };

    case 'EXT_FILTER_SET':
      return { ...state, ui: { ...state.ui, extFilter: action.ext } };

    case 'FILE_SELECT_TOGGLE': {
      const already = state.ui.selectedIds.includes(action.fileId);
      const selectedIds = already
        ? state.ui.selectedIds.filter((id) => id !== action.fileId)
        : [...state.ui.selectedIds, action.fileId];
      // Auto-switch scope: if we now have a selection → selection; if empty → all
      const applyScope: 'selection' | 'all' = selectedIds.length > 0 ? 'selection' : 'all';
      return { ...state, ui: { ...state.ui, selectedIds, applyScope } };
    }

    case 'FILES_SELECT_ALL':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedIds: action.ids,
          applyScope: action.ids.length > 0 ? 'selection' : 'all',
        },
      };

    case 'FILES_DESELECT_ALL':
      return { ...state, ui: { ...state.ui, selectedIds: [], applyScope: 'all' } };

    // ------------------------------------------------------------------
    // Wave D-2 — replace text
    // ------------------------------------------------------------------

    case 'FILES_REPLACE_TEXT': {
      const { find, replace: replaceStr, caseSensitive, regex, fileIds } = action;
      if (!find) return state;
      const targetSet = new Set(fileIds);
      const updatedFiles = state.files.map((f) => {
        if (!targetSet.has(f.id)) return f;
        const source = f.newName ?? f.original;
        let result: string;
        try {
          if (regex) {
            const flags = caseSensitive ? 'g' : 'gi';
            const re = new RegExp(find, flags);
            result = source.replace(re, replaceStr);
          } else {
            if (caseSensitive) {
              result = source.split(find).join(replaceStr);
            } else {
              const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const re = new RegExp(escaped, 'gi');
              result = source.replace(re, replaceStr);
            }
          }
        } catch {
          // Invalid regex — skip file
          return f;
        }
        if (result === source) return f;
        return { ...f, newName: normalizeOutputName(result), status: 'renamed' as const };
      });
      return { ...state, files: updatedFiles };
    }

    // ------------------------------------------------------------------
    // Wave D-2 — batch update (prefix actions)
    // ------------------------------------------------------------------

    case 'FILES_REPLACE_BATCH': {
      const updateMap = new Map(action.updates.map((u) => [u.id, u]));
      const updatedFiles = state.files.map((f) => {
        const upd = updateMap.get(f.id);
        if (!upd) return f;
        return {
          ...f,
          ...(upd.cleanedBaseName !== undefined
            ? { cleanedBaseName: upd.cleanedBaseName }
            : {}),
          ...(upd.mappedFields !== undefined
            ? { mappedFields: upd.mappedFields }
            : {}),
          ...(upd.newName !== undefined
            ? { newName: normalizeOutputName(upd.newName), status: 'renamed' as const }
            : {}),
        };
      });
      return { ...state, files: updatedFiles };
    }

    // ------------------------------------------------------------------
    // Wave E-1 — file viewer
    // ------------------------------------------------------------------

    case 'PREVIEW_OPEN':
      return { ...state, ui: { ...state.ui, previewingFileId: action.fileId } };

    case 'PREVIEW_CLOSE':
      return { ...state, ui: { ...state.ui, previewingFileId: null } };

    // ------------------------------------------------------------------
    // Wave UI-1 — apply scope toggle
    // ------------------------------------------------------------------

    case 'APPLY_SCOPE_SET':
      return { ...state, ui: { ...state.ui, applyScope: action.scope } };

    // ------------------------------------------------------------------
    // Wave E-2 — hydrate persisted slices from localStorage
    // ------------------------------------------------------------------

    case 'STATE_HYDRATE': {
      const { slices } = action;
      return {
        ...state,
        ...(slices.profileId !== undefined ? { profileId: slices.profileId } : {}),
        ...(slices.profileEntities !== undefined ? { profileEntities: slices.profileEntities } : {}),
        ...(slices.separator !== undefined ? { separator: slices.separator } : {}),
        ...(slices.cleaner !== undefined ? { cleaner: slices.cleaner } : {}),
        ...(slices.prefixRules !== undefined ? { prefixRules: slices.prefixRules } : {}),
        fields: {
          ...state.fields,
          ...(slices.fields?.activeFieldIds !== undefined
            ? { activeFieldIds: slices.fields.activeFieldIds }
            : {}),
          ...(slices.fields?.values !== undefined
            ? { values: slices.fields.values }
            : {}),
        },
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
