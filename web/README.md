# DOC-RENAME Web

Application Next.js de renommage documentaire par profils metier.

## Stack

- Next.js 16
- React 19
- TypeScript
- Vitest
- ESLint

## Demarrage

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
npm run start
```

## Architecture metier

Les conventions par metier sont centralisees dans `lib/profiles/`.

Chaque profil controle ses propres:

- champs;
- types de documents;
- abreviations;
- entites;
- statuts;
- templates;
- exemples;
- regles de normalisation.

Le profil BIM / Construction conserve les conventions BIM existantes tout en
s'inscrivant dans le nouveau moteur multi-profils.

## Deploiement

Ce dossier est l'application a deployer.

Pour Vercel ou une plateforme equivalente, definir `web/` comme racine du
projet si le depot complet est importe.
