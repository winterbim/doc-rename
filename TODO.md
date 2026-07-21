# TODO — BIMCHECK-Rename

Vérité produit : multi-métiers, marque **BIMCHECK-Rename**.  
Voir `docs/product/VISION.md` + **`docs/product/SAAS_V1.md`** (doctrine live).

## Bêta gratuite — prêt à ouvrir (2026-07-21 soir)

**URL :** https://rename.bimcheck-consulting.com  
**Mode :** Free local-first + formulaire pilote. **Aucune vente en ligne.**

### Fait pour ce soir

- [x] Paiements / comptes fail-closed (flags absents ou `false` en prod)
- [x] Auth OAuth masquée (`NEXT_PUBLIC_AUTH_ENABLED=false`)
- [x] Stripe Payment Links absents en prod
- [x] Formulaire pilote → Convex (secret + rate-limit + consentement)
- [x] Identité éditeur alignée sur le site principal : **Winter Fernandes**
- [x] CGU : aucune commande acceptée tant que légal + fiscal incomplets
- [x] Audit npm production : 0 vulnérabilité (`dompurify@3.4.12`)
- [x] Headers sécu, CSP, HSTS, redirection domaine technique
- [x] Plan public `free`, télémétrie off

### Checklist ops ce soir (humain)

- [ ] Commit + push (ou `vercel --prod` depuis `web/`) du worktree final
- [ ] Smoke 5 min : `/` → `/app` → import → renommage → ZIP
- [ ] Smoke pilote : une demande test marquée « NE PAS TRAITER » dans Convex
- [ ] Surveiller les demandes dans le dashboard Convex (`exuberant-herring-311`)
- [ ] Ne **pas** activer `NEXT_PUBLIC_AUTH_ENABLED`, `PAID_ACCOUNTS`, `PAID_CHECKOUT`, Stripe live

### Avant de vendre (pas ce soir)

- [ ] Immatriculation + adresse + TVA / IDE / SIREN exacts
- [ ] Remplacer le statut « entreprise en finalisation » dans les mentions
- [ ] OAuth prod smoke-testé
- [ ] Droits org / licences / invitations / révocation
- [ ] Stripe live + webhook + un paiement puis remboursement contrôlé
- [ ] Notification email auto des demandes pilote (optionnel mais utile)

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

## Suite produit (post-premiers paiements)

- [ ] Webhook Stripe → `users.plan` automatique
- [ ] Invites membres org par email
- [ ] Preuves clients réelles (remplacer personas types)
- [ ] Audit trail / exports conformité **si** demandés par 2+ cabinets
