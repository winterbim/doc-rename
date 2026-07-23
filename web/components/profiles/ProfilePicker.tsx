'use client';

import { useRef } from 'react';
import {
  BIM_ONLY,
  PROFILE_OPTIONS,
  getIndustryProfile,
  type IndustryProfileId,
} from '@/lib/profiles';
import { useAppContext } from '@/lib/app-state';
import { ProfileIcon } from './profile-icons';

export function ProfilePicker() {
  const { state, dispatch } = useAppContext();
  const profile = getIndustryProfile(state.profileId);
  const bubbleRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleProfileChange(profileId: IndustryProfileId) {
    if (profileId === state.profileId) return;
    dispatch({ type: 'PROFILE_CHANGE', profileId });
    dispatch({
      type: 'TOAST_SHOW',
      msg: `Profil ${getIndustryProfile(profileId).label} actif`,
    });
  }

  // Roving-focus keyboard nav across the bubbles (radiogroup pattern).
  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const count = PROFILE_OPTIONS.length;
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % count;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    handleProfileChange(PROFILE_OPTIONS[next].id);
    bubbleRefs.current[next]?.focus();
  }

  // In V1 BIM-only we collapse the picker to a static badge — no bubble
  // noise when there's a single legal option.
  const showStatic = BIM_ONLY || PROFILE_OPTIONS.length <= 1;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 dark:bg-paper-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
          Profil métier
        </span>
        <span className="rounded-full border border-olive/30 bg-olive/10 px-2 py-0.5 text-[10px] font-medium text-olive">
          Actif
        </span>
      </div>

      {showStatic ? (
        <div
          className="flex items-center gap-2 rounded-md border border-line bg-paper-2/50 px-2.5 py-1.5"
          aria-live="polite"
        >
          <span className="font-sans text-xs font-semibold text-ink">{profile.label}</span>
          <span className="rounded-full bg-brick/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brick-deep">
            V1
          </span>
        </div>
      ) : (
        <>
          <div
            role="radiogroup"
            aria-label="Profil métier"
            className="flex flex-wrap gap-2 pt-0.5"
          >
            {PROFILE_OPTIONS.map((option, index) => {
              const selected = option.id === state.profileId;
              return (
                <button
                  key={option.id}
                  ref={(el) => {
                    bubbleRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option.label}
                  title={option.label}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => handleProfileChange(option.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className="group relative rounded-full focus:outline-none focus-visible:outline-none"
                >
                  {/* Colored disc lives on a <span>, not the <button>, so the
                      global dark-mode `button { background:… !important }` rule
                      in globals.css can't wipe the selected state. */}
                  <span
                    className={[
                      'flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-150',
                      'group-focus-visible:ring-2 group-focus-visible:ring-brick group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-surface dark:group-focus-visible:ring-offset-paper-2',
                      selected
                        ? 'scale-105 border-brick bg-brick text-white shadow-md dark:text-paper'
                        : 'border-line bg-paper-2 text-ink-soft group-hover:-translate-y-0.5 group-hover:border-brick group-hover:text-ink dark:bg-paper',
                    ].join(' ')}
                  >
                    <ProfileIcon id={option.id} className="h-5 w-5" />
                  </span>

                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-surface opacity-0 shadow-md transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="mt-0.5 flex items-center gap-2 rounded-md border border-brick/20 bg-brick/5 px-2.5 py-1.5"
            aria-live="polite"
          >
            <span className="h-2 w-2 flex-none rounded-full bg-brick" />
            <span className="font-sans text-xs font-semibold text-ink">{profile.label}</span>
          </div>
        </>
      )}

      <p className="text-[11px] leading-snug text-ink-mute">{profile.description}</p>
    </div>
  );
}
