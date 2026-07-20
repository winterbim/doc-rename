# Changelog

All notable changes to the BIMCHECK-Rename web app are documented here.

Format: [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning 2.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- In-app Free quota badge and Pro upgrade CTA in the renaming toolbar.
- Landing ROI section showing the economic case for Pro/Team from one BIM delivery lot.
- Paid 149 CHF pilot offer on the landing page, `/pilot`, and pilot mailto flow.

### Changed

- Free plan now enforces the documented 3 rename lots/day limit in the public app.
- No-backend monetization docs now include `NEXT_PUBLIC_DOC_RENAME_PLAN` for manually provisioned Pro/Team access.
- Pilot conversion path now supports manual same-day payment when Stripe Payment Links are not configured.

## [0.2.0] — 2026-06-08

### Added

- `ARCHITECTURE.md` documenting layout, state, persistence, security, viewers, tests, CI, deploy, versioning.
- `CHANGELOG.md` (this file).
- `/pilot` commercial pilot page for 14-day BIM trials, with a mailto-only request form and no backend storage.
- In-app BIM demo lot loader so prospects can test the renaming flow without preparing customer files.
- ISO 19650 checklist before CDE deposit on `/iso-19650`.
- French and Swiss BIM company catalog expanded to 201 organizations.
- End-to-end user journey covering demo loading, convention entry, renaming, and ZIP download.

### Changed

- Public wording aligned on **BIMCHECK-Rename** instead of the old DOC-RENAME label on visible pages and access screens.
- BIM V1 microcopy polished: French labels, upload/import errors, model/template wording, separators, and profile names.
- Nomenclature import now reports errors through the app toast system instead of a browser `alert()`.
- E2E tests updated for the current BIMCHECK-Rename branding and deterministic upload input selection.
- Product marketing context recentered on a BIM-only V1 offer and pilot-based conversion path.
- `/privacy` updated for the SaaS migration: Free / Pro / Team terms, RGPD/CNIL transparency, account/billing/support data categories, local-first file processing, optional telemetry, security limits, and user responsibilities.
- `ARCHITECTURE.md` privacy/security section updated to reflect optional Sentry/PostHog observability while preserving the no-file-content telemetry rule.
- Searchable company and document-type fields replace impractical long native selects.
- Imported BIM companies are merged into the built-in catalog and become immediately selectable.
- All public contact and security links now use `bimcheck-consulting@proton.me`.

### Security

- Production dependency audit fixed by overriding Next's transitive `postcss` to `8.5.15` without using `npm audit fix --force`.
- Untrusted `.docx` (mammoth) and `.xlsx` (SheetJS) HTML is now sanitized with DOMPurify before rendering, closing two stored-XSS vectors in the document viewers (`lib/sanitize-html.ts`).

### Fixed

- Real keyboard focus trap in the name-editor and image-lightbox dialogs: `Tab` / `Shift+Tab` are now confined inside the modal instead of only setting initial focus (`lib/hooks/useFocusTrap.ts`).

### Removed

- Dead duplicate `usePrefetchViewers` hook (superseded by `lib/viewer-prefetch.ts`).

## [0.1.0] — 2026-05-14

Initial public deployment at <https://doc-rename-saas.vercel.app>.

### Added

- **Routes**: `/` (static landing), `/app` (renamer), `/privacy`, `/manifest.webmanifest`.
- **BIM logic** ported to pure TypeScript under `lib/rename-engine/`:
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

- **Remote CI**: tsc + tests + build on every push and PR.
- **Pre-commit hook**: `npx tsc --noEmit` before every commit (`web/scripts/install-hooks.sh`).
- **Property-based fuzz tests** (`fast-check`) covering 8 public BIM functions: `normalizeBIM` (total + idempotent + uppercase-invariant), `validateFilename`, `parseFilename` (reconstruction invariant), `clean` (idempotent), 4 detection helpers — ~8 000 random inputs per CI run, all proven total (zero throws).
- **Vitest coverage** with v8 provider, thresholds floor-set at current actual values (regression gate, not fiction).
- **localStorage schema versioning** (`SCHEMA_VERSION = 1`): future data fails closed, legacy data is migrated and re-stamped, migration chain is idempotent.

### Truthfulness

- Landing audited for false claims. Corrected: doc-type counts (213 → 232, 15 → 14 groups), "auto-detection of discipline/level/zone/entreprise/type" downgraded to "categorization by type" (only `detectCategory` is actually wired into upload), JSON template export/import promise made real by adding UI buttons.

### Tests

- **522 passing** (Vitest unit + property-based fuzz + viewer-cache + persistence-schema + upload-guard).
