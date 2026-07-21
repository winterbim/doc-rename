# DOC-RENAME — Analyse de marché + refonte BIM V1 + intégration grands comptes

Date : 2026-05-20
Auteur : analyse assistée, données croisées (Insee, S3D, virtuemarketresearch, Plannerly, Autodesk, BIMcollab, Cerema)
Statut : document de stratégie produit. Ne contient aucune modification de code.

---

## Partie 1 — Analyse de marché réelle (CH + FR)

### 1.1 Chiffres vérifiables

| Donnée | Valeur | Source |
|---|---|---|
| Marché européen BIM 2025 | **2,44 Md USD** | virtuemarketresearch |
| Marché européen BIM 2030 (projection) | **3,78 Md USD** | virtuemarketresearch, +9,2 %/an |
| Adoption BIM France (au moins 1 projet) | **73 %** | S3D Engineering 2025 |
| Adoption BIM bureaux d'études FR | **82 %** | S3D Engineering 2025 |
| Adoption BIM architectes FR | **78 %** | S3D Engineering 2025 |
| Entreprises d'architecture FR | **77 537** | INSEE / OMPL |
| Taille moyenne agence FR | **3 personnes** | INSEE |
| Agences FR < 5 salariés | **60 %+** | INSEE |
| Marchés publics exigeant ISO 19650 | en progression continue, devenu « incontournable » dans nucléaire, énergie, grands tertiaires | Cerema, BuildingSmart France |

Le marché est réel, en croissance à 9 %/an, et la pression normative (NF EN ISO 19650) pousse les cahiers des charges publics et grands comptes vers la conformité.

### 1.2 TAM, SAM, SOM honnêtes

**TAM (Total Addressable Market) — Suisse romande + France**
Cible large : tout acteur AEC manipulant des livrables documentaires.

- France : 77 537 architectes + ~30 000 bureaux d'études/ingénierie (codes NAF 7112) + ~5 000 entreprises générales BIM-actives ≈ **110 000 entreprises**.
- Suisse romande : ~3 500 bureaux d'architecture + ingénierie SIA/USIC.
- **TAM ≈ 113 500 entreprises.**
- À 240 €/an moyen pondéré (mix Pro + Team) → **TAM théorique ≈ 27,2 M€ ARR**.

**SAM (Serviceable Available Market) — sous-segment réellement adressable par un solo founder**

- Filtre 1 : utilise déjà le BIM dans ≥ 1 projet → × 73 % ≈ 82 800 entreprises.
- Filtre 2 : taille 5–80 salariés (assez gros pour avoir un irritant nommage, assez petit pour décider vite) → × ~25 % ≈ 20 700 entreprises.
- Filtre 3 : projet récent avec exigence ISO 19650 ou SIA documentée → × ~40 % ≈ 8 300 entreprises.
- **SAM ≈ 8 300 entreprises.**
- À 240 €/an → **SAM ≈ 2 M€ ARR.**

**SOM (Serviceable Obtainable Market) — réaliste à 36 mois bootstrap solo**

- Pénétration crédible solo founder, sans levée, sans équipe sales : 1–2 %.
- **SOM = 80–160 clients payants, soit 19–38 k€ ARR à 24 mois, 50–100 k€ ARR à 36 mois.**

C'est un business indépendant honnête. Pas un SaaS « venture-scale ». Anyone qui vous vend autre chose ment.

### 1.3 Cartographie concurrentielle

| Concurrent | Catégorie | Force | Faiblesse | Risque pour DOC-RENAME |
|---|---|---|---|---|
| **Plannerly** | Plateforme BIM management complète, File Manager + ISO 19650 auto-naming | 100 000+ équipes, 100+ pays, ACC/BIM360 integration, ISO 19650 60-day program, SOC 2 / ISO 27001 | Vendor lock-in, prix Enterprise opaque, onboarding lourd | **ÉLEVÉ — concurrent frontal** sur l'auto-naming ISO 19650 |
| **Autodesk Docs / ACC** | CDE intégré à l'écosystème Revit | Standard de facto chez grands comptes, naming template natif depuis 2021 | Verrou Autodesk, cher, complexe pour PME | **MOYEN** — capture les gros, laisse les PME |
| **Trimble Connect** | CDE openBIM, IFC-first | Open standards, intégration Tekla | Naming moins automatisé qu'ACC | FAIBLE |
| **BIMcollab** | BCF / issue management | Niche bien définie (clash, issues) | Hors scope renommage | **NUL — pas concurrent** |
| **Kroqi** | CDE français Plan BIM 2022 | Soutien étatique, gratuit pour public | UX vieillissante, peu d'auto-naming | FAIBLE |
| **Bulk Rename Utility / Advanced Renamer / PowerToys PowerRename** | Outils Windows génériques | Gratuits, puissants regex | Aucune connaissance BIM, pas d'ISO 19650, pas de profils métier, pas de CSV imports d'entités | **NUL** — c'est ce que les gens utilisent FAUTE DE MIEUX |
| **Cooperlink OpenDMS** | Initiative convention commune belge | Standard ouvert | Pas un produit, juste une norme | NUL |
| **Macros Excel internes** | Solution maison BIM Manager | Gratuit, sur-mesure | Casse à chaque mise à jour Office, intransmissible | **NUL** — c'est le statu quo à remplacer |

**Conclusion concurrentielle**

Il n'y a qu'**un seul vrai concurrent frontal : Plannerly**. Il est gros, financé, intégré ACC/BIM360, certifié SOC 2. Vous ne gagnerez pas en l'attaquant de face. Vous gagnez sur 4 angles où il est faible :

1. **Pas de compte requis pour essayer** — DOC-RENAME tourne dans le navigateur. Plannerly impose sign-up.
2. **Local-first** — vos fichiers ne quittent jamais le poste. Plannerly = SaaS, données en cloud AWS US/EU. C'est un argument décisif pour avocats, défense, nucléaire, banques.
3. **Outil unique, pas une plateforme** — DOC-RENAME ne demande pas d'apprendre une nouvelle façon de travailler. Il fait UNE chose bien.
4. **Prix** — Plannerly Individual 30+ USD/mois, Team 60+ USD/mois. DOC-RENAME à 19,99 CHF / 19,99 € est moitié moins cher.

### 1.4 Signaux d'achat exploitables

Acteurs **prêts à acheter maintenant** (à viser en priorité) :

- Mentionnent ISO 19650 dans leurs offres d'emploi publiques (LinkedIn Jobs filtre).
- Recrutent un BIM Manager ou BIM Coordinator (signal d'investissement BIM en cours).
- Répondent à un AO public récent avec exigence BIM (BOAMP France, simap.ch Suisse).
- Postent sur LinkedIn « convention de nommage », « livraison DOE », « CDE » dans les 90 derniers jours.
- Sont listés comme membres récents de BuildingSmart France, BIM Romandie, SIA.

### 1.5 Verdict de marché

Le marché existe, il est qualifié, il est en croissance. La douleur du renommage est universelle dans le métier BIM. **Mais** : elle n'est pas en haut de la liste des urgences pour la majorité (les BIM Managers se battent d'abord pour la coordination 3D, la résolution des clashs, et la production des EIR/BEP). DOC-RENAME doit se positionner comme **l'outil qui termine le job** : le dernier kilomètre avant dépôt CDE. Pas comme une plateforme de management BIM.

---

## Partie 2 — Audit critique de la landing + vidéo actuelles

### 2.1 Landing actuelle (`web/app/page.tsx`) — diagnostic

| Élément | Verdict | Raison |
|---|---|---|
| Eyebrow « Multi-métiers · Local-first · Import CSV/Excel » | **MAUVAIS** | « Multi-métiers » est un défaut, pas une qualité. Un acheteur BIM cherche un outil BIM, pas un couteau suisse. |
| H1 « Le moteur de conventions documentaires » | **FAIBLE** | Trop abstrait. Aucun mot du vocabulaire BIM. Un BIM Manager ne tape pas « moteur de conventions documentaires » dans Google. |
| Lead « ne renomme pas seulement des plans BIM. Il applique des règles de nommage propres à chaque métier : finance, RH, santé, juridique, industrie, immobilier, construction ou convention maison » | **MAUVAIS** | Liste 7 métiers en 1 phrase = aucun n'est servi. Tue le SEO BIM, tue la conversion. |
| « Plus contrôlable qu'une IA opaque, plus léger qu'une GED » | **HORS-SUJET** | L'acheteur ne compare pas DOC-RENAME à une IA. Il le compare à son script PowerShell, à PowerRename, ou à Plannerly. |
| Profile-strip 7 chips (BIM, Finance, RH, Juridique, Santé, Industrie, Convention maison) | **MAUVAIS** | Visuellement = produit non-positionné. Premier réflexe de l'acheteur BIM : « ce n'est pas pour moi, c'est un truc générique ». |
| Mention « ISO 19650 », « SIA 2051 », « CDE », « DOE », « livrable » | **ABSENTE** | Tout le vocabulaire que la cible utilise au quotidien est manquant. |
| Témoignages clients | **ABSENTS** | Aucune preuve sociale. |
| Captures écran réelles | **ABSENTES** | Seulement « Avant/Après » fictif. |
| Comparatif vs concurrents (Plannerly, ACC, scripts maison) | **ABSENT** | L'acheteur ne sait pas pourquoi vous plutôt qu'eux. |
| Page de sécurité dédiée (`/security`) | **ABSENTE** | Or c'est votre seul vrai différenciateur. |
| FAQ | Présente | OK |
| Pricing CHF avec mention « Accès privé temporaire » dans Twitter card | **CONFUS** | On ne sait pas si c'est ouvert ou fermé. |

**Diagnostic global de la landing : C-.**

Elle est techniquement propre, accessible, sémantique correcte, dark/light gérés. Mais elle n'a pas de cible. C'est une page d'outil personnel, pas une page de vente B2B BIM.

### 2.2 Vidéo actuelle (`video/`) — diagnostic

Côté technique : excellent. Remotion, 4 formats (16:9, 9:16, master + short), 100 % code, pas d'assets externes, garde-fous éditoriaux honnêtes. Le système visuel reprend le shell de l'app. Rien à jeter sur la production.

Côté message : même problème que la landing.

| Scène | Verdict | Raison |
|---|---|---|
| 1 Problem (0–10 s) | OK | Universel, fonctionne pour tous métiers. |
| 2 Solution (10–20 s) | FAIBLE | « Renommage documentaire professionnel » — trop vague. |
| 3 Import (20–32 s) | OK | Montre l'app réelle. |
| 4 Nomenclature (32–48 s) | OK | Démontre la valeur. |
| **5 BIM (48–60 s)** | OK mais trop tard | La cible BIM doit voir « pour BIM » dans les 5 premières secondes, pas à 48 s. |
| **6 Others Finance/RH/Juridique (60–72 s)** | **À SUPPRIMER en V1** | Dilue le message. La V1 commerciale est BIM-only. |
| 7 Export (72–82 s) | OK | |
| 8 Privacy (82–90 s) | OK mais trop tard | Le local-first doit être martelé tout du long, pas en outro. |
| 9 CTA (90–94 s) | OK | |

**Diagnostic vidéo : C+ pour message multi-métiers, refactorisable rapidement.**

La timeline est paramétrée dans `src/lib/tokens.ts > SCENE_FRAMES` et `src/lib/script.ts > subtitles`. **Modifier 2 fichiers suffit pour produire une version BIM-only sans toucher au reste.** C'est un cadeau de l'architecture du projet vidéo.

### 2.3 Verdict combiné

Ce n'est **pas** nul. C'est sous-positionné. Tout est refactorable en 5–10 jours de travail focalisé. Conclusion : on garde l'infrastructure (Remotion, design system, structure Next.js), on remplace le message et la hiérarchie pour cible BIM uniquement.

---

## Partie 3 — Refonte BIM V1 (« BimDoc Renamer » ou similaire)

### 3.1 Décision de positionnement V1

**Nom commercial recommandé pour la V1 :** garder `DOC-RENAME` comme code projet, mais communiquer sous le nom **« BimDoc Renamer »** (domaine déjà utilisé : `bimdoc-renamer.vercel.app`). Plus tard, si succès, déposer la marque.

**Promesse en 1 phrase :**

> Renommez et exportez vos lots de livrables BIM à la convention ISO 19650 ou SIA 2051 en moins de 60 secondes, sans envoyer vos fichiers à un serveur.

**Cible explicite :** BIM Manager, BIM Coordinator, Architecte associé, Directeur technique. PME et ETI 5–80 salariés. CH romande + France.

**Concurrents à nommer dans la landing :** Plannerly (« sans l'usine à gaz »), Autodesk Docs (« sans verrou Autodesk »), scripts maison (« sans macro qui casse »).

### 3.2 Suppression visuelle des autres profils en V1

Le code conserve les profils Finance, RH, Santé, Juridique, Industrie, Immobilier, Administratif (ils restent dans `lib/profiles/`), **mais l'UI publique les masque** :

- Landing : aucun mot, aucun chip, aucune mention.
- Vidéo : suppression scène 6 Others.
- Profile picker dans l'app : flag `NEXT_PUBLIC_BIM_ONLY=true` qui n'affiche que le profil BIM.
- SEO `<meta>` : focus 100 % vocabulaire BIM (« ISO 19650 », « SIA », « CDE », « DOE », « convention nommage BIM », « renommage livrable BIM », « bureau d'études »).
- Schema.org Offer : ajouter `targetIndustry: "Architecture, Engineering & Construction"`.

Coût technique : ~1 jour. Un feature flag suffit. **Ne pas supprimer le code des autres profils** — il sera réutilisé en V2 si la V1 BIM réussit.

### 3.3 Refonte landing — copy et hiérarchie

#### Hero (au-dessus du pli)

```
Eyebrow : Pour BIM Managers · ISO 19650 / SIA · Local-first

H1 : Renommez vos livrables BIM avant dépôt CDE — sans envoyer un seul
     fichier en ligne.

Lead : Importez un lot de plans, de PDF de notes ou un ZIP de DOE.
       Composez votre convention ISO 19650, SIA 2051 ou maison.
       Exportez un ZIP propre prêt à déposer dans Autodesk Docs,
       Trimble Connect, Kroqi ou votre CDE interne. Tout reste dans
       votre navigateur.

CTA primaire : Essayer maintenant — sans compte
CTA secondaire : Voir la démo 90 s

Sous-CTA : Aucun fichier ne quitte votre poste. Vérifiable dans
            l'onglet Réseau de votre navigateur.
```

Pourquoi ça marche :
- Le mot « BIM » apparaît 2 fois en hero. SEO + clarté immédiate.
- « ISO 19650 » et « SIA » nommés explicitement → l'acheteur reconnaît son monde.
- « Autodesk Docs / Trimble Connect / Kroqi » nommés → vous parlez sa langue, vous ne le faites pas changer de workflow.
- « Sans compte » + « Aucun fichier ne quitte votre poste » → réponse aux 2 frictions principales (sign-up + IT/RGPD).

#### Section 1 — Le problème (avec preuve)

```
KICKER : Le dernier kilomètre du BIM

H2 : 30 minutes par livrable, et une convention qui dérive à chaque
     projet.

Texte : Chaque équipe BIM produit, en fin de phase, des dizaines de
        plans, notes, rapports et exports IFC. Avant dépôt CDE,
        quelqu'un — souvent un coordinateur ou une assistante — passe
        sa journée à renommer manuellement. Le résultat est presque
        toujours non-conforme ISO 19650. Les marchés publics et les
        donneurs d'ordre exigent pourtant cette conformité.

Bloc preuve :
- "BIM utilisé par 73 % des acteurs construction FR" — INSEE / S3D 2025
- "ISO 19650 incontournable en marché public" — Cerema
- "Conventions BIM internes : majorité maintenue à la main" — observation terrain
```

#### Section 2 — Le produit (démo en place)

```
KICKER : Comment ça marche

H2 : Trois actions, pas une plateforme à apprendre.

Étape 1 — Importez
Glissez votre dossier projet, votre ZIP DOE, ou des fichiers
individuels. PDF, DOCX, IFC, DWG, DXF, images, tableurs. Aucun
upload : tout est lu dans votre navigateur.

Étape 2 — Composez votre convention
Choisissez le template ISO 19650, SIA 2051, BIM France, ou créez
votre convention maison. Champs : Projet, Phase, Lot, Type,
Zone, Niveau, Discipline, Révision, Statut. Importez votre table
d'entités CSV/Excel si vous l'avez déjà.

Étape 3 — Contrôlez et exportez
Aperçu Avant/Après ligne par ligne. Corrigez à la main si besoin.
Téléchargez un ZIP propre avec arborescence intacte, prêt pour dépôt
CDE.
```

#### Section 3 — Différenciation (3 colonnes explicites)

```
KICKER : Pourquoi BimDoc Renamer plutôt que…

| | BimDoc Renamer | Plannerly File Manager | Macro Excel maison |
|---|---|---|---|
| Compte requis | Non | Oui | Non |
| Fichiers en ligne | Non — local navigateur | Oui — AWS | Non |
| Templates ISO 19650 | Oui, paramétrables | Oui | Selon écriture |
| Import CSV/Excel d'entités | Oui | Limité | Oui mais fragile |
| Profils métier pré-câblés | BIM (V1) | Multi | Aucun |
| Aperçu Avant/Après | Oui | Oui | Non |
| Onboarding | 0 min | 60 min + appel | N/A |
| Prix | 19,99 € / mois | 30 USD+ / mois | Temps interne |
| Casse à chaque mise à jour | Non | Non | Oui |
```

#### Section 4 — Sécurité (page dédiée + résumé)

```
KICKER : Confidentialité prouvable

H2 : Vérifiez vous-même. Ouvrez l'onglet Réseau.

Liste :
- Le traitement de vos fichiers se fait à 100 % dans votre navigateur.
- Aucune requête sortante quand vous renommez un lot. Vous pouvez le
  voir dans DevTools > Réseau.
- Headers HTTP audités : HSTS preload, X-Frame-Options DENY, CSP
  stricte, Permissions-Policy verrouillée.
- Tests de sécurité automatiques : CodeQL, OWASP ZAP, Lighthouse, en
  CI à chaque commit.
- Pas de tracking par défaut. Sentry / PostHog activables, jamais sur
  le contenu fichier.
- Licence propriétaire, code source non distribué. Audit sur demande
  pour les contrats grands comptes.

CTA : Lire l'audit sécurité complet → /security
```

#### Section 5 — Cas d'usage (3 personas réels)

```
KICKER : Qui s'en sert

Persona 1 — BIM Coordinator agence d'architecture
« Nous livrons 80 fichiers à chaque jalon. La convention maison est dans
un Notion. Avant BimDoc, la coordination passait 4 heures à renommer
avant chaque dépôt. Maintenant : 15 minutes. »

Persona 2 — Bureau d'études MEP
« Nos clients donneurs d'ordre exigent ISO 19650. Notre équipe modélise
en Revit mais le dépôt CDE final est manuel. BimDoc applique la
convention en un clic, sans passer par l'usine à gaz Autodesk. »

Persona 3 — BIM Manager entreprise générale
« Nos sous-traitants envoient des ZIP. Avant intégration dans notre CDE
interne, nous devons re-baptiser. BimDoc tourne en local sur le poste
d'un assistant, sans connexion à notre SI. »
```

(En V1, ces personas sont **fictifs mais réalistes**. Dès qu'une beta est signée, remplacer par un vrai témoignage avec photo et logo.)

#### Section 6 — Pricing simplifié BIM V1

```
KICKER : Tarifs

Free
0 € / mois
- 3 lots de renommage par jour
- 1 convention sauvegardée
- Profils BIM uniquement
- Local-first
- Support communauté
[Essayer sans compte]

Pro — recommandé
19,99 € / mois (TTC, facturé mensuel ou annuel)
- Lots illimités
- Conventions illimitées
- Templates ISO 19650 + SIA pré-câblés
- Import CSV/Excel d'entités
- Export JSON de conventions
- Support email J+1
[S'abonner]

Team
34,90 € / mois (TTC, jusqu'à 3 utilisateurs)
- Tout Pro
- Bibliothèque de conventions partagée
- Onboarding 30 minutes inclus
- Support email J+1
[Contacter]

Entreprise
Sur devis
- SSO Microsoft Entra ID / Okta / Google Workspace
- Déploiement on-premise possible (Docker image)
- Audit de sécurité, DPA, contrat sur mesure
- Support dédié, SLA
- White-label optionnel
[Demander un devis]
```

Note : le « Sur devis » Entreprise n'engage rien tant que la V1 PME n'est pas validée. Il signale juste aux gros comptes que vous êtes ouvert.

#### Section 7 — FAQ ciblée BIM

Questions à câbler (réponses honnêtes) :

1. Est-ce que BimDoc Renamer remplace Autodesk Docs ou Plannerly ?
   → Non. C'est l'outil qui prépare proprement vos lots **avant** dépôt dans votre CDE existant. Compatible avec tous (ACC, Trimble Connect, Kroqi, ProjectWise).

2. Le template ISO 19650 est-il « certifié » ?
   → Non. ISO 19650 n'a pas de certification produit, seulement des certifications organisation. Le template suit le **National Annex UK informatif**, paramétrable champ par champ pour s'adapter à votre BEP.

3. Mes fichiers restent vraiment dans mon navigateur ?
   → Oui, et c'est vérifiable. Ouvrez DevTools > Réseau pendant un renommage : aucune requête sortante de votre contenu. Voir page /security pour l'audit complet.

4. Peut-on importer notre table d'entreprises et de lots existante ?
   → Oui. CSV ou Excel. Vos 84 entreprises et 41 lots par défaut sont des exemples, vous pouvez les remplacer.

5. Et le RVT / DWG / IFC ?
   → BimDoc Renamer renomme les **fichiers**, il ne modifie pas leur contenu interne. Un .rvt ou un .ifc reste valide après renommage. Pour le contenu interne (renommer un objet à l'intérieur du .rvt), il faut Naviate ou Dynamo dans Revit.

6. Quelle conformité RGPD ?
   → Pas de donnée personnelle traitée tant que vous ne créez pas de compte. Avec un compte Pro : email + préférences uniquement, hébergement EU (Vercel Frankfurt). DPA disponible Entreprise.

7. Que se passe-t-il si vous fermez ?
   → Le code source des conventions est exportable en JSON à tout moment. Vous gardez votre travail.

### 3.4 Refonte vidéo — script BIM V1 (94 s ou 60 s)

**Décision : produire une version 60 s BIM-only**, en plus du master 94 s actuel. La 60 s devient la vidéo de landing ; le 94 s devient la démo longue.

Modifications dans `video/src/lib/script.ts` (sous-titres) et `video/src/scenes/` (suppression de SceneOthers, ajout d'une SceneCDE).

#### Storyboard BIM V1 — 60 s

| # | Scène | t (s) | Sous-titre | Visuel |
|---|---|---|---|---|
| 1 | Problem | 0–6 | « Renommer un lot BIM avant dépôt CDE : 30 minutes, et une convention qui dérive. » | Liste de 8 fichiers mal nommés, badge « ? » brick |
| 2 | Solution | 6–12 | « BimDoc Renamer applique votre convention ISO 19650 ou SIA en 60 secondes. » | Logo DR + tagline + chip unique « BIM » |
| 3 | Import | 12–22 | « Importez votre lot. PDF, DOCX, IFC, DWG. Tout reste dans votre navigateur. » | Drop-zone → 6 fichiers détectés |
| 4 | Convention | 22–34 | « Composez votre convention : Projet · Phase · Lot · Type · Zone · Niveau · Révision. » | Champs disponibles → convention active, preview live |
| 5 | Renommage | 34–46 | « Aperçu Avant / Après. Vous corrigez à la main si besoin. » | Panneaux côte à côte, focus sur 1 ligne corrigée |
| 6 | Export CDE | 46–54 | « Export ZIP propre, prêt pour Autodesk Docs, Trimble Connect ou votre CDE. » | ZIP descend dans le coin, icônes ACC + TC + Kroqi |
| 7 | Sécurité | 54–58 | « Aucun fichier ne quitte votre poste. Vérifiable dans DevTools > Réseau. » | Diagramme navigateur → ZIP local, badge cadenas |
| 8 | CTA | 58–60 | « bimdoc-renamer.com — essayer sans compte. » | Fond ink, CTA |

Changements par rapport au script actuel :
- Suppression complète de la scène « Others Finance/RH/Juridique ».
- Mention explicite ISO 19650 / SIA en scène 2 (au lieu de « Renommage documentaire professionnel »).
- Mention explicite des CDE concurrents (ACC, Trimble Connect, Kroqi) en scène 6 — preuve d'écosystème.
- Mention « sans compte » en CTA — argument anti-friction explicite.

Coût technique : modifier `script.ts` (sous-titres), `SCENE_FRAMES` dans `tokens.ts` (timings), supprimer 1 scène, ajouter 1 scène. **2 jours.**

### 3.5 Pages à créer en V1

| Page | Statut actuel | Action V1 |
|---|---|---|
| `/` (landing) | Multi-métiers, à refondre | Refonte BIM-only selon §3.3 |
| `/app` | OK, mais picker affiche 7 profils | Flag `BIM_ONLY` masque les autres profils |
| `/privacy` | OK | Garder, ajouter section « audit ZAP/CodeQL » |
| `/security` | **N'EXISTE PAS** | À créer. Capture DevTools Réseau, liste headers HTTP, lien CodeQL/ZAP, mention CSP, version PDF du rapport |
| `/iso-19650` | N'existe pas | À créer (SEO). Guide « convention nommage ISO 19650 expliquée ». Lead magnet : template JSON prêt à importer. |
| `/sia` | N'existe pas | À créer (SEO Suisse). Guide « convention SIA 2051 expliquée ». |
| `/comparaison/plannerly` | N'existe pas | À créer. Tableau honnête + cas où Plannerly est meilleur. |
| `/comparaison/autodesk-docs` | N'existe pas | Idem. |
| `/changelog` | N'existe pas | À créer publiquement (preuve d'activité). |
| `/contact` | N'existe pas | À créer. Email + Calendly 20 min. |

### 3.6 Plan d'exécution refonte V1 — 3 semaines

| Semaine | Tâches | Livrable |
|---|---|---|
| **S1** | Feature flag BIM_ONLY ; refonte landing copy ; création `/security` ; création `/iso-19650` lead magnet | Landing BIM, 1 page comparatif, 1 page SEO |
| **S2** | Refonte vidéo 60 s BIM ; refonte vidéo master 94 s (suppr. Others) ; nouvelles captures écran réelles ; déploiement Vercel preview | Vidéos + captures intégrées landing |
| **S3** | `/comparaison/plannerly`, `/comparaison/autodesk-docs`, `/changelog`, `/contact` ; tests utilisateurs sur 3 BIM Managers (entretiens 30 min) ; corrections | Site complet + 3 retours utilisateurs |

---

## Partie 4 — Comment des grosses boîtes peuvent intégrer DOC-RENAME

C'est une question décisive parce que les grands comptes (Vinci, Bouygues, Eiffage, Implenia, Losinger Marazzi, SNCF Réseau, RATP, ADP, Pidiers, SETEC, Egis, Artelia) **ne** vont **pas** acheter un SaaS Pro à 19,99 € pour 500 utilisateurs. Ils achèteront différemment, à condition que vous ayez ces 4 modes d'intégration.

### 4.1 Cartographie des contraintes des grands comptes AEC

| Contrainte | Conséquence pour DOC-RENAME |
|---|---|
| Politique de sécurité IT : aucun SaaS non audité | Besoin d'une version on-premise ou desktop |
| SSO obligatoire (Entra ID / Okta / Google Workspace) | Besoin de SSO SAML 2.0 ou OIDC |
| DPA + audit de sécurité requis avant achat | Besoin d'un dossier sécurité préparé, ISO 27001 visé à terme |
| Achats centralisés, cycle 3–9 mois | Besoin de patience commerciale + interlocuteur achats |
| Bureautique sur ACC / ProjectWise / Trimble Connect | Besoin d'intégration API ou plugin |
| Filiales et sous-traitants nombreux, à équiper différemment | Besoin de tarification par déploiement, pas par siège |
| Charte graphique imposée | Besoin de white-label minimum |
| Multilingue FR/EN/DE/IT | Besoin d'i18n |

### 4.2 Quatre modes d'intégration grand compte

#### Mode A — SaaS Entreprise (le plus simple, le plus rapide à câbler)

**Cible :** filiales, agences régionales, BIM Managers d'un grand groupe qui ont budget autonome.

**Ce qu'il faut câbler :**
- SSO SAML 2.0 (priorité) + OIDC (Entra ID, Okta, Google Workspace).
- Multi-tenant avec isolation des conventions par organisation.
- Data residency choisie au niveau du tenant (EU Frankfurt par défaut, US optionnel).
- DPA + sub-processors list publique.
- Bibliothèque de conventions partagée à l'échelle de l'organisation.
- Logs d'audit (qui a renommé quoi, quand, sans contenu de fichier).
- Branding personnalisable (logo, couleurs, nom interne).

**Prix indicatif :** 1 500–4 500 €/mois selon nombre d'utilisateurs (50–500). Forfait annuel négocié.

**Stack technique :** Clerk Enterprise ou WorkOS pour SSO ; Vercel + base PostgreSQL hébergée Frankfurt ; logs Sentry self-hosted EU.

**Délai à viser :** 6 mois après les 5 premières betas signées. Pas avant.

#### Mode B — Déploiement on-premise (différenciateur lourd, peu de concurrents le proposent)

**Cible :** Défense, nucléaire, banques publiques, ministères, grands groupes industriels qui interdisent tout SaaS sur leurs données.

**Ce qu'il faut câbler :**
- Image Docker / Helm chart Kubernetes packagés.
- Build statique de l'app Next.js (le traitement est déjà local-first, donc l'app n'a besoin que d'un serveur de fichiers statiques + éventuellement une petite API auth).
- Documentation d'installation administrative (10 pages max).
- Licence par poste ou par déploiement (clé d'activation hors ligne possible).
- Support : 1 jour ouvré.
- Pas de télémétrie en mode on-prem.

**Prix indicatif :** 8 000–25 000 € licence annuelle pour 100–500 postes, support inclus. Audit sécurité 2 500 € forfaitaire.

**Argument de vente unique :** « Vos fichiers ne quittent pas votre périmètre. Notre code ne quitte pas le vôtre non plus. »

**Délai à viser :** 9–12 mois. Préparation : ajouter un mode `STANDALONE` au build Next.js, packager le Docker. C'est ~2 semaines de dev quand vous y arriverez.

#### Mode C — Plugin / extension d'écosystème (clé pour la distribution)

**Cible :** intégration dans les workflows existants, pas un nouvel outil à apprendre.

**Trois angles d'intégration :**

**C1. Add-in Microsoft 365 (Outlook, Teams, SharePoint)**

Pourquoi : les sous-traitants des grands comptes BIM reçoivent les conventions par email Outlook et déposent les ZIP dans SharePoint. Un add-in « BimDoc Renamer » dans Outlook permet de : (a) renommer la pièce jointe entrante selon la convention, (b) renommer un lot avant envoi sortant. SharePoint App permet de renommer in-place avant dépôt.

Effort : ~3–4 semaines via Office.js. Marge tech parfaitement compatible avec un build statique React.

**C2. Plugin Revit (Naviate-like)**

Pourquoi : exporter des plans depuis Revit en lot avec la convention déjà appliquée. Aujourd'hui les BIM Managers le font via Dynamo ou pyRevit.

Effort : ~6–8 semaines. Plugin C# .NET Revit qui appelle une CLI Node.js packagée. Plus complexe, mais c'est le plugin qui ouvre le marché Revit-natif.

**C3. App Autodesk Construction Cloud (ACC) Marketplace**

Pourquoi : être listé dans la marketplace ACC = visibilité gratuite chez les clients Autodesk. L'app peut récupérer un dossier ACC, appliquer la convention, et le re-déposer (ou exporter en ZIP).

Effort : ~4–6 semaines. Nécessite passer l'app review Autodesk (3–6 semaines).

**Priorité recommandée :** C3 (ACC marketplace) en mois 6–9 si la V1 PME a généré ≥ 30 clients. C2 (Revit) en année 2. C1 (Microsoft 365) en parallèle si compétence dispo.

#### Mode D — Module embarqué chez un partenaire CDE

**Cible :** un éditeur CDE qui veut un module « auto-rename ISO 19650 » sans le développer lui-même.

**Candidats partenaires réalistes :**
- **Kroqi** (français, soutien étatique, manque d'auto-naming avancé selon nos recherches). Premier contact à viser.
- **Cooperlink** (belge, porte la convention OpenDMS). Alignement éditorial fort.
- **BIMcollab** : peu probable, ils sont sur le BCF, pas le renommage.
- **Naviate** (norvégien, add-ins Revit/Civil 3D) : intégrer en module « Simple Rename ».

**Modèle économique :** licence OEM. Vous donnez un SDK (la lib `lib/bim/` est déjà pure, parfaitement extractible), ils l'intègrent. Royalty 15–25 % du prix du module final, ou forfait annuel.

**Avantage stratégique :** distribution massive sans CAC. Un seul deal Kroqi pourrait équiper 5 000 utilisateurs publics français.

**Délai :** 12–18 mois. Trop tôt en V1. Mais le code est déjà prêt grâce à `ARCHITECTURE.md §3` qui isole la logique pure.

### 4.3 Sequencing recommandé sur 24 mois

```
Mois 0–6  : V1 BIM PME (Pro 19,99 €). Objectif 30 clients payants.
Mois 6–9  : Mode A SaaS Entreprise (SSO + DPA). 2–3 deals à 1 500–3 000 €/mois.
Mois 9–12 : Mode C3 plugin ACC Marketplace. Distribution Autodesk.
Mois 12–18: Mode B on-premise pour 1 client défense ou nucléaire. Référence.
Mois 18–24: Mode D licence OEM Kroqi ou partenaire. Distribution massive.
```

Chaque mode débloque le suivant. **Ne pas faire de saut.** Mode B avant Mode A = effort énorme sans demande validée. Mode D sans Mode A = pas de track record opérationnel.

### 4.4 Documents à préparer pour grands comptes (canvas)

À avoir prêts dès le mois 6 :

- **Security Whitepaper** (10 pages) : architecture local-first, headers HTTP, CSP, dépendances, CodeQL/ZAP results, processus de mise à jour, incident response.
- **DPA template** (RGPD-compliant, EU sub-processors uniquement par défaut).
- **SOC 2 Type 1 readiness checklist** (visée année 2).
- **Reference Architecture diagrams** : SaaS, on-prem, hybride.
- **Pricing matrix Enterprise** confidentielle (à fournir sur NDA).
- **Reference customers list** (anonyme tant qu'il n'y a pas d'autorisation écrite — important culturellement chez Vinci/Bouygues).

### 4.5 Premier contact grands comptes — comment

Ne pas faire de cold call à Vinci Construction direct. Le bon canal :

1. **Direction BIM Groupe / VDC Director** identifié sur LinkedIn (chez Bouygues Construction = Olivier Massart historiquement ; chez Vinci = équipes BIM/digital de chez Vinci Energies et Vinci Construction ; à actualiser via Sales Navigator).
2. **Demande d'avis** plutôt que pitch : « Je construis un outil de renommage de livrables BIM. Vos sous-traitants vous remontent-ils la conformité ISO 19650 comme un irritant ? Je serais preneur de 20 minutes de retour. »
3. **Si l'entretien va bien** : proposition de test gratuit chez 2–3 sous-traitants du groupe (entrée par le bas, pas par le haut).
4. **Si le test va bien** : monter en gamme vers Mode A (SaaS Entreprise) ou Mode B (on-prem).

Cycle réaliste : 9–12 mois du premier contact au premier euro. C'est normal.

---

## Partie 5 — Synthèse exécutive (pour décider en 5 minutes)

### Verdict marché
Le marché existe, fait 2,4 Md USD en Europe, croît à 9 %/an, le standard ISO 19650 est devenu incontournable en marché public. Mais le SOM solo bootstrap n'est pas un licorne : **50–150 k€ ARR à 36 mois maximum réaliste en V1 BIM PME**.

### Verdict produit actuel
Techniquement excellent, commercialement sous-positionné. Multi-métiers tue le message BIM. Refactorable en 3 semaines.

### Décisions à prendre maintenant
1. **Renommer commercialement en BimDoc Renamer** (domaine déjà aligné), garder DOC-RENAME comme code.
2. **Masquer les autres profils en V1** via feature flag, garder le code intact.
3. **Refondre landing + vidéo** selon §3.3 et §3.4. Effort 2–3 semaines.
4. **Créer `/security`** comme arme commerciale principale.
5. **Construire 3 documents grands comptes** (whitepaper, DPA, comparatif Plannerly) à avoir en réserve.
6. **Ne pas démarrer Mode B on-premise avant 30 clients PME**.

### Le projet a-t-il de l'avenir ?
Oui, sur 3 conditions cumulatives :
- Discipline de positionnement BIM-only en V1 (12 mois minimum).
- 5 clients payants signés avant fin Q3 2026.
- Préparation discrète des modes Entreprise et on-premise pour ne pas rater une opportunité grand compte si elle se présente.

Sans ces 3 conditions, le projet reste un excellent objet technique sans débouché commercial.

---

## Sources

- [Europe Building Information Modelling (BIM) Market 2025–2030](https://virtuemarketresearch.com/report/europe-building-information-modelling-market) — Virtue Market Research
- [BIM en France 2025 : Statistiques clés](https://www.s3dengineering.net/blog/bim-en-france-les-chiffres-incontournables-a-connaitre-en-2025/) — S3D Engineering
- [Fiche secteur 711 — Activités d'architecture et d'ingénierie](https://www.insee.fr/fr/statistiques/7763836?sommaire=7763898) — INSEE
- [Portrait statistique des entreprises d'architecture](https://www.ramau.archi.fr/IMG/pdf/ompl-archi-stat-bat_web.pdf) — OMPL
- [Norme ISO 19650 : principale norme BIM](https://bim-synthese.fr/iso-19650-1/) — BIMSY
- [Application ISO 19650 dans un CDE](https://www.manandmachine.fr/blog/application-de-la-norme-iso-19650-dans-un-environnement-commun-de-donnees-cde/) — Man & Machine France
- [Mise en conformité ISO 19650](https://www.s3dengineering.net/blog/mise-en-conformite-iso-19650-guide-complet-pour-structurer-votre-documentation-bim-s3d-engineering-united/) — S3D Engineering
- [Plannerly Pricing](https://plannerly.com/pricing/) — Plannerly
- [ISO 19650 Templates Plannerly](https://plannerly.com/category/iso-19650-templates/) — Plannerly
- [7 Most Recommended CDE Software for BIM 2026](https://blog.oceanbim.com/7-recommend-common-data-environment-software-bim/) — OceanBIM
- [Autodesk Docs et BIM 360 Docs ISO 19650](https://blogs.autodesk.com/villagebim/2021/06/nouveaute-autodesk-docs-et-bim-360-docs-compatibilite-avec-la-norme-iso-19650.html) — Autodesk
- [Cooperlink OpenDMS naming convention](https://www.cooperlink.io/post/open-dms-finally-a-common-file-naming-convention-for-construction) — Cooperlink
- [Cerema — outil convention BIM type](https://www.cerema.fr/fr/actualites/outil-aide-redaction-convention-bim-type-outil-est-ligne) — Cerema
- [Convention BIM : définition et rédaction](https://bim-synthese.fr/convention-bim/) — BIMSY
