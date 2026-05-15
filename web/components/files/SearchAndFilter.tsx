'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/app-state';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getDistinctExtensions } from '@/lib/file-filters';

export function SearchAndFilter() {
  const { state, dispatch } = useAppContext();
  const [inputValue, setInputValue] = useState('');
  const debouncedQuery = useDebounce(inputValue, 150);

  // Keep state in sync with debounced value
  useEffect(() => {
    dispatch({ type: 'SEARCH_SET', query: debouncedQuery });
  }, [debouncedQuery, dispatch]);

  const extensions = getDistinctExtensions(state.files);
  const currentExt = state.ui.extFilter;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <label htmlFor="file-search" className="sr-only">
          Rechercher dans les fichiers
        </label>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-ink-mute"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z"
            />
          </svg>
        </span>
        <input
          id="file-search"
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Rechercher dans les noms…"
          className="w-full rounded-md border border-line bg-white py-1.5 pl-8 pr-3 text-sm text-ink placeholder-ink-mute focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition"
        />
      </div>

      {/* Extension filter */}
      {extensions.length > 0 && (
        <div className="shrink-0">
          <label htmlFor="ext-filter" className="sr-only">
            Filtrer par extension
          </label>
          <select
            id="ext-filter"
            value={currentExt}
            onChange={(e) =>
              dispatch({ type: 'EXT_FILTER_SET', ext: e.target.value })
            }
            className="rounded-md border border-line bg-white py-1.5 pl-2.5 pr-7 text-sm text-ink focus:border-brick focus:outline-none focus:ring-2 focus:ring-brick/20 transition"
          >
            <option value="">Tout</option>
            {extensions.map((ext) => (
              <option key={ext} value={ext}>
                {ext}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
