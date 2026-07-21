# SaaS V1 — doctrine live (2026-07-21)

> Source de vérité opérationnelle. Complète `VISION.md`.

## Une phrase

**BIMCHECK-Rename** est un SaaS local-first de convention de nommage multi-métiers :
le renommage tourne dans le navigateur ; le cloud ne stocke que des règles JSON et l’identité.

## Parcours utilisateur (réels)

```
Visiteur → / → /app
  1. Choisit un profil métier (BIM, juridique, finance…)
  2. Dépose fichiers ou charge un lot exemple
  3. Ajuste la nomenclature → Renommer → Export ZIP
  4. Free : 5 lots / jour (localStorage)

Limite atteinte → /pricing → Team ou Cabinet
  → Stripe Payment Link (si env) OU /pilot
  → /merci
  → Webhook signé → droit lié au compte OAuth de même email

Compte → /login (Google / GitHub, uniquement si `NEXT_PUBLIC_AUTH_ENABLED=true`)
  → Sauvegarde / chargement conventions cloud
  → /account : plan, orgs, conventions
```

## Architecture fonctionnelle

| Couche | Rôle | Fichiers quittent le navigateur ? |
|--------|------|----------------------------------|
| `lib/rename-engine/` | Pure : noms, clean, zip | Non |
| `lib/profiles/` | Vocabulaire métier | Non |
| React `/app` | UI + state local | Non (blobs mémoire) |
| Convex | Auth + conventions JSON + orgs | JSON règles seulement |
| Stripe Payment Links | Encaissement hébergé (URL Stripe validée) | Checkout Stripe |
| Webhook Stripe + Convex | Droit payé idempotent, sans donnée bancaire | N/A |
| Env `NEXT_PUBLIC_DOC_RENAME_PLAN` | Provision manuelle de secours | N/A |

## Offre figée (après audit 2026-07-21)

Voir aussi `PRICING_AUDIT.md`. Devise d’affichage : EUR / CHF / USD (base EUR).

| Plan | Prix base EUR | Inclus (shipped) |
|------|---------------|------------------|
| Free | 0 € | Local, **5** lots/j, tous profils |
| Team | **19 €/mois** | Illimité, compte, sync conventions, 10 membres, 3 projets |
| Cabinet | **49 €/mois** | Illimité membres/projets, support prioritaire |
| Pilote | **49 €** one-shot | Onboarding 14 j |

**Interdit de promettre** tant que non livré : SharePoint, rapport conformité PDF marketing, audit trail public.

## Activation paid (Preview test)

1. Client paie sur Stripe Checkout en mode test.
2. Le webhook vérifie la signature sur le corps brut et traite l'événement une
   seule fois.
3. Le serveur déduit Team/Cabinet de l'ID du Payment Link. Si le compte OAuth de
   même email existe, `users.plan` est activé ; sinon le droit reste en attente.
4. Annulation, abonnement inactif ou impayé → retour à `free`. Pilote → paiement
   journalisé sans abonnement mensuel.

## Checklist mise en ligne

- [x] Vercel root = `web/`, build OK
- [x] `NEXT_PUBLIC_SITE_URL` production
- [x] Convex production séparé du développement
- [ ] OAuth Google/GitHub — secrets absents : maintenir `NEXT_PUBLIC_AUTH_ENABLED=false`
- [x] Stripe Payment Links test — configurés en Preview uniquement, production sans encaissement
- [x] Webhook Stripe test — double vérification, idempotence et révocation validées
- [x] `NEXT_PUBLIC_DOC_RENAME_PLAN=free` en public
- [x] `DOC_RENAME_ACCESS_PASSWORD` vide (SaaS public)
- [ ] Identité légale : fournir adresse postale et identifiant d’immatriculation avant encaissement
- [ ] Mentions / CGU / privacy : relecture juridique avant ouverture commerciale
- [x] Smoke : `/`, `/app`, rename lot exemple, `/pricing`, `/pilot`

## Mode de lancement public

Le lancement du 21 juillet 2026 reste classé **Free + pilote manuel en production** :
l’atelier local est public et exploitable, les comptes cloud sont masqués, et aucun
paiement en ligne live n’est présenté. Le flux Stripe test est validé en Preview, mais
l'activation visible dans `/account` attend les secrets OAuth et la validation des
informations légales listées ci-dessus.

## Rollback

Revenir au SHA précédent Vercel ; les clés localStorage Free restent compatibles (migration `doc_rename_*` → `bimcheck_rename_*`).
