# DOC-RENAME — Plan SaaS Professionnel

Date: 2026-05-20  
Statut: document de cadrage, aucune modification technique incluse

## Objectif

Transformer DOC-RENAME en SaaS professionnel vendable, deploye sur Vercel, avec
une base produit fiable, securisee, testee et juridiquement mieux protegee.

Le principe central du produit doit rester:

> Les fichiers de l'utilisateur restent dans son navigateur. Le serveur ne
> stocke que les comptes, abonnements, preferences, modeles et metadonnees
> necessaires au service.

Ce positionnement est important pour vendre a des professionnels qui manipulent
des documents confidentiels.

## Positionnement recommande

DOC-RENAME doit etre presente comme un outil professionnel de renommage et
d'organisation documentaire par convention metier.

Cible prioritaire recommandee pour la V1 commerciale:

- BIM / construction
- bureaux d'etudes
- architectes
- entreprises generales
- coordinateurs BIM
- equipes qui preparent des livrables CDE, DOE, plans, rapports et ZIP

Promesse claire:

> Renommez et exportez des lots de documents selon une convention propre,
> rapidement, sans envoyer vos fichiers sur un serveur.

## Etat actuel important

L'application est deja structuree comme une app Next.js deployable sur Vercel:

- racine deployable: `web/`
- framework: Next.js
- hebergement cible: Vercel
- route principale outil: `/app`
- page marketing: `/`
- page confidentialite: `/privacy`
- traitement fichiers local navigateur
- tests unitaires deja presents
- securite HTTP deja partiellement configuree
- telemetry conditionnelle, desactivee sans variables d'environnement
- licence proprietaire deja presente dans `LICENSE`

## Regles de travail obligatoires

Chaque changement SaaS doit suivre ces regles.

1. Garder l'application deployable dans `web/`.
2. Ne jamais envoyer les fichiers, blobs, contenus PDF/DOCX/images/ZIP vers un backend sauf decision explicite.
3. Ne pas collecter de contenu fichier dans Sentry, PostHog, logs, analytics ou support automatique.
4. Ajouter les changements par petites etapes testables.
5. Mettre a jour les tests et la documentation quand une integration production est ajoutee.
6. Verifier localement avant de deployer.
7. Utiliser une branche de travail et une Pull Request pour chaque lot important.
8. Ne jamais mettre de secret dans le code ou dans le depot.

## Protection de l'idee et licence

### Situation actuelle

Le projet contient deja une licence proprietaire:

- `LICENSE`: interdit usage, copie, modification, distribution, hebergement,
  commercialisation et travaux derives sans autorisation ecrite.
- `package.json`: `"private": true` et `"license": "UNLICENSED"`.
- `web/package.json`: `"private": true` et `"license": "UNLICENSED"`.

Cette base est coherente avec l'objectif: ne pas ouvrir le code.

### Point juridique important

Une licence protege surtout le code, la documentation, les assets et
l'expression concrete du produit. Elle ne protege pas totalement une idee
generale comme "un SaaS pour renommer des fichiers".

Pour mieux proteger DOC-RENAME, il faut combiner plusieurs protections:

- garder le depot distant prive;
- conserver la licence proprietaire;
- faire signer un NDA ou contrat de prestation aux intervenants externes;
- proteger la marque avec une recherche de disponibilite puis depot de marque;
- acheter les noms de domaine utiles;
- limiter l'acces aux secrets Vercel, Stripe, Sentry, PostHog;
- eviter de publier les details internes du produit dans des depots publics;
- documenter la paternite: commits, changelog, captures, dates de release.

### Licence recommandee

Conserver une licence proprietaire, pas MIT, pas Apache, pas GPL.

Action recommandee:

- garder `LICENSE` en licence proprietaire;
- verifier que le nom du titulaire est juridiquement correct;
- ajouter un contact commercial officiel;
- demander validation a un avocat si le produit commence a generer du revenu.

### Marque recommandee

Avant de vendre massivement:

1. Verifier si `DOC-RENAME`, `BimDoc Renamer` ou le nom final choisi est disponible.
2. Reserver le domaine principal.
3. Verifier les marques existantes.
4. Deposer la marque dans les pays/regions cibles si le budget le permet.

Ne pas utiliser le symbole `®` tant que la marque n'est pas officiellement
enregistree dans la juridiction concernee.

Sources utiles:

- U.S. Copyright Office: le copyright ne protege pas les idees, procedures,
  methodes ou systemes, mais peut proteger leur expression concrete.
  https://www.copyright.gov/help/faq/faq-protect.html
- Documentation de forge logicielle: sans licence open source, le droit d'auteur par defaut reserve
  les droits au titulaire; personne ne recoit automatiquement le droit de
  reproduire ou distribuer le code.
- USPTO Trademark Basics: une marque sert a proteger un nom, logo ou signe
  utilise pour identifier des produits ou services.
  https://www.uspto.gov/trademarks/basics

Ce document n'est pas un avis juridique. Pour une vraie vente B2B, faire valider
la licence, les CGU, la confidentialite et la marque par un professionnel du droit.

## Roadmap SaaS recommandee

### Phase 1 — Stabilisation produit

But: rendre l'outil fiable avant d'ajouter paiement et comptes.

Travaux:

- corriger les bugs de renommage;
- garantir sorties en majuscules sans accents;
- fiabiliser export ZIP;
- tester les champs disponibles et profils metier;
- verifier import ZIP et archives;
- verifier les viewers fichier;
- ameliorer messages d'erreur;
- eviter les regressions par tests unitaires.

Definition of Done:

- `npm run lint` passe;
- `npm test` passe;
- `npm run build` passe;
- aucun fichier utilisateur n'est envoye au serveur.

### Phase 2 — UX professionnelle

But: rendre l'outil comprehensible et vendable.

Travaux:

- rendre les actions principales plus claires;
- ajouter un onboarding court;
- ajouter des exemples metier;
- simplifier les panneaux secondaires;
- afficher clairement le statut de chaque fichier;
- expliquer la confidentialite sans bloquer l'usage;
- ajouter une page d'aide;
- ajouter une page de contact/support.

Definition of Done:

- un nouvel utilisateur comprend quoi faire en moins d'une minute;
- l'interface reste utilisable sur desktop et mobile;
- les erreurs sont actionnables.

### Phase 3 — Comptes utilisateurs

But: permettre a un client de creer un compte et de retrouver ses parametres.

Travaux possibles:

- choisir un fournisseur d'authentification;
- ajouter inscription / connexion / deconnexion;
- stocker preferences et modeles;
- ne pas stocker les fichiers;
- ajouter suppression de compte;
- documenter les variables d'environnement.

Donnees autorisees cote serveur:

- utilisateur;
- email;
- plan;
- modele de nomenclature;
- preferences;
- historique d'abonnement;
- metadonnees support.

Donnees interdites cote serveur sauf decision explicite:

- fichiers originaux;
- fichiers renommes;
- contenu ZIP;
- contenu PDF/DOCX/images/tableurs;
- extraits de fichiers dans logs ou analytics.

### Phase 4 — Paiement et plans

But: vendre le service.

Fournisseur recommande: Stripe.

Plans simples recommandes:

- Free: limite de fichiers par session, modeles limites;
- Pro: fichiers illimites, modeles illimites, export avance;
- Team: modeles partages, membres, facturation equipe.

Regles:

- les limites doivent etre claires;
- l'utilisateur doit pouvoir tester sans friction;
- ne pas mettre trop de plans au lancement;
- facturation mensuelle et annuelle;
- page pricing simple.

### Phase 5 — Production Vercel

But: deployer proprement et eviter les erreurs de production.

Vercel:

- garder `rootDirectory = web`;
- branch production: `main`;
- previews automatiques sur branches/PR;
- variables d'environnement separees preview/production;
- protection des secrets;
- domaine final configure;
- redirections et headers verifies.

Variables potentielles:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TELEMETRY_ENABLED`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- variables auth selon fournisseur choisi

Ne jamais commiter ces valeurs.

### Phase 6 — Observabilite et support

But: savoir quand l'app casse sans violer la confidentialite.

Travaux:

- Sentry pour erreurs applicatives;
- analytics minimal sans capture de contenu fichier;
- formulaire support;
- export manuel de journal local;
- page statut ou monitoring uptime;
- alertes sur erreurs critiques.

Regles de confidentialite:

- pas de contenu de fichier dans les events;
- pas de blob;
- pas de nom complet de fichier si cela peut etre sensible;
- pas d'enregistrement de session par defaut;
- masquer textes et attributs en analytics.

### Phase 7 — Legal et commercial

But: vendre sans fragilite juridique evidente.

Documents a preparer:

- Conditions Generales d'Utilisation;
- Politique de Confidentialite;
- Politique cookies si analytics;
- Mentions legales;
- DPA si vente B2B europeenne;
- page securite/confidentialite;
- modele de contrat ou bon de commande;
- politique de remboursement.

Points a valider:

- statut juridique de l'entreprise;
- TVA/facturation;
- Stripe Tax si necessaire;
- marque;
- domaine;
- support client;
- procedure de suppression de compte et donnees.

## Checklist avant premiere vente

- [ ] Depot distant prive.
- [ ] Licence proprietaire conservee.
- [ ] Nom de marque choisi.
- [ ] Domaine achete.
- [ ] Page marketing claire.
- [ ] Page pricing claire.
- [ ] Politique de confidentialite adaptee.
- [ ] CGU preparees.
- [ ] App deployee sur Vercel production.
- [ ] Variables production configurees.
- [ ] Build production valide.
- [ ] Tests unitaires valides.
- [ ] Tests e2e critiques valides.
- [ ] Audit dependances production lance.
- [ ] Sentry configure sans contenu fichier.
- [ ] Analytics configure sans contenu fichier.
- [ ] Stripe configure.
- [ ] Limites Free/Pro appliquees.
- [ ] Sauvegarde des modeles utilisateur.
- [ ] Suppression compte/donnees prevue.
- [ ] Support/contact disponible.

## Commandes de verification

Depuis la racine du depot:

```bash
npm run lint
npm test
npm run build
```

Avant une release importante:

```bash
npm run test:e2e
npm --prefix web run audit:prod
```

Depuis `web/`, la verification complete existante:

```bash
npm run verify
```

## Processus de changement recommande

Pour chaque amelioration SaaS:

1. Creer une branche dediee.
2. Decrire l'objectif en une phrase.
3. Modifier peu de fichiers.
4. Ajouter ou adapter les tests.
5. Lancer les checks.
6. Relire les donnees collectees pour verifier qu'aucun fichier utilisateur ne sort du navigateur.
7. Deployer en preview Vercel.
8. Tester manuellement le flux critique.
9. Fusionner vers `main`.
10. Verifier le deploiement production.

## Ordre de travail recommande

Ordre pragmatique pour les prochaines etapes:

1. Audit fonctionnel complet de l'application actuelle.
2. Corrections UX et fiabilite restantes.
3. Page marketing orientee vente.
4. Page pricing.
5. Authentification.
6. Stockage cloud des modeles uniquement.
7. Stripe.
8. Limites Free/Pro.
9. Observabilite production.
10. Documents juridiques.
11. Lancement beta privee.
12. Premiere vente.

## Decision a prendre avant de coder

Avant d'ajouter comptes et paiement, il faut choisir:

- nom commercial final;
- cible principale de la V1;
- fournisseur auth;
- base de donnees;
- strategie Free/Pro;
- nom de domaine;
- pays de vente prioritaire;
- niveau de support offert.

Sans ces decisions, le risque est de construire trop large et de ralentir la
mise en vente.
