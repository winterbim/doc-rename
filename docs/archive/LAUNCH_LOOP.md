# BimDoc Renamer — Revenue Loop

Objectif immédiat : transformer un essai gratuit en réservation du pilote BIM
payant à 149 CHF, puis convertir les pilotes réussis en Pro ou Team.

## Loop 1 — Moment de valeur vers pilote payant

Hypothèse : un utilisateur est le plus réceptif juste après avoir renommé un lot
et vu les nouveaux noms. Le produit doit alors proposer le pilote payant, pas
seulement afficher un toast technique.

Implémenté :

- Free limité à 3 lots/jour.
- CTA Pro dans la barre d'action quand l'utilisateur approche la limite.
- Bandeau post-renommage dans l'app : nombre de fichiers renommés + pilote 149 CHF.
- Page `/pilot` orientée réservation payante manuelle si Stripe n'est pas branché.

Signal à suivre manuellement :

- Nombre de personnes qui cliquent `/pilot` après `/app`.
- Nombre d'emails de réservation pilote.
- Nombre de pilotes qui deviennent Pro/Team.

## Routine quotidienne

1. Envoyer 20 messages ciblés à BIM Managers, coordinateurs BIM, BE structure/MEP.
2. Lien direct à envoyer : `https://doc-rename-saas.vercel.app/app`.
3. Demander un test sur lot non confidentiel, puis renvoyer vers `/pilot`.
4. Répondre vite avec lien de paiement manuel ou facture.
5. Noter dans un tableur : contact, source, volume mensuel, objection, statut.

## Message court LinkedIn / email

Bonjour,

Je lance BimDoc Renamer, un outil local-first pour préparer des lots de
livrables BIM à une convention ISO 19650 / SIA / BEP avant dépôt CDE.

Vous pouvez tester sans compte ici :
https://doc-rename-saas.vercel.app/app

Les fichiers restent dans le navigateur. Si le test vous fait gagner du temps,
je propose un pilote BIM 14 jours à 149 CHF : onboarding 30 min, reproduction
de votre convention et test sur un lot non confidentiel.

## Prochain loop recommandé

Brancher `NEXT_PUBLIC_STRIPE_LINK_PILOT` dès que le Payment Link Stripe 149 CHF
existe. Le site passera alors automatiquement du paiement manuel au checkout
hébergé Stripe.
