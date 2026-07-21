# BIMCHECK-Rename

**Convention de nommage multi-métiers, local-first.**

BIMCHECK-Rename standardise les noms de fichiers d’une équipe avant dépôt,
archivage ou partage. Les fichiers sont traités **dans le navigateur** :
aucun upload n’est requis pour renommer.

## Vérité produit

| | |
|---|---|
| **Produit** | BIMCHECK-Rename |
| **Catégorie** | Standardisation de nommage de fichiers (pas un CDE) |
| **Positionnement** | Multi-métiers — le BIM est un profil parmi d’autres |
| **Différenciateur** | Local-first prouvable (DevTools → Réseau) |
| **App** | `web/` (Next.js 16, React 19, TypeScript) |
| **Vidéos** | `video/` (Remotion, marketing) |
| **Docs vivantes** | ce README + `docs/product/` |
| **Docs historiques** | `docs/archive/` (ne plus les traiter comme source de vérité) |

### Profils métiers

- BIM / Construction (ISO 19650, SIA 2051, lots, CDE…)
- Finance
- Juridique
- RH
- Santé
- Administration
- Industrie
- Immobilier
- Custom (convention libre)

> Option de déploiement : `NEXT_PUBLIC_BIM_ONLY=true` peut masquer temporairement
> les profils non-BIM. **Par défaut, le catalogue multi-métiers est exposé.**

## Structure du dépôt

```
.
├── README.md                 ← source de vérité produit (ce fichier)
├── CHANGELOG.md
├── TODO.md
├── PRIVACY_POLICY.md
├── STRIPE_SETUP.md
├── package.json              ← scripts racine (délègue à web/)
├── docs/
│   ├── product/              ← décisions produit actives
│   └── archive/              ← anciennes stratégies contradictoires
├── web/                      ← application Next.js (à déployer)
│   ├── app/                  ← routes (landing, /app, pricing, legal…)
│   ├── components/           ← UI
│   ├── lib/
│   │   ├── rename-engine/    ← logique pure (nomenclature, zip, cleaner…)
│   │   ├── profiles/         ← profils métiers + templates
│   │   └── …                 ← state, persistence, limits, viewer
│   └── convex/               ← auth / conventions cloud (optionnel)
└── video/                    ← assets vidéo marketing
```

## Flux principal

1. Import de fichiers ou archives (ZIP, etc.)
2. Choix d’un **profil métier** + modèle de convention
3. Aperçu **Avant / Après**, correction manuelle
4. Export ZIP renommé (arborescence conservée)

## Commandes

```bash
# depuis la racine
npm run install:web
npm run dev
npm run lint
npm run test
npm run build
```

```bash
# depuis web/
npm ci
npm run dev
npm run verify   # tsc + lint + test + build
npm run test:e2e
```

## Déploiement

- Racine Vercel : `web/`
- Framework : Next.js
- Variables optionnelles : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_KEY`,
  `NEXT_PUBLIC_TELEMETRY_ENABLED`, `NEXT_PUBLIC_BIM_ONLY`, Sentry DSN

## Offre SaaS V1

Source unique : `web/lib/pricing.ts` + `docs/product/SAAS_V1.md`.

| Plan | Prix (base EUR) | Rôle |
|------|-----------------|------|
| Free | 0 € | 5 lots/jour, local, sans compte |
| Team | **19 €/mois** | Illimité + sync conventions + org (10) |
| Cabinet | **49 €/mois** | Illimité multi-équipes + support prioritaire |
| Pilote | **49 €** | 14 jours guidés (`/pilot`) |

Affichage multi-devises EUR / CHF / USD (conversion indicative). Audit : `docs/product/PRICING_AUDIT.md`.

Encaissement : Stripe Payment Links (voir `STRIPE_SETUP.md`) ou devis.

## Propriétaire

Copyright (c) 2026 Jawani Fernandes.  
Tous droits réservés. Licence propriétaire — aucune licence open source.
