# TODO — BIMCHECK-Rename

Vérité produit : multi-métiers, marque **BIMCHECK-Rename**.  
Voir `docs/product/VISION.md` + **`docs/product/SAAS_V1.md`** (doctrine live).

## Fait — SaaS V1 shippable (2026-07-21)

- [x] Offre unique Free / Team / Cabinet + Pilote (`web/lib/pricing.ts`)
- [x] Audit prix → Team **19 €**, Cabinet **49 €**, Pilote **49 €**, Free **5** lots/j
- [x] Sélecteur devise EUR / CHF / USD (landing + /pricing)
- [x] CGU, privacy, landing, pilot, pricing alignés (plus de Pro CHF fantôme)
- [x] Features promises = features shipped (plus de SharePoint / PDF audit marketing)
- [x] Plan effectif : env deploy **ou** `users.plan` Convex (`useAccessPlan`)
- [x] Page `/merci` post-paiement
- [x] Mentions légales honnêtes (contact réel, statut éditeur transparent)
- [x] Quota Free + upgrade Team dans l’app
- [x] Copy multi-métiers sur loading `/app`
- [x] Docs `STRIPE_SETUP.md` + `SAAS_V1.md`

## Lancer en prod aujourd’hui (ops)

- [ ] Configurer Payment Links Stripe + success `/merci`
- [ ] Variables Vercel (`NEXT_PUBLIC_SITE_URL`, Stripe, Convex, plan=free)
- [ ] OAuth Google/GitHub sur le déploiement Convex
- [ ] Smoke prod : rename lot exemple + pages légales
- [ ] Remplacer mentions « entreprise en finalisation » par SIREN / IDE dès immatriculation

## Suite produit (post-premiers paiements)

- [ ] Webhook Stripe → `users.plan` automatique
- [ ] Invites membres org par email
- [ ] Preuves clients réelles (remplacer personas types)
- [ ] Audit trail / exports conformité **si** demandés par 2+ cabinets
