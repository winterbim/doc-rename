'use client';

import { useState } from 'react';
import { getIndustryProfile, importEntitiesFromText } from '@/lib/profiles';
import { useAppContext } from '@/lib/app-state';

export function EntityImportPanel() {
  const { state, dispatch } = useAppContext();
  const [text, setText] = useState('');
  const profile = getIndustryProfile(state.profileId);
  const entities = state.profileEntities[state.profileId] ?? [];

  function handleImport() {
    const imported = importEntitiesFromText(text, state.profileId);
    if (imported.length === 0) return;
    dispatch({ type: 'PROFILE_ENTITY_IMPORT', profileId: state.profileId, entities: imported });
    setText('');
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-white p-3 dark:bg-paper-2">
      <label htmlFor="profile-entities" className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
        {profile.entityImportLabel}
      </label>
      <textarea
        id="profile-entities"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Une entree par ligne, ou coller depuis Excel"
        rows={3}
        className="w-full resize-y rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick dark:bg-paper-2"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-ink-mute">{entities.length} entite(s) dans ce profil</span>
        <button
          type="button"
          onClick={handleImport}
          disabled={!text.trim()}
          className="rounded-md border border-line bg-white px-2 py-1 text-[11px] text-ink-soft transition-colors hover:border-brick hover:text-brick disabled:cursor-not-allowed disabled:opacity-50"
        >
          Importer
        </button>
      </div>

      {entities.length > 0 && (
        <div className="flex max-h-24 flex-wrap gap-1 overflow-auto">
          {entities.slice(0, 24).map((entity) => (
            <span
              key={entity.id}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-1.5 py-0.5 text-[10px] text-ink-soft"
              title={entity.label}
            >
              {entity.code}
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'PROFILE_ENTITY_REMOVE',
                    profileId: state.profileId,
                    entityId: entity.id,
                  })
                }
                aria-label={`Supprimer ${entity.code}`}
                className="text-ink-mute hover:text-brick"
              >
                x
              </button>
            </span>
          ))}
          {entities.length > 24 && (
            <span className="text-[10px] text-ink-mute">+{entities.length - 24}</span>
          )}
        </div>
      )}
    </div>
  );
}
