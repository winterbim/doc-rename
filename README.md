# DOC-RENAME

DOC-RENAME est une application web de renommage documentaire par profils metier.

Le produit est concu pour structurer et renommer des lots de fichiers avant transmission, archivage ou depot dans un outil metier. Il fonctionne localement dans le navigateur pour le traitement des fichiers: aucun upload serveur n'est necessaire pour renommer.

## Statut

- Application principale: `web/`
- Framework: Next.js 16, React 19, TypeScript
- Tests: Vitest
- Licence: proprietaire, tous droits reserves

## Fonctionnalites principales

- Import de fichiers et archives.
- Renommage en lot.
- Profils metier strictement separes:
  - BIM / Construction
  - Finance
  - RH
  - Sante
  - Administratif / Secretariat
  - Juridique
  - Industrie
  - Immobilier
  - Convention personnalisee
- Champs, types de documents, abreviations, entites et templates adaptes au profil actif.
- Normalisation des noms: majuscules, suppression des accents, nettoyage des caracteres dangereux, choix du separateur `_`, `-` ou `.`.
- Import d'entites par profil.
- Apercu avant export.
- Export ZIP.
- Import/export JSON.
- Apercu multi-format selon les capacites navigateur.

## Structure du depot

```text
DOC-RENAME/
├── web/                 # Application SaaS Next.js
├── .github/workflows/   # CI
├── README.md            # Vue d'ensemble du depot
├── LICENSE              # Licence proprietaire
├── PRIVACY_POLICY.md    # Politique de confidentialite
├── CONTRIBUTING.md      # Guide de contribution interne
└── package.json         # Scripts racine
```

## Commandes

Depuis la racine du depot:

```bash
npm run install:web
npm run dev
npm run lint
npm run test
npm run build
```

Equivalent depuis `web/`:

```bash
npm ci
npm run dev
npm run lint
npm test
npm run build
```

## Deploiement

Le dossier a deployer est `web/`.

Variables serveur requises: aucune pour la version locale actuelle.

Points importants avant production:

- verifier `web/app/privacy/page.tsx`;
- verifier le nom legal de l'editeur;
- remplacer les emails de contact temporaires si necessaire;
- definir le domaine final;
- brancher analytics et paiement seulement quand ces fonctions existent vraiment.

## Proprietaire

Copyright (c) 2026 Jawani Fernandes.
Tous droits reserves.

Ce depot contient du code proprietaire. Aucune licence open source n'est accordee.
