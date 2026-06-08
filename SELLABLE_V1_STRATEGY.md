# BimDoc Renamer — stratégie V1 vendable

Date : 2026-06-04

## Diagnostic

BimDoc Renamer ne doit pas se vendre comme un remplaçant d’Autodesk Docs, ACC ou Plannerly. Autodesk Docs sait déjà créer des naming standards, y compris depuis un modèle ISO 19650, et les appliquer à des dossiers. Autodesk documente aussi l’import/export XLSX de naming standards et le support Desktop Connector pour ces règles.

Le créneau vendable est plus étroit et plus fort : préparer, corriger et renommer les lots avant dépôt CDE, sans upload, sans compte obligatoire, sans macro Excel fragile. Le message produit doit rester : “préflight local pour livrables BIM”.

## Positionnement

**Phrase courte**

Renommer et prévalider des lots de livrables BIM avant dépôt CDE, en local dans le navigateur.

**Ne pas promettre**

- Certification ISO 19650.
- Remplacement d’une CDE.
- Modification du contenu RVT, IFC ou DWG.
- Conformité automatique à tous les BEP.

**Promettre**

- Noms propres, homogènes et exportables.
- Import CSV / Excel des émetteurs, lots et conventions.
- ZIP final prêt à déposer.
- Traitement local vérifiable dans l’onglet Réseau.

## Client cible V1

1. BIM Manager ou coordinateur BIM en agence / BET de 10 à 80 personnes.
2. Équipe qui livre souvent des lots PDF, DWG, IFC, DOCX ou ZIP vers Autodesk Docs, Trimble Connect, Kroqi ou CDE interne.
3. Douleur actuelle : renommage manuel, macro Excel maison, erreurs avant dépôt, conventions différentes par projet.

## Offre commerciale

Garder l’offre simple pendant la beta :

- Free : usage ponctuel, preuve produit, sans compte.
- Pro : 19,99 CHF / mois, lots illimités, conventions sauvegardées, support email.
- Team : 34,90 CHF / mois pour 3 utilisateurs, conventions partagées, onboarding 30 min.
- Entreprise : devis uniquement, SSO/DPA/on-premise quand 3 clients Team demandent réellement ces garanties.

Ne pas construire Stripe, comptes équipe et SSO avant d’avoir au moins 3 pilotes payants. Vendre d’abord par facture ou lien manuel.

## Plan 30 Jours

### Semaine 1 — rendre la demo irréprochable

- Garder le wording public sur BimDoc Renamer partout.
- Ajouter un jeu de fichiers demo téléchargeable : 10 noms sales -> 10 noms propres.
- Ajouter une checklist “avant dépôt CDE” dans `/iso-19650`.
- Capturer une vidéo courte : import lot, convention, preview, export ZIP.

### Semaine 2 — convertir les premiers utilisateurs

- Ajouter un CTA “Recevoir le modèle de convention” avec email.
- Ajouter un bouton “Demander l’accès Team” dans `/app` quand un utilisateur exporte un ZIP.
- Préparer un PDF one-pager : problème, capture, local-first, prix, contact.
- Contacter 30 BIM managers / coordinateurs BIM avec un cas concret, pas une promesse générique.

### Semaine 3 — vendre des pilotes

- Proposer un pilote 14 jours + onboarding 30 min.
- Demander leur convention réelle et l’importer pendant l’appel.
- Mesurer : temps avant/après, nombre de fichiers, erreurs évitées.
- Transformer les meilleurs retours en 2 citations anonymisées.

### Semaine 4 — stabiliser la V1 payante

- Ajouter sauvegarde/export de conventions par projet.
- Ajouter compatibilité XLSX plus proche des exports Autodesk quand le format est confirmé chez un client.
- Ajouter une page `/security` orientée acheteur : local-first, CSP, audit prod, absence d’upload fichier.
- Mettre en place un suivi simple : demandes demo, exports ZIP, erreurs import, activation Pro.

## KPIs à suivre

- 10 appels utilisateurs qualifiés.
- 3 pilotes payants.
- 1 équipe qui réutilise l’outil sur un deuxième projet.
- Temps de renommage réduit d’au moins 50 % sur un lot réel.
- 0 fichier envoyé au backend pendant le flux de renommage.

## Risques

- Autodesk Docs couvre déjà une partie du besoin : éviter de vendre “ISO 19650 naming” seul.
- Les clients veulent souvent une convention propre avant un outil : vendre l’onboarding comme partie du produit.
- Le local-first est un avantage sécurité, mais aussi une limite pour collaboration et sauvegarde cloud : assumer cette limite en V1.

## Sources Consultées

- Autodesk Docs — Create Naming Standards : https://help.autodesk.com/cloudhelp/ENU/Docs-Files/files/file-naming-standard/Set_Up_Naming_Standard.html
- Autodesk BIM 360 — Naming Standard Template : https://help.autodesk.com/view/BIM360D/ENU/?guid=Naming_Standard_Template
- Autodesk Drive — Naming Standards / Desktop Connector : https://help.autodesk.com/view/DRIVE/ENU/?guid=File_Naming_Standard_Docs
- Plannerly pricing : https://plannerly.com/pricing
