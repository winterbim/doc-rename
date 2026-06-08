# BimDoc Renamer Web

Application Next.js de renommage de livrables BIM avant dépôt CDE.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest
- Playwright
- ESLint

## Démarrage

```bash
npm ci
npm run dev
```

Ouvrir `http://127.0.0.1:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run test:e2e
npm run audit:prod
npm run start
```

## Surfaces

- `/` : landing commerciale BimDoc Renamer.
- `/app` : atelier de renommage local-first.
- `/pilot` : demande de pilote BIM 14 jours, formulaire mailto sans stockage backend.
- `/iso-19650` : guide et modèle JSON prêt à importer.
- `/security` : audit sécurité et preuves local-first.
- `/privacy` : politique de confidentialité.

## Architecture métier

La V1 commerciale est centrée BIM / Construction. Les conventions, champs,
référentiels et templates sont maintenus dans `lib/bim/` et les panneaux UI
associés.

Le flux fichier passe par `lib/hooks/useFileIngestion.ts`:

1. validation du nom, de la taille et de l’archive;
2. expansion ZIP/RAR/7z/TAR si nécessaire;
3. création des entrées `BimFile`;
4. ajout au state React;
5. préchargement des viewers utiles.

## Déploiement

Ce dossier est l’application à déployer. Pour Vercel, définir `web/` comme
racine du projet.

Production actuelle: `https://doc-rename-saas.vercel.app`.
