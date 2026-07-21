# BIMCHECK-Rename — Architecture

Contrat technique de l’app `web/`. Toute modification structurelle doit
mettre à jour ce fichier.

## 1. Surfaces

| Path | Build | Purpose |
|---|---|---|
| `/` | Server Component | Landing marketing multi-métiers |
| `/app` | Client (`'use client'`, `dynamic ssr:false`) | Renamer |
| `/pricing`, `/pilot` | Server + forms | Conversion commerciale |
| `/merci` | Server | Post-checkout / activation manuelle |
| `/privacy`, `/conditions`, `/mentions-legales`, `/security` | Server | Légal / confiance |
| `/iso-19650` | Server | Contenu SEO BIM (un profil parmi d’autres) |
| `/login`, `/account`, `/access` | Mixed | Auth / accès |
| `/api/stripe/webhook` | Route Handler Node | Vérification Stripe + relais signé vers Convex |
| `/robots.txt`, `/sitemap.xml` | Metadata routes | Indexation des surfaces publiques |
| Toute autre route | Server | Page 404 de marque, sans perte de données locales |

Offre commerciale figée : `lib/pricing.ts` + doctrine `docs/product/SAAS_V1.md`.

Déploiement : projet Vercel, `rootDirectory=web`, framework Next.js.

## 2. State model

Un `useReducer` dans `app/app/page.tsx`, propagé via contexte. Tranches clés :

| Slice | Type | Persisted? |
|---|---|---|
| `files` | `WorkspaceFile[]` | NON (transitoire, binaires en mémoire) |
| `profileId` | `IndustryProfileId` | OUI |
| `profileEntities` | par profil | OUI |
| `fields` | `FieldsState` | OUI |
| `separator` | `string` | OUI |
| `cleaner` | `CleanerState` | OUI |
| `prefixRules` | `PrefixRule[]` | OUI |
| `ui.*` | divers | partiel (thème oui) |

Reducer **pur** ; effets de bord (revoke URL, writes) dans des hooks.

## 3. Logique pure — `lib/rename-engine/`

Zéro React, zéro DOM, zéro localStorage, zéro Convex.

| Module | Rôle |
|---|---|
| `types.ts` | Types partagés (`WorkspaceFile`, champs, préfixes…) |
| `nomenclature.ts` | Génération / validation des noms |
| `filename-cleaner.ts` | Nettoyage (accents, règles, orthographe) |
| `fields.ts` | État des champs de nomenclature |
| `prefixes.ts` | Détection / actions sur préfixes |
| `detection.ts` | Catégorie / type de doc (surtout catalogue BIM) |
| `zip-io.ts` / `archive-io.ts` | Lecture / écriture d’archives |
| `config/*` | Catalogues BIM (lots, entreprises, types…) + defaults / storage keys |

Couverture CI : `vitest --coverage` sur `lib/rename-engine/**` (seuils ≥ 80 % lignes).

## 4. Profils métiers — `lib/profiles/`

| Module | Rôle |
|---|---|
| `industry-profiles.ts` | Catalogue multi-métiers (champs, types, templates) |
| `index.ts` | API profils, `PROFILE_OPTIONS`, `BIM_ONLY` optionnel |
| `normalization.ts` | Normalisation des valeurs / abréviations |
| `entities.ts` | Import entités (CSV, tableur…) |

`DEFAULT_PROFILE_ID = 'bim-construction'` (profil de démarrage, pas le seul).

## 5. Persistence

`lib/persistence.ts` + clés `STORAGE_KEYS` (`bimcheck_rename_*`).

- Schéma versionné (`SCHEMA_VERSION`)
- Fail-closed si sentinel plus récent que le code
- Quota Free : `lib/usage-limits.ts` + `lib/hooks/useAccessPlan.ts`
  (localStorage ; plan paid via env deploy **ou** `users.plan` Convex)

## 6. Sécurité (résumé)

- Headers HTTP + CSP dans `next.config.ts`
- Webhook Stripe vérifié deux fois (SDK Next.js puis HMAC Convex), idempotence par `eventId`
- Garde d’upload : `lib/upload-guard.ts` (taille, nom, magic ZIP)
- Aperçus HTML assainis (DOMPurify) pour docx/xlsx
- Local-first : pas d’upload pour le renommage

Détail public : page `/security`.

## 7. Tests

| Couche | Outil | Cible |
|---|---|---|
| Unit / property | Vitest + fast-check | `lib/rename-engine`, `lib/profiles`, app-state… |
| E2E | Playwright | `tests/e2e/renamer.spec.ts` |

## 8. Nommage (anti-dette)

| Interdit (legacy) | Actuel |
|---|---|
| `lib/bim` | `lib/rename-engine` |
| `BimFile` | `WorkspaceFile` |
| BimDoc Renamer / DOC-RENAME (marque) | **BIMCHECK-Rename** |
