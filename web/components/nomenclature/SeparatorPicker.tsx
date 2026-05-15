'use client';

import { useAppContext } from '@/lib/app-state';

const SEPARATORS = [
  { value: '_', label: '_ Underscore' },
  { value: '-', label: '- Tiret' },
  { value: '.', label: '. Point' },
];

export function SeparatorPicker() {
  const { state, dispatch } = useAppContext();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="separator-picker" className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
        Séparateur
      </label>
      <select
        id="separator-picker"
        value={state.separator}
        onChange={(e) => dispatch({ type: 'SEPARATOR_SET', separator: e.target.value })}
        className="w-full rounded-md border border-line bg-white dark:bg-paper-2 text-ink px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick"
      >
        {SEPARATORS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
