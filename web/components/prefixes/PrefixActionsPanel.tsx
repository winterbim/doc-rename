'use client';

import { useMemo, useState } from 'react';
import { useAppContext } from '@/lib/app-state';
import { detectPrefixes, applyPrefixActionBatch } from '@/lib/rename-engine/prefixes';
import type { DetectedPrefix } from '@/lib/rename-engine/types';
import { getProfileFieldDefinitions } from '@/lib/profiles';
import type { FieldDefinition } from '@/lib/rename-engine/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReplaceFormState {
  newPrefix: string;
}

interface MapFormState {
  /** token → fieldId */
  assignments: Array<{ token: string; fieldId: string }>;
}

type InlineMode =
  | { kind: 'replace'; data: ReplaceFormState }
  | { kind: 'map'; data: MapFormState }
  | null;

interface PrefixRowProps {
  detected: DetectedPrefix;
  mappableFields: FieldDefinition[];
  onRemove: () => void;
  onReplace: (newPrefix: string) => void;
  onMap: (assignments: Array<{ token: string; fieldId: string }>) => void;
}

// ---------------------------------------------------------------------------
// PrefixRow
// ---------------------------------------------------------------------------

function PrefixRow({ detected, mappableFields, onRemove, onReplace, onMap }: PrefixRowProps) {
  const [inline, setInline] = useState<InlineMode>(null);

  // Tokenise the prefix (e.g. "H3_ARC_" → ["H3", "ARC"])
  const tokens = detected.prefix
    .replace(/_$/, '')
    .split('_')
    .filter(Boolean);

  const handleOpenReplace = () => {
    setInline({ kind: 'replace', data: { newPrefix: '' } });
  };

  const handleOpenMap = () => {
    setInline({
      kind: 'map',
      data: {
        assignments: tokens.map((token) => ({ token, fieldId: '' })),
      },
    });
  };

  const handleClose = () => setInline(null);

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inline?.kind !== 'replace') return;
    onReplace(inline.data.newPrefix);
    setInline(null);
  };

  const handleMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inline?.kind !== 'map') return;
    onMap(inline.data.assignments);
    setInline(null);
  };

  return (
    <div className="rounded-lg border border-line bg-paper-2/30 p-3">
      {/* Row header */}
      <div className="flex items-center gap-2 flex-wrap">
        <code className="flex-1 font-mono text-xs font-semibold text-brick truncate">
          {detected.prefix}
        </code>
        <span className="shrink-0 text-xs text-ink-mute">
          ({detected.count} fichier{detected.count !== 1 ? 's' : ''})
        </span>
        {/* Action buttons */}
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onRemove}
            className="rounded px-2 py-0.5 text-xs font-medium text-brick-deep hover:bg-brick/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
          >
            Supprimer
          </button>
          <button
            type="button"
            onClick={handleOpenReplace}
            className={`rounded px-2 py-0.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick ${
              inline?.kind === 'replace'
                ? 'bg-gold/20 text-brick-deep'
                : 'text-brick hover:bg-paper-2'
            }`}
          >
            Remplacer
          </button>
          <button
            type="button"
            onClick={handleOpenMap}
            className={`rounded px-2 py-0.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick ${
              inline?.kind === 'map'
                ? 'bg-gold/20 text-brick-deep'
                : 'text-brick hover:bg-paper-2'
            }`}
          >
            Mapper
          </button>
        </div>
      </div>

      {/* Inline replace form */}
      {inline?.kind === 'replace' && (
        <form
          onSubmit={handleReplaceSubmit}
          className="mt-2 flex items-center gap-2"
          aria-label={`Remplacer le préfixe ${detected.prefix}`}
        >
          <label htmlFor={`new-prefix-${detected.prefix}`} className="sr-only">
            Nouveau préfixe
          </label>
          <input
            id={`new-prefix-${detected.prefix}`}
            type="text"
            value={inline.data.newPrefix}
            onChange={(e) =>
              setInline({
                kind: 'replace',
                data: { newPrefix: e.target.value },
              })
            }
            placeholder="Nouveau préfixe…"
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-line bg-surface text-ink px-2 py-1 text-xs focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition dark:bg-paper-2"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ink px-2 py-1 text-xs font-sans font-medium text-paper hover:bg-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
          >
            OK
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded px-2 py-1 text-xs text-ink-mute hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line transition"
          >
            Annuler
          </button>
        </form>
      )}

      {/* Inline map form */}
      {inline?.kind === 'map' && (
        <form
          onSubmit={handleMapSubmit}
          className="mt-2 flex flex-col gap-1.5"
          aria-label={`Mapper les tokens du préfixe ${detected.prefix}`}
        >
          {inline.data.assignments.map((assignment, idx) => (
            <div key={assignment.token} className="flex items-center gap-2">
              <code className="w-16 shrink-0 font-mono text-xs font-semibold text-ink truncate">
                {assignment.token}
              </code>
              <label
                htmlFor={`map-field-${detected.prefix}-${idx}`}
                className="sr-only"
              >
                Champ pour {assignment.token}
              </label>
              <select
                id={`map-field-${detected.prefix}-${idx}`}
                value={assignment.fieldId}
                onChange={(e) => {
                  if (inline.kind !== 'map') return;
                  const updated = inline.data.assignments.map((a, i) =>
                    i === idx ? { ...a, fieldId: e.target.value } : a
                  );
                  setInline({ kind: 'map', data: { assignments: updated } });
                }}
                className="flex-1 rounded-md border border-line bg-surface text-ink py-1 pl-2 pr-6 text-xs focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition dark:bg-paper-2"
              >
                <option value="">— Champ —</option>
                {mappableFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="rounded-full bg-ink px-2.5 py-1 text-xs font-sans font-medium text-paper hover:bg-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition"
            >
              Appliquer le mapping
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded px-2.5 py-1 text-xs text-ink-mute hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PrefixActionsPanel
// ---------------------------------------------------------------------------

export function PrefixActionsPanel() {
  const { state, dispatch } = useAppContext();
  const detected = useMemo(() => detectPrefixes(state.files), [state.files]);
  const mappableFields = getProfileFieldDefinitions(
    state.profileId,
    state.profileEntities[state.profileId] ?? [],
  ).filter((field) => field.id !== 'filename');

  if (detected.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-[10px] font-sans font-medium uppercase tracking-[0.15em] text-ink-mute mb-2.5">
          Préfixes détectés
        </h2>
        <p className="font-sans text-sm text-ink-mute">
          {state.files.length === 0
            ? 'Ajoutez des fichiers pour détecter les préfixes.'
            : 'Aucun préfixe commun détecté (≥ 3 fichiers).'}
        </p>
      </div>
    );
  }

  const handleRemove = (prefix: string) => {
    const updatedFiles = applyPrefixActionBatch(state.files, {
      prefix,
      action: 'remove',
    });
    const updates = updatedFiles
      .filter((f, i) => {
        const orig = state.files[i];
        return (
          f.cleanedBaseName !== orig.cleanedBaseName ||
          JSON.stringify(f.mappedFields) !== JSON.stringify(orig.mappedFields)
        );
      })
      .map((f) => ({
        id: f.id,
        cleanedBaseName: f.cleanedBaseName,
        mappedFields: f.mappedFields,
      }));
    dispatch({ type: 'FILES_REPLACE_BATCH', updates });
  };

  const handleReplace = (prefix: string, newPrefix: string) => {
    const updatedFiles = applyPrefixActionBatch(state.files, {
      prefix,
      action: 'replace',
      params: { newPrefix },
    });
    const updates = updatedFiles
      .filter((f, i) => {
        const orig = state.files[i];
        return f.cleanedBaseName !== orig.cleanedBaseName;
      })
      .map((f) => ({
        id: f.id,
        cleanedBaseName: f.cleanedBaseName,
        mappedFields: f.mappedFields,
      }));
    dispatch({ type: 'FILES_REPLACE_BATCH', updates });
  };

  const handleMap = (
    prefix: string,
    assignments: Array<{ token: string; fieldId: string }>
  ) => {
    const mapEntries = assignments
      .filter((a) => a.fieldId)
      .map((a) => ({ field: a.fieldId, value: a.token }));

    const updatedFiles = applyPrefixActionBatch(state.files, {
      prefix,
      action: 'map',
      params: { map: mapEntries },
    });

    const updates = updatedFiles
      .filter((f, i) => {
        const orig = state.files[i];
        return (
          f.cleanedBaseName !== orig.cleanedBaseName ||
          JSON.stringify(f.mappedFields) !== JSON.stringify(orig.mappedFields)
        );
      })
      .map((f) => ({
        id: f.id,
        cleanedBaseName: f.cleanedBaseName,
        mappedFields: f.mappedFields,
      }));
    dispatch({ type: 'FILES_REPLACE_BATCH', updates });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-mute border-l-2 border-gold pl-3">
        Préfixes détectés
      </h2>
      <div className="flex flex-col gap-2">
        {detected.map((dp) => (
          <PrefixRow
            key={dp.prefix}
            detected={dp}
            mappableFields={mappableFields}
            onRemove={() => handleRemove(dp.prefix)}
            onReplace={(newPrefix) => handleReplace(dp.prefix, newPrefix)}
            onMap={(assignments) => handleMap(dp.prefix, assignments)}
          />
        ))}
      </div>
    </div>
  );
}
