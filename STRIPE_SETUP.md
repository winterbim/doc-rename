# Préparer Stripe sans ouvrir les encaissements

Objectif : préparer **Team / Cabinet / Pilote** avec Stripe Checkout hébergé, sans
exposer de clé API. Le code accepte uniquement des URL HTTPS sur
`buy.stripe.com` dans les variables `NEXT_PUBLIC_STRIPE_LINK_*`
([`web/lib/pricing.ts`](web/lib/pricing.ts)). Toute autre cible est ignorée et le
CTA revient sur `/pilot`.

> État au 21 juillet 2026 : les trois Payment Links **test** ont été préparés.
> Les CTA d’achat, les comptes payants et le traitement des droits restent
> volontairement désactivés par défaut. La présence d’un lien Stripe ou
> l’activation OAuth ne suffit pas à les rendre publics.
> L’identité légale du vendeur et l’URL des CGU dans les informations publiques
> Stripe restent à valider. Le cycle de vie des licences doit également être
> durci et retesté avant tout passage en mode live.

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

1. Dans le Dashboard Stripe, rester en **mode test**.
2. Compléter le nom public, le support, l’URL du site, les CGU et la politique
   de confidentialité. En mode live : identité légale et IBAN obligatoires.
3. Créer 3 produits/prix dans Stripe (montants ci-dessus).
4. Payment Link par prix :
   - collecter email + adresse de facturation ;
   - demander le nom de l’entreprise pour Team/Cabinet ;
   - activer l’acceptation des CGU ;
   - **URL de succès** : `https://rename.bimcheck-consulting.com/merci` ;
   - ne jamais demander de donnée métier ou de contenu de fichier dans un champ Stripe.
5. Tester les trois liens avec une carte Stripe de test et vérifier le reçu.
6. Variables Vercel : mettre d’abord les liens de test sur **Preview**, puis les
   vrais liens sur **Production** uniquement après validation juridique :
   ```
   NEXT_PUBLIC_STRIPE_LINK_TEAM_EUR=https://buy.stripe.com/…
   NEXT_PUBLIC_STRIPE_LINK_CABINET_EUR=https://buy.stripe.com/…
   NEXT_PUBLIC_STRIPE_LINK_PILOT=https://buy.stripe.com/…
   NEXT_PUBLIC_DOC_RENAME_PLAN=free
   NEXT_PUBLIC_SITE_URL=https://rename.bimcheck-consulting.com
   NEXT_PUBLIC_AUTH_ENABLED=false
   NEXT_PUBLIC_PAID_ACCOUNTS_ENABLED=false
   NEXT_PUBLIC_PAID_CHECKOUT_ENABLED=false
   ```
7. **Redéployer** (les `NEXT_PUBLIC_*` sont inlinées au build).

Ne jamais ajouter `STRIPE_SECRET_KEY` ou `STRIPE_WEBHOOK_SECRET` avec le préfixe
`NEXT_PUBLIC_`, ni les copier dans Git, un ticket ou un rapport.

## Architecture de provisionnement (désactivée tant que la revue n’est pas terminée)

1. Stripe envoie l'événement à `/api/stripe/webhook`. Le corps brut et
   `Stripe-Signature` sont vérifiés par le SDK Stripe, puis une seconde fois par
   Convex avant toute mutation.
2. Convex déduit le plan de l'ID du Payment Link configuré côté serveur ; aucun
   plan fourni par le navigateur n'est accepté.
3. Si un compte OAuth portant l'email vérifié existe, `users.plan` passe à
   `team` ou `cabinet`. Sinon, une attribution en attente est conservée et ne
   peut être réclamée que par le compte authentifié de même email.
4. `invoice.payment_failed`, un abonnement inactif ou supprimé ramène le compte
   à `free`. Le Pilote est journalisé sans créer d'abonnement mensuel.

Variables serveur uniquement : `STRIPE_WEBHOOK_SECRET`, `STRIPE_MODE` (exactement
`test` ou `live`),
`STRIPE_PAYMENT_LINK_TEAM_ID`, `STRIPE_PAYMENT_LINK_CABINET_ID`,
`STRIPE_PAYMENT_LINK_PILOT_ID`. Une valeur absente ou un mode différent de
l’événement fait échouer le traitement en mode fermé.

Avant d’activer les comptes ou le checkout, il reste obligatoire de gérer et
tester l’ordre des événements Stripe, les abonnements multiples, la révocation
des organisations et les quotas serveur. Les interrupteurs publics ne doivent
passer à `true` qu’après cette validation et la complétion des informations
légales/fiscales.

Le plan Free public garde **5 lots / jour**. Team / Cabinet = lots illimités dans l’UI.

### Test de liaison paiement → licence

Pour chaque plan en mode test :

1. effectuer un paiement avec un email de test distinct ;
2. vérifier le paiement dans Stripe (montant, devise, récurrence, email) ;
3. créer/ouvrir le même compte OAuth dans BIMCHECK-Rename ;
4. vérifier que le webhook a provisionné `users.plan` dans Convex ;
5. vérifier dans `/account` que la source est `cloud`, puis dans `/app` que la
   limite Free n’est plus active ;
6. repasser `users.plan` à `free` et vérifier que la limite revient.

Tant que l'authentification OAuth reste désactivée, les droits restent en attente
et le parcours public conserve le plan Free. Le domaine technique
`bimcheck-rename.vercel.app` reste secondaire ; les retours Stripe pointent
uniquement vers le domaine canonique.

## Webhook présent dans le code, mais non ouvert en production

Le webhook test écoute :
`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
`customer.subscription.updated` et `customer.subscription.deleted`. Les IDs
d'événement sont conservés pour l’idempotence. Aucun numéro de carte,
adresse de facturation ou document client n'est stocké par l'application.

## TVA

Activer Stripe Tax si assujetti ; sinon mentions « hors taxes / non assujetti » sur factures.
