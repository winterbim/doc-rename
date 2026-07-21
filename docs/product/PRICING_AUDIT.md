# Audit tarification — BIMCHECK-Rename (2026-07-21)

## Verdict

**Les tarifs précédents (Team 49 €, Cabinet 149 €, Pilote 149 €) étaient trop élevés
pour le stade et la valeur réellement livrée.** Risque principal : freiner la
conversion Free → payant et faire fuir les SMB / freelances qui sont le cœur
accessible du produit.

## Contexte produit (contraintes honnêtes)

| Fait | Implication pricing |
|------|---------------------|
| Free fait déjà le renommage local + export ZIP | Le paid ne vend **pas** le renommage, il vend **volume + collab + support** |
| Pas d’études de cas clients publiques | WTP bas jusqu’à preuve ROI |
| Provision manuelle, pas d’auto-billing mature | Prix doit être simple, bas, self-serve friendly |
| Alternative = Excel / script / temps interne | Plafond psychologique fort sous ~30 €/mois pour l’entrée |
| CDE (ACC, etc.) coûtent bien plus cher | On n’est **pas** comparable à un CDE : ne pas pricer comme un CDE |

## Ancien vs recommandé

| Offre | Avant | Après (base EUR) | Raison |
|-------|-------|------------------|--------|
| Free | 3 lots/j | **5 lots/j** | Plus d’habitude d’usage, moins de churn Free précoce |
| Team | 49 €/mois | **19 €/mois** | Sous le seuil 20 € ; flat fee équipe (pas per-seat punitif) |
| Cabinet | 149 €/mois | **49 €/mois** | 2,5× Team, multi-équipes + support — sans features fantômes |
| Pilote | 149 € | **49 €** one-shot | Baisse la friction premier contact ; 149 € = quasi un CDE lite |

## Value metric

**Ce qu’on monétise vraiment :**
1. Lots illimités (habitude quotidienne)
2. Sync / partage de convention (valeur équipe)
3. Support / onboarding (Cabinet + pilote)

**Ce qu’on ne monétise pas :** le fichier lui-même (local-first, coût marginal ~0).

## Psychologie & conversion

- **Ancre basse** : 19 € pour Team = « moins cher qu’1h de freelance »
- **Cabinet 49 €** = ancre haute raisonnable, pas 149 € qui fait paniquer le SMB
- **Devises** : affichage EUR / CHF / USD (conversion indicative, base EUR)
- **Vérité** : prix affichés = prix public ; pas de features non livrées

## Risques acceptés

- ARPU plus bas → compensé par volume de conversion
- Early adopters à 49 € Team (s’il y en a) : grandfather possible plus tard
- Stripe Payment Links : **recréer les prix** aux nouveaux montants

## Checkpoint

Revoir après **10 paiements** ou **90 jours** : si conversion Free→Team > 8 % et
churn bas, tester +20–30 % sur nouveaux clients seulement.
