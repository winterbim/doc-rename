# Stratégie « projet vendable » — couche de décision

> Ce document ne remplace pas les 5 docs existants (`SELLABLE_V1_STRATEGY`, `MARKET_AND_BIM_V1_REFONTE`, `AUDIT_AND_GTM`, `SAAS_READINESS_PLAN`, `README`).
> Il les **réconcilie** : ils se contredisent sur la version, la devise, la cible et l'état du gate d'accès. Ici = la source de vérité décisionnelle. Date : 2026-06-08.

---

## 0. Le constat en une phrase

Le produit est **techniquement A** (Next.js 16 / React 19, 602 tests, CI sécurité, local-first prouvable) mais **commercialement non encaissable** : il affiche un pricing qu'il ne peut pas facturer. Le travail restant pour vendre n'est **pas** du code produit — c'est de l'encaissement, du juridique et de la preuve sociale.

---

## 1. Contradictions tranchées (décisions)

| Sujet | Contradiction dans les docs | **Décision** |
|---|---|---|
| **Cible V1** | `SAAS_READINESS_PLAN` = multi-métiers ; docs récents = BIM-only | **BIM-only.** Le flag `BIM_ONLY` est codé ; le code multi-métiers reste pour V2. Réaligner `SAAS_READINESS_PLAN`. |
| **Devise** | CHF (pages produit, README) vs EUR (refonte) | **CHF en V1** (cible Suisse romande). EUR seulement après 1ʳᵉ vente FR. Ne pas afficher les deux. |
| **Géo** | CH-first vs FR | **CH romande d'abord** (cohérent CHF + marché public ISO 19650 exigeant + moins de concurrence). |
| **Version** | `web/package.json` = `0.1.0` ; `CHANGELOG.md` racine = `2.1.1` (vestige extension Chrome) | **`0.1.0`.** Réécrire le CHANGELOG racine, taguer `v0.1.0`. *Bloquant com.* |
| **Nom de domaine** | `doc-rename-saas.vercel.app` vs `bimdoc-renamer.vercel.app` | **`bimdoc-renamer`** (marque produit). Acheter le domaine `.ch`/`.com` avant la 1ʳᵉ démo. |
| **Free beta gratuite vs pilotes payants** | les deux coexistent | **Pilotes payants dès le n°1** (voir §3). Pas de beta gratuite de masse. |

---

## 2. Vrais bloquants pour vendre (vérifiés dans le code, 2026-06-08)

| # | Bloquant | État réel vérifié | Effort |
|---|---|---|---|
| B1 | **Encaisser un paiement** | Aucune trace de Stripe. Pricing affiché, non facturable. | **Stripe Payment Links = 0 ligne de code** (voir §3) |
| B2 | **Comptes / auth** | Aucune lib d'auth. Conventions en localStorage seulement. | Reporté jusqu'à ≥3 clients payants |
| B3 | **Juridique B2B** | Seule la privacy existe. Pas de CGU/CGV, DPA, mentions légales. | 1–2 j (templates + relecture) |
| B4 | **Travail SaaS non commité** | `web/app/access/`, `web/app/api/`, `access-control.ts`, `usage-limits.ts` **non suivis par git** → risque de perte | **30 min — à faire MAINTENANT** |
| B5 | **Versionnage incohérent** | cf. §1 | 1 h |
| B6 | **Preuve sociale** | Témoignages/personas fictifs, captures « Avant/Après » non réelles | À remplacer dès le 1ᵉʳ pilote |
| B7 | **Limite Free contournable** | `usage-limits.ts` en localStorage → `localStorage.clear()` la réinitialise | Acceptable en V1 (« nudge, pas un mur ») |

### ⚠️ Faux bloquant corrigé
`AUDIT_AND_GTM` §3.3 affirme que le gate d'accès est cassé car le fichier s'appelle `proxy.ts` au lieu de `middleware.ts`. **C'est faux pour Next.js 16** : la doc embarquée (`node_modules/next/dist/docs/.../glossary.md`) confirme que `proxy.ts` *est* le nouveau nom de Middleware (« Formerly known as Middleware »). Le fichier exporte bien `proxy()` + `config` → **le gate est correct et actif**. Renommer en `middleware.ts` l'aurait **désactivé**. Ne pas appliquer cette reco.

---

## 3. Le chemin le plus court vers le 1ᵉʳ euro (recommandé)

**Principe : valider la volonté de payer AVANT de construire le moindre backend de facturation.**

```
Semaine 1 — Rendre vendable sans coder de SaaS
  □ Commiter tout le travail SaaS (B4) + tag v0.1.0 + CHANGELOG (B5)
  □ Acheter le domaine + brancher sur Vercel
  □ Créer un compte Stripe → 3 "Payment Links" (Pro / Team / Pilote 14j)
  □ CGU + mentions légales + DPA (templates B3)
  □ Gate d'accès beta : activer NEXT_PUBLIC / mot de passe sur /app

Semaine 2 — Démo irréprochable + premiers contacts
  □ Remplacer les captures fictives par une vraie démo Loom (60s)
  □ 15 DM LinkedIn/jour ciblés BIM managers CH romande (déjà planifié dans AUDIT_AND_GTM)
  □ Objectif : 10 appels qualifiés

Semaine 3-4 — Vendre des pilotes payants
  □ Pilote 14 jours FACTURÉ (Payment Link), pas gratuit
  □ Onboarding 30 min : importer LEUR convention réelle pendant l'appel
  □ Accès provisionné à la main (email → mot de passe gate) — aucun code
  □ Objectif : 3 pilotes payants
```

**Encaisser sans backend :** Stripe Payment Link → paiement → tu provisionnes l'accès manuellement (le gate `proxy.ts` existe déjà). Zéro auth, zéro `/api/stripe`. C'est ce qui débloque B1 cette semaine.

**Ne construire Stripe API + auth (B2) que SI** ≥3 pilotes paient et que la gestion manuelle devient pénible. C'est déjà la position de `SELLABLE_V1_STRATEGY` — on la confirme.

---

## 4. Transformer la qualité technique en argument de vente

L'audit qualité du 2026-06-08 a durci la sécurité — à exploiter commercialement :

- **2 failles XSS corrigées** (HTML `.docx`/`.xlsx` assaini via DOMPurify avant rendu). → La page `/security` peut maintenant affirmer « entrées non fiables assainies » sans mentir. C'est un **argument B2B fort** face à des marchés publics/grands comptes soucieux de confidentialité.
- **Focus traps réels** dans les modals + base a11y → argument « accessible » (utile en marché public FR/CH : RGAA/accessibilité).
- **Local-first prouvable** (DevTools Réseau) reste LE différenciateur n°1 vs Plannerly/Autodesk. À mettre au centre de chaque démo.

**À NE PAS survendre :** dès qu'il y aura comptes + Stripe, le serveur stockera email/plan. La promesse exacte est « **le contenu de vos fichiers** ne quitte jamais le navigateur », pas « rien ne sort ».

---

## 5. Dette technique restante (post-vente, non bloquante)

Issue de l'audit — à traiter quand le revenu le justifie, pas avant :

- **Perf gros lots** : `FileRow` non mémoïsé + liste non virtualisée → lag à plusieurs milliers de fichiers. (Virtualiser avec `@tanstack/react-virtual`.) *Impact si un client traite de très gros DOE.*
- **Supply-chain** : `xlsx` épinglé sur `xlsx-latest.tgz` (tag mouvant) → builds non reproductibles. Épingler une version exacte.
- **CSP** : `unsafe-inline`/`unsafe-eval` sur `script-src` → migrer vers nonce/hash (renforce l'argument /security).
- **Cookie d'accès** : valeur constante → dériver d'un HMAC (faible enjeu tant que c'est un gate beta).
- `npm audit` : 5 vulnérabilités (dont 1 high) à trier.

---

## 6. Verdict

- **Prêt pour :** beta privée invitée + pilotes payants facturés à la main. **Oui, dès cette semaine.**
- **Pas prêt pour :** vente self-serve automatisée (manque Stripe API + auth + légal complet).
- **Maturité :** technique **A**, commerciale **C → B** une fois §3 semaine 1 fait.
- **Cible réaliste :** 50–150 k€ ARR à 36 mois (bootstrap solo), pas venture-scale — assumé.

**Prochaine action unique :** commiter le travail SaaS non suivi (B4) avant tout, c'est le seul risque irréversible.
