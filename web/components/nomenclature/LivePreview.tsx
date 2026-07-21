'use client';

import { useEffect } from 'react';
import { useAppContext } from '@/lib/app-state';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { generatePreview } from '@/lib/rename-engine/nomenclature';
import { getActiveFieldsForProfile, normalizeFieldValuesForGeneration } from '@/lib/profiles';

export function LivePreview() {
  const { state, dispatch } = useAppContext();
  const { fields, separator, files } = state;

  // Build the context key for debouncing — stringify relevant parts
  const contextKey = JSON.stringify({
    activeFields: fields.activeFieldIds,
    values: fields.values,
    separator,
    workLotPart: fields.workLotPart,
    profileId: state.profileId,
    entities: state.profileEntities[state.profileId]?.length ?? 0,
  });

  const debouncedKey = useDebounce(contextKey, 150);

  // Compute extension hint from first file or default PDF
  const extensionHint =
    files.length > 0 ? files[0].extension.toUpperCase() || '.PDF' : '.PDF';

  useEffect(() => {
    const ctx = {
      activeFields: getActiveFieldsForProfile(
        fields,
        state.profileId,
        state.profileEntities[state.profileId] ?? [],
      ),
      fieldValues: normalizeFieldValuesForGeneration(fields.values, state.profileId, separator),
      separator,
      workLotPart: fields.workLotPart ?? undefined,
    };
    const preview = generatePreview(ctx, extensionHint);
    dispatch({ type: 'PREVIEW_UPDATE', preview });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKey, extensionHint]);

  const preview = state.preview || 'NOM_FICHIER.PDF';

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
        Aperçu
      </p>
      <div
        className="rounded-md border border-line bg-surface px-2.5 py-1.5 dark:bg-paper-2"
        aria-live="polite"
        aria-label={`Aperçu du nom de fichier: ${preview}`}
      >
        <code className="font-mono text-xs text-ink block truncate">{preview}</code>
      </div>
    </div>
  );
}
