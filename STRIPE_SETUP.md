# Encaisser dès aujourd’hui — Stripe Payment Links

Objectif : facturer **Team / Cabinet / Pilote** sans API Stripe ni webhooks.
Le code lit uniquement des URLs `NEXT_PUBLIC_STRIPE_LINK_*` ([`web/lib/pricing.ts`](web/lib/pricing.ts)).

## Offre SaaS V1 (source unique — après audit prix)

| Produit | Prix | Récurrence | Variable d’env (priorité) |
|---------|------|------------|---------------------------|
| Team | **19 €** | mensuel | `NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR` ou `NEXT_PUBLIC_STRIPE_LINK_TEAM` (ou legacy `…_PRO`) |
| Cabinet | **49 €** | mensuel | `NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR` ou `NEXT_PUBLIC_STRIPE_LINK_CABINET` |
| Pilote 14 j | **49 €** | one-time | `NEXT_PUBLIC_STRIPE_LINK_PILOT` |

Optionnel — liens par devise d’affichage :
`NEXT_PUBLIC_STRIPE_LINK_TEAM_CHF`, `_TEAM_USD`, `_CABINET_CHF`, `_CABINET_USD`, `_PILOT_CHF`, `_PILOT_USD`.

Sans variable : le bouton bascule sur `/pilot` — **aucun CTA mort**.

## Étapes (≈ 30 min)

1. Compte Stripe activé (IBAN + identité).
2. Créer 3 produits/prix dans Stripe (montants ci-dessus).
3. Payment Link par prix :
   - collecter email + adresse de facturation ;
   - **URL de succès** : `https://VOTRE_DOMAINE/merci`
4. Variables Vercel (Production) :
   ```
   NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR=https://buy.stripe.com/…
   NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR=https://buy.stripe.com/…
   NEXT_PUBLIC_STRIPE_LINK_PILOT=https://buy.stripe.com/…
   NEXT_PUBLIC_DOC_RENAME_PLAN=free
   NEXT_PUBLIC_SITE_URL=https://VOTRE_DOMAINE
   ```
5. **Redéployer** (les `NEXT_PUBLIC_*` sont inlinées au build).

## Provisionner après paiement (manuel V1)

1. Email Stripe reçu.
2. Activer le plan :
   - **Convex** : éditer `users.plan` → `team` ou `cabinet` pour l’email client ;
   - **ou** instance dédiée : `NEXT_PUBLIC_DOC_RENAME_PLAN=team` + redeploy.
3. Email client : lien `/login` + `/app` + rappel local-first.

Le plan Free public garde **3 lots / jour**. Team / Cabinet = lots illimités dans l’UI.

## Suite (plus tard)

Checkout API + webhooks pour auto-set `users.plan` **après ≥ 3 clients payants** qui rendent le manuel douloureux.

## TVA

Activer Stripe Tax si assujetti ; sinon mentions « hors taxes / non assujetti » sur factures.
