# Vision produit — BIMCHECK-Rename

> Source de vérité. Date de gel : 2026-07-20.  
> Les fichiers de `docs/archive/` sont historiques et ne tranchent plus.

## Une phrase

**BIMCHECK-Rename** standardise les noms de fichiers d’équipes professionnelles
(BIM, juridique, finance, RH, santé, industrie, immobilier…), en local dans le
navigateur, sans remplacer un CDE ni un GED.

## Ce que le produit est

- Un **moteur de convention de nommage** multi-métiers
- Un **aperçu Avant / Après** + export ZIP
- **Local-first** : le renommage n’exige aucun envoi de fichier au serveur
- Des **profils** (champs, types de docs, templates, entités) par métier

## Ce que le produit n’est pas

- Pas un Autodesk Docs / ACC / SharePoint / GED
- Pas un outil de renommage *interne* aux modèles Revit/IFC
- Pas un produit « BIM only » — le BIM est le profil le plus riche, pas le seul

## Marque & noms techniques

| Contexte | Valeur |
|---|---|
| Nom commercial | **BIMCHECK-Rename** |
| Package npm racine | `bimcheck-rename` |
| Package web | `bimcheck-rename-web` |
| Moteur pur | `web/lib/rename-engine/` |
| Type fichier en mémoire | `WorkspaceFile` |
| Clés localStorage | `bimcheck_rename_*` (stables, ne pas renommer à la légère) |
| Anciens noms abandonnés | BimDoc Renamer, DOC-RENAME (label produit), `lib/bim` |

## Architecture logique

```
profiles/          → vocabulaire métier (qui, quels champs, quels templates)
rename-engine/     → pure functions (générer nom, clean, zip, détection)
app-state + UI     → orchestration React
persistence        → localStorage (conventions, pas les binaires)
```

## Décisions gelées

1. **Multi-métiers = vérité produit** (pas un flag V2).
2. `NEXT_PUBLIC_BIM_ONLY` est un **frein commercial optionnel**, pas la doctrine.
3. Les docs de `docs/archive/` peuvent se contredire ; en cas de conflit, **ce fichier + le README racine gagnent**.
4. La couche pure ne doit importer ni React, ni DOM, ni Convex.

## Prochaines étapes (hors scope de cette purification)

Voir `TODO.md` à la racine.
