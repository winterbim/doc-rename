# Changelog

## 2.1.1 — 2026-04-24

### Performance
- Nomenclature generation is memoized per file; filter and search no longer re-compute names (Task 1, 2).
- Files list now renders lazily via IntersectionObserver: only visible rows are populated, keeping 1000-file lists fluid (Task 4).
- Row button clicks use event delegation on `#filesList`; listener count drops from ~4000 to a handful regardless of file count (Task 5).
- Search and extension-filter inputs are debounced (150 ms); keystrokes stay smooth even at 1000 files (Task 3).

No UI, workflow, or feature changes. All v2.1 functionality preserved.
