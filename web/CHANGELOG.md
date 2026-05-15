# Changelog

All notable changes to the DOC-RENAME web app are documented here.

Format: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `ARCHITECTURE.md` documenting layout, state, persistence, security, viewers, tests, CI, deploy, versioning.
- `CHANGELOG.md` (this file).

## [0.1.0] — 2026-05-14

Initial public deployment at <https://bimdoc-renamer.vercel.app>.

### Added

- **Routes**: `/` (static landing), `/app` (renamer), `/privacy`, `/manifest.webmanifest`.
- **BIM logic** ported to pure TypeScript under `lib/bim/`:
  - 41 work lots, 84 companies, 232 document types in 14 groups, 3 default templates (SIA / ISO 19650 / BIM France).
  - `prefixes`, `nomenclature` (with cache), `filename-cleaner` (121 spelling rules + 36 default words), `fields` (17 definitions), `detection` (5 helpers), `zip-io`.
- **React UI**: drag-and-drop field reordering (`@dnd-kit/sortable`), name editor modal with segment drag-drop, simple replace panel, prefix actions panel (remove / replace / map), search + extension filter, selection toggle (`Sélection (N)` / `Tous`), template picker, separator picker, live preview.
- **File viewers** (lazy-loaded): PDF (`react-pdf`), DOCX (`mammoth`), XLSX / XLS / CSV / TSV / ODS (`xlsx` SheetJS), DXF (`dxf-parser` → SVG), images (lightbox with zoom + pan), text (TXT / JSON / XML). Honest "Aperçu non disponible" fallback for RVT / DWG / IFC / PPTX / etc.
- **Theme**: light / dark / system via `data-theme` attribute.
- **Template export / import** in JSON (`exportFieldsState` / `importFieldsState`) wired to UI buttons in `NomenclatureBuilder`.
- **localStorage persistence**: active fields, values, separator, cleaner state, prefix rules, theme.

### Security

- `next.config.ts` `headers()`: HSTS preload, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy lock-down, Content-Security-Policy (`worker-src 'self' blob:`, `frame-ancestors 'none'`, `connect-src 'self'`).
- **Upload boundary sanitization** (`lib/upload-guard.ts`): 100 MiB per file, 1 GiB batch, filename hygiene (control chars + traversal + length), ZIP magic-bytes verification.
- **React `ErrorBoundary`** with privacy-preserving local error log (last 50 entries in `localStorage`, download / clear buttons, **no external transmission**).

### Performance

- Memory-bounded **LRU viewer caches** with `onEvict` URL revocation: objectURL 200, docx 30, xlsx 20, dxf 50, text 100.
- Library prefetch via `requestIdleCallback` on file add (react-pdf, mammoth, xlsx, dxf-parser).
- Lazy XLSX sheet rendering (only active sheet parsed up front, others on tab click).
- PDF.js worker prefetched via `<link rel="prefetch">`.

### Quality

- **GitHub Actions CI**: tsc + tests + build on every push and PR.
- **Pre-commit hook**: `npx tsc --noEmit` before every commit (`web/scripts/install-hooks.sh`).
- **Property-based fuzz tests** (`fast-check`) covering 8 public BIM functions: `normalizeBIM` (total + idempotent + uppercase-invariant), `validateFilename`, `parseFilename` (reconstruction invariant), `clean` (idempotent), 4 detection helpers — ~8 000 random inputs per CI run, all proven total (zero throws).
- **Vitest coverage** with v8 provider, thresholds floor-set at current actual values (regression gate, not fiction).
- **localStorage schema versioning** (`SCHEMA_VERSION = 1`): future data fails closed, legacy data is migrated and re-stamped, migration chain is idempotent.

### Truthfulness

- Landing audited for false claims. Corrected: doc-type counts (213 → 232, 15 → 14 groups), "auto-detection of discipline/level/zone/entreprise/type" downgraded to "categorization by type" (only `detectCategory` is actually wired into upload), JSON template export/import promise made real by adding UI buttons.

### Tests

- **522 passing** (Vitest unit + property-based fuzz + viewer-cache + persistence-schema + upload-guard).
