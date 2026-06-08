# BimDoc Renamer

BimDoc Renamer est une application web pour préparer des lots de livrables BIM
avant dépôt CDE. Elle applique une convention de nommage ISO 19650, SIA 2051 ou
BEP projet, affiche un aperçu Avant / Après, puis exporte un ZIP propre.

Le flux de renommage est local-first: les fichiers sont traités dans le
navigateur et ne sont pas envoyés à un serveur pour être renommés.

## Statut

- Application principale: `web/`
- URL production: `https://doc-rename-saas.vercel.app`
- Framework: Next.js 16, React 19, TypeScript
- Tests: Vitest + Playwright
- Licence: propriétaire, tous droits réservés

## Offre V1

- Cible: BIM Managers, BIM Coordinators, agences d’architecture, bureaux d’études et petites équipes construction.
- Cas d’usage: renommer PDF, DWG, IFC, RVT, DOCX, images et tableurs avant dépôt dans Autodesk Docs / ACC, Trimble Connect, Kroqi, ProjectWise ou CDE interne.
- Conversion: pilote BIM 14 jours sur convention réelle via `/pilot`.
- Prix beta: Pro 19,99 CHF / mois, Team 34,90 CHF / mois.

## Fonctionnalités principales

- Import de fichiers individuels et archives.
- Lot exemple intégré pour tester sans fichier client.
- Modèles BIM: ISO 19650, SIA 2051, BIM France, convention maison.
- Champs paramétrables: projet, phase, lot, zone, niveau, type, discipline, séquence, révision, statut.
- Import d’entités par CSV, Excel, ODS ou copier-coller tableur.
- Normalisation des noms: majuscules, suppression des accents, nettoyage des caractères dangereux, séparateur `_`, `-` ou `.`.
- Aperçu Avant / Après et correction manuelle.
- Export ZIP avec arborescence conservée.
- Export/import de conventions en JSON/CSV.
- Aperçu multi-format selon les capacités du navigateur.

## Commandes

Depuis la racine du dépôt:

```bash
npm run install:web
npm run dev
npm run lint
npm run test
npm run build
```

Depuis `web/`:

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run test:e2e
npm run audit:prod
```

## Déploiement

Le dossier à déployer est `web/`.

Production Vercel: `doc-rename-saas`, racine `web/`, framework Next.js.

Variables optionnelles:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_TELEMETRY_ENABLED`
- Sentry DSN/env si l’observabilité est activée

## Propriétaire

Copyright (c) 2026 Jawani Fernandes.
Tous droits réservés.

Ce dépôt contient du code propriétaire. Aucune licence open source n’est accordée.
