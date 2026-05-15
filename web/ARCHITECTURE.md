# DOC-RENAME — Architecture

This document is the contract: how the app is laid out, what the guarantees
are, and where to look when something breaks. It must stay accurate. If a
commit changes any of these properties, the commit must update this file.

## 1. Surfaces

| Path | Build | Purpose |
|---|---|---|
| `/` | Server Component | Marketing landing (vanilla HTML/CSS ported to JSX) |
| `/app` | Client Component (`'use client'`, `dynamic ssr:false`) | The renamer |
| `/privacy` | Server Component | Privacy policy |
| `/manifest.webmanifest` | static | PWA manifest |

Single Vercel project `bimdoc-renamer`, `rootDirectory=web`, `framework=nextjs`,
auto-deploy on push to `main`.

## 2. State model

One `useReducer` in `app/app/page.tsx`, propagated through `AppContext`. Slices:

| Slice | Type | Persisted? |
|---|---|---|
| `files` | `BimFile[]` | NO (transient) |
| `fields` | `FieldsState` (activeFieldIds + values) | YES |
| `separator` | `string` | YES |
| `cleaner` | `CleanerState` | YES |
| `prefixRules` | `PrefixRule[]` | YES |
| `ui.theme` | `'light' \| 'dark' \| 'system'` | YES |
| `ui.{searchQuery, extFilter, selectedIds, previewingFileId, applyScope}` | misc | NO |
| `isUploading`, `isRenaming`, `preview`, `toastMsg` | transient | NO |

Reducer is **pure**; side effects (URL revocation, persistence writes) live in
hooks that observe state changes.

## 3. Pure logic boundary — `lib/bim/`

This directory contains **zero React, zero DOM, zero Supabase, zero
localStorage** imports. It mirrors `extension/js/{prefixes, nomenclature,
filename-cleaner, fields, config, detection}.js` 1:1. Every public function
is total under `fast-check` property-based fuzzing — verified by
`lib/bim/__tests__/fuzz.test.ts`.

Coverage is enforced at the CI level (`vitest --coverage` v8 provider):
lines ≥ 80, statements ≥ 80, functions ≥ 80, branches ≥ 75. Current actual
floor is significantly higher — those thresholds are the regression gate.

Modules:

- `logger.ts` — severity-leveled console wrapper
- `config/{workLots, companies, documentTypes, extensions, phases, defaults, detectionPatterns}` — pure data (41 lots, 84 companies, 232 doc types, 14 groups)
- `prefixes.ts` — `detectPrefixes()`, `applyPrefixAction()`, batch variants
- `nomenclature.ts` — `generate()`, `normalizeBIM()`, `validateFilename()`, `parseFilename()`, `batchGenerate()`, `NomenclatureCache`
- `filename-cleaner.ts` — `createDefaultState()`, `clean()`, `cleanAll()`, immutable rule manipulators, `exportState()` / `importState()`
- `fields.ts` — `FIELD_DEFINITIONS` (17), `FieldsState`, manipulators, `loadTemplate()`, `exportFieldsState()` / `importFieldsState()`
- `detection.ts` — `detectCategory()`, `detectDocumentType()`, `detectCompanyInName()`, `detectLotFromPath()`, `detectDocTypeCode()`
- `zip-io.ts` — `readZip()`, `writeZip()`, `isZip()` (thin JSZip wrapper)

## 4. Persistence

`lib/persistence.ts`:

- Keys mirror the extension's `STORAGE_KEYS` (prefix `bimcheck_rename_`)
- **Schema version sentinel** at `STORAGE_KEYS.SCHEMA_VERSION`. Current: `SCHEMA_VERSION = 1`. Stamped on every write.
- `loadPersistedState()` flow:
  1. If sentinel > `SCHEMA_VERSION` → **fail closed**, return `{}` (defaults apply)
  2. If sentinel < current or missing → run `migrateSchema()` (idempotent)
  3. Read each slice, validate shape, skip the corrupt ones
- `persistState()` is debounced 500 ms via `setTimeout`.
- All access wrapped in `try/catch`; SSR-safe (`globalThis.localStorage?.`).

## 5. Security

### HTTP layer (`web/next.config.ts`)

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: same-origin-only baseline. Allows `unsafe-inline` style (Tailwind), `unsafe-eval` script (Next runtime + react-pdf), `worker-src blob:` (PDF.js), `img-src https: data: blob:` (object URLs). `frame-ancestors 'none'`. `connect-src 'self'`.
- `Cache-Control: immutable` on `/pdf.worker.min.mjs`.

### Upload boundary (`web/lib/upload-guard.ts`)

Every file passes through:
- `checkFilename`: control chars (< 0x20 except whitespace), `..` traversal, ≤255 chars
- `checkSize`: 100 MiB per file
- `checkBatchSize`: 1 GiB total per drop
- `checkZipMagic`: `PK\x03\x04`, `\x05\x06`, or `\x07\x08`

20 unit tests in `lib/__tests__/upload-guard.test.ts`.

### React layer (`web/components/ErrorBoundary.tsx`)

Catches React render errors + `window.onerror` + `unhandledrejection`. Stores
the last 50 entries in `localStorage` (key `bimdoc_error_log`). **No external
transmission.** Fallback UI offers "Recharger" + "Télécharger le journal" so
the user can send it manually.

### Privacy

Files never leave the browser. All processing — extraction, parsing,
rendering, ZIP composition — happens in JS / Wasm in the user's tab. No
analytics, no fetch beyond same-origin assets.

## 6. Viewer caches (`web/lib/viewer-cache.ts`)

Memory-bounded LRU per cache type. `onEvict` callback fires on capacity
overflow + delete + clear, ensuring `URL.revokeObjectURL` is called on every
object URL eviction.

| Cache | Capacity | Eviction action |
|---|---|---|
| `objectUrl` | 200 | `URL.revokeObjectURL(value)` |
| `docx` | 30 | none (string GC) |
| `spreadsheet` | 20 | none |
| `dxfSvg` | 50 | none |
| `text` | 100 | none |

Tested in `lib/__tests__/viewer-cache.test.ts` (30 tests including eviction
ordering, recency refresh on `get`, URL revocation on overwrite + delete + clear).

## 7. File viewers

Loaded lazily via `next/dynamic({ ssr: false })`:

| Extension | Component | Library |
|---|---|---|
| `.pdf` | `PdfPreview` | `react-pdf` (bundles `pdfjs-dist@5.4.296`) |
| `.docx`, `.doc` | `DocxPreview` | `mammoth` |
| `.xlsx`, `.xls`, `.xlsm`, `.xlsb`, `.ods`, `.csv`, `.tsv` | `SpreadsheetPreview` | `xlsx` (SheetJS CDN tarball) |
| `.dxf` | `DxfPreview` | `dxf-parser` |
| `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` | `ImagePreview` + `ImageLightbox` | native |
| `.txt`, `.json`, `.xml` | `TextPreview` | native |
| anything else (incl. `.rvt`, `.dwg`, `.ifc`, `.pptx`, `.skp`) | `NoPreview` | honest per-format explanation + download |

The PDF.js worker is copied to `web/public/pdf.worker.min.mjs` by the
`postinstall` script in `package.json`. The version must match react-pdf's
nested `pdfjs-dist`. The script falls back to the top-level `pdfjs-dist` if
the nested one is absent.

## 8. Tests

| Surface | Framework | Count |
|---|---|---|
| Unit (`lib/bim/**`, `lib/**`, `components/__tests__/**`) | Vitest + jsdom | ~490 |
| Property-based fuzz (`lib/bim/__tests__/fuzz.test.ts`) | Vitest + fast-check | 27 (~8000 random inputs per run) |
| Coverage (v8 provider) | Vitest | gated at 80 % lines/statements/functions, 75 % branches |

Run: `npm test`, `npm run test:coverage`.

## 9. CI

GitHub Actions at `.github/workflows/ci.yml`. Triggers: push to any branch, PR to main.
Job: checkout → setup-node 20 (npm cache on `web/package-lock.json`) → `cd web && npm ci && npx tsc --noEmit && npm test && npm run build`. Concurrency group cancels stale runs on the same ref. Timeout 10 min.

Pre-commit hook (`web/scripts/install-hooks.sh` writes `.git/hooks/pre-commit`)
runs `cd web && npx tsc --noEmit` before every commit on the developer's machine.

## 10. Deploy

`vercel.com/wintfernandes-7029s-projects/bimdoc-renamer`:

- `rootDirectory`: `web`
- `framework`: `nextjs`
- `productionBranch`: `main`
- Deployment Protection: disabled (public app)
- Auto-deploy on push to `main`
- Aliases: `bimdoc-renamer.vercel.app` (production)

## 11. Versioning

`web/package.json` — `0.1.0` (current). Versioning follows
[Semantic Versioning 2.0](https://semver.org). Bump rules:

- **Patch** (`0.1.x`): bug fix, no API/UX change visible to users
- **Minor** (`0.x.0`): user-visible feature, backward-compat (data, URLs)
- **Major** (`x.0.0`): breaking change (URL paths, data schema major version, removed feature)

Changes are recorded in `web/CHANGELOG.md` following
[Keep a Changelog 1.1.0](https://keepachangelog.com/).
