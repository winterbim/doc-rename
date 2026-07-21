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
  4. Free : 3 lots / jour (localStorage)

Limite atteinte → /pricing → Team ou Cabinet
  → Stripe Payment Link (si env) OU /pilot
  → /merci
  → Activation manuelle ≤ 1 jour ouvré

Compte → /login (Google / GitHub)
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
| Stripe Payment Links | Encaissement | Checkout Stripe |
| Env `NEXT_PUBLIC_DOC_RENAME_PLAN` | Provision manuelle paid | N/A |

## Offre figée (après audit 2026-07-21)

Voir aussi `PRICING_AUDIT.md`. Devise d’affichage : EUR / CHF / USD (base EUR).

| Plan | Prix base EUR | Inclus (shipped) |
|------|---------------|------------------|
| Free | 0 € | Local, **5** lots/j, tous profils |
| Team | **19 €/mois** | Illimité, compte, sync conventions, 10 membres, 3 projets |
| Cabinet | **49 €/mois** | Illimité membres/projets, support prioritaire |
| Pilote | **49 €** one-shot | Onboarding 14 j |

**Interdit de promettre** tant que non livré : SharePoint, rapport conformité PDF marketing, audit trail public.

## Activation paid (V1)

1. Client paie (Stripe ou virement).
2. Ops :
   - soit `NEXT_PUBLIC_DOC_RENAME_PLAN=team|cabinet` + redeploy (instance dédiée),
   - soit `users.plan` = `team`|`cabinet` dans Convex dashboard.
3. Email client → `/login` + `/app`.

## Checklist mise en ligne

- [ ] Vercel root = `web/`, build OK
- [ ] `NEXT_PUBLIC_SITE_URL` production
- [ ] Convex déployé + OAuth Google/GitHub
- [ ] Stripe Payment Links (Team, Cabinet, Pilot) → success URL `/merci`
- [ ] `NEXT_PUBLIC_DOC_RENAME_PLAN=free` en public
- [ ] `DOC_RENAME_ACCESS_PASSWORD` vide (SaaS public)
- [ ] Mentions / CGU / privacy relues
- [ ] Smoke : `/`, `/app`, rename lot exemple, `/pricing`, `/pilot`

## Rollback

Revenir au SHA précédent Vercel ; les clés localStorage Free restent compatibles (migration `doc_rename_*` → `bimcheck_rename_*`).
