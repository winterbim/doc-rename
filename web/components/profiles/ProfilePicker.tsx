'use client';

import { useMemo, useState } from 'react';
import { PROFILE_OPTIONS, getIndustryProfile, type IndustryProfileId } from '@/lib/profiles';
import { useAppContext } from '@/lib/app-state';

export function ProfilePicker() {
  const { state, dispatch } = useAppContext();
  const [pendingProfileId, setPendingProfileId] = useState<IndustryProfileId | null>(null);
  const profile = getIndustryProfile(state.profileId);
  const hasWorkInProgress = useMemo(
    () => state.files.length > 0 || Object.values(state.fields.values).some(Boolean),
    [state.files.length, state.fields.values],
  );

  function requestProfileChange(profileId: IndustryProfileId) {
    if (profileId === state.profileId) return;
    if (hasWorkInProgress) {
      setPendingProfileId(profileId);
      return;
    }
    dispatch({ type: 'PROFILE_CHANGE', profileId });
  }

  function confirmChange() {
    if (!pendingProfileId) return;
    dispatch({ type: 'PROFILE_CHANGE', profileId: pendingProfileId });
    setPendingProfileId(null);
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-white p-3 dark:bg-paper-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="industry-profile" className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
          Profil metier
        </label>
        <select
          id="industry-profile"
          value={state.profileId}
          onChange={(event) => requestProfileChange(event.target.value as IndustryProfileId)}
          className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick dark:bg-paper-2"
        >
          {PROFILE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-[11px] leading-snug text-ink-mute">{profile.description}</p>
      </div>

      {pendingProfileId && (
        <div className="rounded-md border border-brick/30 bg-brick/5 p-2 text-[11px] text-ink-soft">
          <p>
            Changer de profil metier peut remplacer les champs et suggestions actuellement affiches.
            Les fichiers importes seront conserves.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={confirmChange}
              className="rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-paper"
            >
              Changer de profil
            </button>
            <button
              type="button"
              onClick={() => setPendingProfileId(null)}
              className="rounded-md border border-line bg-white px-2 py-1 text-[11px] text-ink-soft"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
