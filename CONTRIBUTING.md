# Contribution interne

DOC-RENAME est un projet proprietaire.

## Installation

```bash
cd DOC-RENAME
npm run install:web
npm run dev
```

## Qualite minimale avant commit

```bash
npm run lint
npm run test
npm run build
```

## Regles produit

- Ne pas melanger les profils metier.
- Ne pas afficher une fonctionnalite non implementee comme disponible.
- Ne pas ajouter de faux temoignage, faux logo client ou placeholder marketing.
- Garder le traitement des fichiers local tant qu'aucune infrastructure cloud n'est branchee.
- Ne pas modifier la licence sans accord explicite du proprietaire.
