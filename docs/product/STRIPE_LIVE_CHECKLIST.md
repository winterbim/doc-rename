# Stripe LIVE only — checklist encaissement réel

Objectif : **argent réel**, pas l’environnement de test.
Le site public refuse les liens `buy.stripe.com/test_*` en production Vercel.

## Toi seul (personne d’autre ne peut le faire)

1. **E-mail** — ouvre le mail Stripe sur `bimcheck-consulting@proton.me` et confirme.
2. **SMS** — valide le téléphone dans le Dashboard.
3. **Basculer en Live** (toggle Test → Production).
4. **Profil entreprise** — type, nom légal (Winter Fernandes / structure), adresse, SIRET/TVA si applicable, activité « logiciel SaaS de convention de nommage ».
5. **IBAN EUR** + pièce d’identité demandée par Stripe.
6. Attendre **charges_enabled = true** (et idéalement payouts_enabled = true).

## Ensuite (Claude Chrome ou Dashboard)

Créer en **Live uniquement** (URLs **sans** `test_`) :

| Offre | Prix | Type | Success URL |
|-------|------|------|-------------|
| BIMCHECK-Rename Team | 19 € | mensuel | `https://rename.bimcheck-consulting.com/merci` |
| BIMCHECK-Rename Cabinet | 49 € | mensuel | idem |
| Pilote BIMCHECK-Rename — 14 jours | 49 € | one-time | idem |

## Variables Vercel **Production** (pas Preview)

```
NEXT_PUBLIC_PAID_CHECKOUT_ENABLED=true
NEXT_PUBLIC_STRIPE_MODE=live
NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR=https://buy.stripe.com/….   # SANS test_
NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR=https://buy.stripe.com/….
NEXT_PUBLIC_STRIPE_LINK_PILOT=https://buy.stripe.com/….
STRIPE_MODE=live
STRIPE_PAYMENT_LINK_TEAM_ID=plink_…
STRIPE_PAYMENT_LINK_CABINET_ID=plink_…
STRIPE_PAYMENT_LINK_PILOT_ID=plink_…
# optionnel webhook : STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_PAID_ACCOUNTS_ENABLED=false
PAID_SAAS_ENABLED=false
NEXT_PUBLIC_DOC_RENAME_PLAN=free
```

Puis **redéployer** (les `NEXT_PUBLIC_*` sont figées au build).

## Interdit

- Mettre un lien `test_` en Production
- Utiliser des cartes de test pour un client réel
- Attendre OAuth/org pour encaisser (fulfillment manuel OK)

## Success URL obligatoire (activation auto)

Sur **chaque** Payment Link Live, la redirection de succès doit être :

```text
https://rename.bimcheck-consulting.com/merci?session_id={CHECKOUT_SESSION_ID}
```

Sans `session_id`, la licence ne peut pas s’activer dans le navigateur.

## Webhook + secrets (activation auto)

1. Stripe → Developers → Webhooks → Add endpoint  
   URL : `https://rename.bimcheck-consulting.com/api/stripe/webhook`  
   Events : `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
2. Vercel Production + Convex :
   - `STRIPE_MODE=live`
   - `STRIPE_WEBHOOK_SECRET=whsec_…`
   - `STRIPE_PAYMENT_LINK_*_ID=plink_…`
   - `STRIPE_SECRET_KEY=sk_live_…` (recommandé pour activation instantanée)
   - `PILOT_REQUEST_INGEST_SECRET` ou `LICENSE_API_SECRET` (≥ 32 chars) sur **Vercel et Convex**
3. Redéployer Vercel + `npx convex deploy` si le schéma licences a changé

## Après un vrai paiement

1. Stripe Dashboard → paiement visible  
2. Client atterrit sur `/merci?session_id=cs_…`  
3. Licence **activée automatiquement** (localStorage `bimcheck_license_v1`)  
4. `/app` : lots illimités sans compte  
5. Annulation / impayé → webhook désactive la licence
