# TODO — BIMCHECK-Rename

Vérité produit : multi-métiers, marque **BIMCHECK-Rename**.  
Voir `docs/product/VISION.md`.

## Fait (purification 2026-07-20)

- [x] Vérité multi-métiers documentée (README + VISION)
- [x] `lib/bim` → `lib/rename-engine`
- [x] `BimFile` → `WorkspaceFile`
- [x] Anciennes stratégies contradictoires → `docs/archive/`
- [x] Marque / package / APP_NAME alignés sur BIMCHECK-Rename
- [x] Metadata layout + manifest multi-métiers

## Suite prioritaire

### Juridique
- [ ] Finaliser `/mentions-legales` et `/conditions` (plus de TODO trompeurs)
- [ ] Aligner `/privacy` sur le wording multi-métiers (pas seulement BIM)

### Produit / GTM
- [ ] Uniformiser pricing affiché (CHF vs EUR) sur toutes les pages
- [ ] Stripe Payment Links (voir `STRIPE_SETUP.md`)
- [ ] Remplacer témoignages / captures fictives par preuves réelles

### Technique
- [ ] Vérifier exports de conventions (`bimcheck-rename-*.json`)
- [ ] Aligner package-lock name si besoin (`npm install` dans `web/`)
- [ ] Option : migrer clé `THEME: bim_theme` vers préfixe stable (avec migration)
