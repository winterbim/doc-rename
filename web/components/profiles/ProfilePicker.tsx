'use client';

import {
  BIM_ONLY,
  PROFILE_OPTIONS,
  getIndustryProfile,
  type IndustryProfileId,
} from '@/lib/profiles';
import { useAppContext } from '@/lib/app-state';

export function ProfilePicker() {
  const { state, dispatch } = useAppContext();
  const profile = getIndustryProfile(state.profileId);

  function handleProfileChange(profileId: IndustryProfileId) {
    if (profileId === state.profileId) return;
    dispatch({ type: 'PROFILE_CHANGE', profileId });
    dispatch({
      type: 'TOAST_SHOW',
      msg: `Profil ${getIndustryProfile(profileId).label} actif`,
    });
  }

  // In V1 BIM-only we collapse the picker to a static badge — no dropdown
  // noise when there's a single legal option.
  const showStatic = BIM_ONLY || PROFILE_OPTIONS.length <= 1;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-white p-3 dark:bg-paper-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          {showStatic ? (
            <span className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
              Profil metier
            </span>
          ) : (
            <label
              htmlFor="industry-profile"
              className="text-[11px] font-medium text-ink-mute uppercase tracking-wide"
            >
              Profil metier
            </label>
          )}
          <span className="rounded-full border border-olive/30 bg-olive/10 px-2 py-0.5 text-[10px] font-medium text-olive">
            Actif
          </span>
        </div>

        {showStatic ? (
          <div
            className="flex items-center gap-2 rounded-md border border-line bg-paper-2/50 px-2.5 py-1.5"
            aria-live="polite"
          >
            <span className="font-sans text-xs font-semibold text-ink">
              {profile.label}
            </span>
            <span className="rounded-full bg-brick/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brick-deep">
              V1
            </span>
          </div>
        ) : (
          <select
            id="industry-profile"
            value={state.profileId}
            onChange={(event) => handleProfileChange(event.target.value as IndustryProfileId)}
            className="w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick dark:bg-paper-2"
          >
            {PROFILE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <p className="text-[11px] leading-snug text-ink-mute">{profile.description}</p>
      </div>
    </div>
  );
}
