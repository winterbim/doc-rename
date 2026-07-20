# Encaisser sans backend — Stripe Payment Links

Objectif : pouvoir **facturer Pro / Team / Pilote dès aujourd'hui**, sans coder d'API Stripe ni d'authentification. Le code est déjà câblé ([`web/lib/pricing.ts`](web/lib/pricing.ts)) ; il ne reste que des actions dans ton compte Stripe + 3 variables d'env.

## Comment ça marche

```
Prospect clique "S'abonner — Pro"  →  Stripe Payment Link (checkout hébergé)
        →  il paie  →  tu reçois l'email Stripe
        →  tu provisionnes l'accès à la main (mot de passe du gate /access)
```

Tant qu'une variable n'est pas remplie, le bouton **retombe automatiquement sur `/pilot`** (demande manuelle) — aucun bouton mort. Tu peux donc activer Pro avant Team, etc.

## Étapes (≈ 30 min, une seule fois)

1. **Créer un compte Stripe** → https://dashboard.stripe.com (activer le compte : IBAN + pièce d'identité de l'entité de facturation).
2. **Créer 3 produits / prix** (Catalogue → Produits) :
   | Produit | Prix | Récurrence |
   |---|---|---|
   | BIMCHECK-Rename — Pro | 19,99 CHF | mensuel (recurring) |
   | BIMCHECK-Rename — Team | 34,90 CHF | mensuel (recurring) |
   | BIMCHECK-Rename — Pilote BIM 14 j | 149 CHF | paiement unique (one-time) |
3. **Créer un Payment Link par prix** (Paiements → Payment Links → Nouveau). Pour chacun :
   - activer la collecte de l'email et de l'adresse de facturation ;
   - (Team) limiter la quantité si besoin ;
   - définir l'**URL de redirection après paiement** vers une page de remerciement (ex. `https://doc-rename-saas.vercel.app/app`).
4. **Copier les 3 URLs** (format `https://buy.stripe.com/...`).
5. **Renseigner les variables d'env dans Vercel** (Project → Settings → Environment Variables, scope *Production*) :
   ```
   NEXT_PUBLIC_STRIPE_LINK_PRO=https://buy.stripe.com/xxxxPRO
   NEXT_PUBLIC_STRIPE_LINK_TEAM=https://buy.stripe.com/xxxxTEAM
   NEXT_PUBLIC_STRIPE_LINK_PILOT=https://buy.stripe.com/xxxxPILOT
   NEXT_PUBLIC_DOC_RENAME_PLAN=free
   ```
   > Ces variables sont `NEXT_PUBLIC_` → **inlinées au build**. Il faut **redéployer** pour qu'elles prennent effet : `cd web && vercel --prod`.
6. **Vérifier** : sur la prod, les boutons Pro/Team affichent « S'abonner » et ouvrent le checkout Stripe.

## Provisionner l'accès après paiement (manuel, V1)

L'app a déjà un gate d'accès ([`web/proxy.ts`](web/proxy.ts) + `/access`) piloté par `DOC_RENAME_ACCESS_PASSWORD`. Flux V1 :

1. Stripe t'envoie l'email de paiement.
2. Tu provisionnes un accès Pro/Team en redéployant une instance ou une preview protégée avec :
   ```
   DOC_RENAME_ACCESS_PASSWORD=mot-de-passe-client
   NEXT_PUBLIC_DOC_RENAME_PLAN=pro
   ```
   ou `NEXT_PUBLIC_DOC_RENAME_PLAN=team` pour l'offre Team.
3. Tu communiques au client le mot de passe d'accès (ou un lien `/access`).
4. (Optionnel) un mot de passe par client si tu veux pouvoir révoquer.

Le plan `free` garde la limite visible dans l'app : **3 lots de renommage par jour**. Les plans `pro` et `team` affichent "lots illimités" et ne bloquent pas le bouton de renommage.

Sans Payment Link configuré, `/pilot` reste vendable : le formulaire prépare une
réservation du pilote à **149 CHF** et demande un lien de paiement ou une facture.
Tu peux donc encaisser manuellement aujourd'hui, puis remplacer ce flux par Stripe
en ajoutant `NEXT_PUBLIC_STRIPE_LINK_PILOT`.

## Quand passer au "vrai" SaaS (plus tard)

Construire Stripe **Checkout API + webhooks + auth** (Clerk/Supabase) seulement **après ≥ 3 pilotes payants**, quand la gestion manuelle devient pénible. Voir [STRATEGIE_VENDABLE.md](STRATEGIE_VENDABLE.md) §3.

## TVA / facturation

- Activer **Stripe Tax** si tu dois collecter la TVA (CH : TVA à partir de 100 000 CHF de CA ; sinon non assujetti).
- Les factures Stripe servent de justificatifs ; vérifier qu'elles portent les mentions de ton entité (voir mentions légales).
