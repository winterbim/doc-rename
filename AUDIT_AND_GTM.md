# DOC-RENAME — Audit technique + plan de prospection

Date: 2026-05-20
Auteur: audit assisté
Cible commerciale recommandée pour la V1: BIM / construction

---

## 1. Version réelle du produit

Il y a une **incohérence de versionnage** dans le dépôt. À corriger avant toute communication commerciale.

| Source | Version annoncée | Date | Statut |
|---|---|---|---|
| `package.json` (racine) | `0.1.0` | — | source de vérité |
| `web/package.json` | `0.1.0` | — | source de vérité |
| `web/CHANGELOG.md` | `0.1.0` (publiée) + `[Unreleased]` | 2026-05-14 | cohérent |
| `web/ARCHITECTURE.md` §11 | `0.1.0` | — | cohérent |
| `CHANGELOG.md` (racine) | `2.1.1` | 2026-04-24 | **incohérent**, vestige de l'extension BIM avant migration SaaS |
| Tags git | aucun | — | aucune release taguée |
| Dernier commit `main` | `da12c6e feat(ui): add "Ajouter des fichiers" button in ActionBar` | — | — |

**Verdict version**

La version réelle de l'application web SaaS est **`0.1.0`** avec un cycle `[Unreleased]` en cours (migration SaaS, page privacy refondue, observabilité optionnelle, ARCHITECTURE.md ajouté).

Le `CHANGELOG.md` racine doit être :
- soit supprimé,
- soit ré-écrit pour pointer vers `web/CHANGELOG.md` et indiquer que `2.1.1` correspond à l'ancien projet extension Chrome avant migration. En l'état, un acheteur ou un auditeur trouvera deux versions différentes → perte de crédibilité immédiate.

---

## 2. État git et hygiène du dépôt

```
Sur la branche main
Modifications non validées : ~30 fichiers (README, app/page.tsx, lib/bim/*, tests…)
Fichiers non suivis : .agent-skills/, .agents/, .cursor/, .github/workflows/{codeql,e2e,lighthouse,zap}.yml,
                      SAAS_READINESS_PLAN.md, web/app/access/, web/app/api/,
                      web/lib/access-control.ts, web/lib/usage-limits.ts, web/proxy.ts,
                      web/sentry.*, web/playwright.config.ts, web/tests/, …
```

**Risques**

- Le travail SaaS réel (accès privé, limites Free, Sentry, Playwright, CodeQL, ZAP) **n'est pas commité**. Une perte de session = perte de la moitié de la mise en SaaS.
- Pas de tag de release → impossible de répondre à « quelle version tourne en prod ? » sans aller lire le SHA Vercel.

**Actions immédiates recommandées**

1. Une PR « SaaS hardening — access gate, usage limits, CI security, observability scaffolding » qui regroupe tous les fichiers non suivis cohérents.
2. Une PR « v0.2.0 product polish » avec les fichiers modifiés (lib/bim/*, profiles/*, UI).
3. `git tag v0.1.0` rétroactif sur le commit du premier déploiement Vercel (2026-05-14).
4. Activer la protection de branche `main` (au moins : require PR review + CI green).

---

## 3. Audit technique

### 3.1 Stack et architecture

- **Next.js 16** + **React 19** + **TypeScript 5** + **Tailwind 4**, déployé sur Vercel (`bimdoc-renamer.vercel.app`), `rootDirectory=web`.
- Logique pure isolée dans `lib/bim/` : zero React, zero DOM, zero stockage. Vérifié par contrat dans `ARCHITECTURE.md` §3.
- État central via `useReducer` + `AppContext`, persistance localStorage avec **schema version sentinel** (`SCHEMA_VERSION = 1`, fail-closed si version future).
- Traitement fichiers 100 % navigateur (PDF.js, mammoth, SheetJS, dxf-parser, libarchive.js). Aucun upload backend.

**Verdict : architecture saine, alignée avec la promesse « vos fichiers restent dans votre navigateur ».**

### 3.2 Sécurité

| Élément | État |
|---|---|
| HSTS preload | ✅ `max-age=63072000; includeSubDomains; preload` |
| X-Content-Type-Options | ✅ `nosniff` |
| X-Frame-Options | ✅ `DENY` |
| Referrer-Policy | ✅ `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ caméra/micro/géo coupés |
| CSP | ⚠️ stricte sauf `'unsafe-inline' 'unsafe-eval'` pour `script-src` (nécessaire à `next/dynamic` + react-pdf, à reconsidérer plus tard via nonce/hash) |
| Upload guard | ✅ 100 MiB/fichier, 1 GiB/lot, ZIP magic-bytes, sanitization noms |
| Error boundary | ✅ log local, aucune transmission externe |
| CodeQL | ✅ workflow présent (non commité) |
| OWASP ZAP | ✅ workflow présent (non commité) |
| Sentry/PostHog | ✅ désactivés tant que les vars sont vides, scopés sans contenu fichier |

### 3.3 Bug **important** détecté — protection d'accès non câblée

- Fichier `web/proxy.ts` : exporte une fonction `proxy(request)` avec `export const config = { matcher: [...] }`.
- Or **Next.js attend un fichier nommé `middleware.ts` exportant `middleware()`** (App Router, Next 13+). Le nom `proxy.ts` n'est **pas** reconnu par le runtime Vercel/Next.
- Vérifié : aucun import de `./proxy` ailleurs dans le code, aucun `middleware.ts`, et `DOC_RENAME_ACCESS_PASSWORD=` est vide dans `.env.example`.

**Conséquence** : la page `/access` et l'API `/api/access` existent et fonctionnent côté UI, mais **rien n'intercepte les requêtes** vers `/app`. Le « gate » mot de passe est inactif. Si vous comptez sur cette protection pour une beta privée, c'est ouvert.

**Correction (1 ligne) :**
```bash
git mv web/proxy.ts web/middleware.ts
# puis dans le fichier :
# export function proxy(request: NextRequest) →
# export function middleware(request: NextRequest)
```

### 3.4 Tests, CI, qualité

- ~21 fichiers de tests, ~522 tests Vitest, fuzz `fast-check` (~8 000 entrées aléatoires par run, totalité prouvée sur 8 fonctions BIM).
- Couverture v8, seuil plancher 80/80/80/75 (régression gate).
- 5 workflows GitHub : `ci`, `codeql`, `e2e` (Playwright), `lighthouse`, `zap`.
- Pre-commit hook : `tsc --noEmit`.
- `audit:prod` (npm audit prod-only) disponible.

**Verdict : niveau qualité largement au-dessus de la moyenne pour un produit à 0.1.0. C'est un atout de vente B2B.**

### 3.5 Monétisation actuelle

- Page marketing affiche **Free / Pro 19.99 CHF/mois / Team 34.90 CHF/mois**.
- Limite Free implémentée : `FREE_DAILY_RENAME_LIMIT = 3` dans `lib/usage-limits.ts`, persistée en localStorage.
- **Stripe : non câblé.** Aucun import `stripe` dans le code. Aucune route `/api/stripe/*`. Aucun bouton « S'abonner » réellement connecté.
- **Auth : non implémentée.** Pas de signin/signup/session. La protection d'accès est un simple mot de passe partagé (et de surcroît non actif, cf. 3.3).

**Conséquence : le produit affiche un pricing qu'il ne peut pas encaisser.** Pour une beta gratuite c'est acceptable, pour vendre c'est bloquant. La limite Free de 3/jour est contournable en `localStorage.clear()` côté client — c'est un nudge, pas un mur. Acceptable seulement si vous prévenez les premiers clients que c'est une licence sur l'honneur.

### 3.6 Conformité / juridique

- `LICENSE` propriétaire ✅
- `PRIVACY_POLICY.md` racine + `/privacy` page ✅ (refondue pour SaaS, mentionne RGPD/CNIL)
- CGU/CGV : **absentes**
- DPA B2B : **absent**
- Mentions légales : **absentes**
- Marque déposée : non (cf. `SAAS_READINESS_PLAN.md` qui liste l'action correctement)
- `package.json` : `"private": true`, `"license": "UNLICENSED"` ✅

---

## 4. Verdict général

| Axe | Note | Commentaire |
|---|---|---|
| Architecture produit | A | Local-first cohérent, code pur isolé, schema versioning. |
| Qualité code/tests | A | 522 tests, fuzz, CodeQL, ZAP, Lighthouse. |
| Sécurité applicative | B+ | Headers solides ; **gate d'accès cassé** ; CSP avec `unsafe-eval`. |
| Maturité commerciale | C | Pricing affiché, paiement non câblé, auth absente. |
| Hygiène dépôt | C | Travail non commité, pas de tag, CHANGELOG racine incohérent. |
| Conformité légale | C | Privacy OK, mais CGU/DPA/mentions légales manquantes. |

**Conclusion** : produit prêt pour une **beta privée invitée** sur le métier BIM, **pas encore prêt** pour vente self-serve. Trois corrections bloquantes avant prospection active :

1. Renommer `proxy.ts → middleware.ts` (gate beta).
2. Aligner `CHANGELOG.md` racine sur `web/CHANGELOG.md`, tag `v0.1.0`.
3. Décider : (a) on coupe le pricing affiché et on annonce « beta gratuite », ou (b) on câble Stripe avant de pousser de la prospection payante.

---

## 5. Comment trouver des prospects — méthode concrète

Cible recommandée par `SAAS_READINESS_PLAN.md` et confirmée par l'audit : **BIM / construction**.

### 5.1 ICP (Ideal Customer Profile)

Définition serrée pour les 50 premiers prospects.

- **Type d'entreprise** : bureau d'études, architecte, entreprise générale, MOE/MOA, économiste, coordinateur BIM indépendant.
- **Taille** : 5–80 salariés. En-dessous : pas de douleur sur les conventions. Au-dessus : process interne déjà figé, cycle de vente long.
- **Géographie V1** : Suisse romande (cohérent avec le pricing CHF) → France (Auvergne-Rhône-Alpes, Île-de-France) en V2.
- **Signal d'achat** :
  - publie des appels d'offres avec exigence ISO 19650 ou SIA 2051 ;
  - mentionne « CDE », « DOE numérique », « BIM » dans ses offres d'emploi ;
  - membre Buildup, BIM Romandie, SIA, USIC ;
  - récemment équipé en Revit, Archicad, BIMcollab, Plannerly.
- **Persona décideur** : BIM Manager / Coordinateur BIM, Directeur technique, Architecte associé.
- **Persona prescripteur** : ingénieur·e méthodes, assistante de direction qui prépare les ZIP de livraison.

### 5.2 Promesse de vente à tester

> Renommez et exportez vos lots de plans, rapports et DOE selon votre convention ISO 19650 / SIA / convention maison, en moins de 60 secondes, sans envoyer vos fichiers sur un serveur tiers.

À mesurer en discovery : combien de temps perdu par mois sur le renommage manuel (heures × taux horaire chargé = ROI explicite).

### 5.3 Méthode de prospection — ordre exécutable

#### Étape 0 — Pré-requis (≤ 1 semaine)

- Corriger les 3 bloquants de §4.
- Créer un compte LinkedIn « founder » crédible avec mention DOC-RENAME.
- Créer un compte X/Bluesky/Mastodon optionnel pour la veille.
- Préparer une page de démo 90 secondes (Loom ou Remotion — le dossier `video/` existe déjà).
- Préparer un mini-deck 5 slides : problème, démo, sécurité local-first, profils métier, prix.
- Mettre en place un CRM léger : Notion, Airtable ou HubSpot Free. 1 vue pipeline, 1 vue contacts.

#### Étape 1 — Sourcing (semaines 1–2)

Trois canaux à lancer en parallèle, **scorés ensuite** sur taux de réponse.

**A. LinkedIn Sales Navigator (canal n°1 recommandé)**

- Filtre : Industrie « Architecture & Planning » / « Civil Engineering » / « Construction », taille 11–50 et 51–200, géographie Suisse + France, titre contient `BIM Manager`, `BIM Coordinator`, `Coordinateur BIM`, `Responsable BIM`, `Directeur technique`, `Architecte associé`.
- Volume attendu : 1 500–3 000 décideurs sur la zone cible.
- Export contrôlé via **Phantombuster** ou **Evaboot** vers CSV.
- Enrichissement email pro via **Dropcontact** (RGPD-compliant, hébergement UE) ou **Kaspr**. Pas de scraping non conforme.

**B. Open data / annuaires métier**

- Suisse : registre du commerce (zefix.ch) filtré sur codes NOGA 71 (architecture/ingénierie) + 41 (construction).
- France : SIRENE/INSEE via **Pharow**, **Dropcontact** ou directement l'API INSEE. Codes NAF 7111Z, 7112B, 4120A/B, 7022Z.
- Annuaires syndicaux : SIA (Société suisse des ingénieurs et architectes), USIC, Buildup.ch, Ordre des Architectes (France), CINOV.
- Offres d'emploi mentionnant Revit/Archicad/BIM scrappées sur LinkedIn Jobs, HelloWork, Welcome to the Jungle → l'entreprise qui recrute un BIM Manager est mûre.

**C. Communautés et événements**

- BIM World Paris (mars), Swissbau Bâle (janvier biennal), BIM Romandie meetups, AEC Hackathon.
- Slack/Discord : « BIM francophone », « OSArch » (open source AEC).
- LinkedIn groupes : « BIM France », « BIM Suisse Romande ».
- Repérer 20 créateurs de contenu BIM francophones → commenter intelligemment leurs posts pendant 2 semaines avant tout DM.

#### Étape 2 — Qualification (semaine 2)

Avant de contacter, scorer chaque prospect :

| Critère | Points |
|---|---|
| Taille 5–80 | +2 |
| Mentionne BIM / ISO 19650 / SIA 2051 publiquement | +2 |
| Recrute actuellement un poste BIM | +3 |
| Outils Revit/Archicad/BIMcollab visibles | +1 |
| Site web indique des livrables DOE/CDE | +2 |
| Taille > 200 ou < 5 | −2 |
| Géo hors V1 | −1 |

Garder seulement les ≥ 5 points pour les 50 premiers contacts. Mieux vaut 50 conversations chaudes que 500 emails ignorés.

#### Étape 3 — Premier contact (semaines 2–4)

**Canal recommandé V1 : LinkedIn DM personnalisé, pas d'email cold.** Raison : le métier BIM lit LinkedIn, l'email pro est saturé. Vous n'avez pas encore la marque pour cold-email à volume.

Template à tester (à ne PAS envoyer tel quel — personnaliser ligne 1 et 2) :

> Bonjour {Prénom},
> J'ai vu que vous publiez régulièrement sur la convention {ISO 19650 / SIA / autre repéré dans son fil}. Une question rapide pour comprendre : combien de temps votre équipe passe-t-elle chaque mois à renommer manuellement les fichiers avant un dépôt DOE ou un envoi CDE ?
> Je construis un outil qui fait ce renommage en lot selon votre convention, **100 % dans le navigateur — aucun fichier ne sort de votre poste**. Je cherche 5 équipes BIM romandes pour tester gratuitement pendant 1 mois et challenger les profils métier.
> Vous voulez voir une démo 2 minutes ?

Règles :
- 15 DM/jour max au début (LinkedIn pénalise au-delà).
- Suivi à J+5 si pas de réponse, 1 seul follow-up.
- Mesurer : taux d'acceptation connexion, taux de réponse DM, taux de démo bookée.

#### Étape 4 — Démo et conversion (semaines 4–8)

- Démo en visio 20 minutes : 2 min contexte → 10 min produit avec **leurs** fichiers (pas une demo data) → 5 min sécurité local-first → 3 min next step.
- Conversion attendue beta gratuite : 30–50 % des démos.
- Demander à chaque beta : (a) feedback structuré à J+15, (b) intro vers 1 confrère.

#### Étape 5 — Boucle marketing entrant en parallèle

À enclencher dès la semaine 1 pour que les semaines 4+ ne reposent plus que sur le sortant.

- **SEO** : 1 article par semaine sur « convention de nommage BIM ISO 19650 », « exemple matrice DOE », « checklist livrable CDE ». Cible mots-clés bas-volume haute-intention.
- **LinkedIn personnel** : 3 posts/semaine, ratio 70 % éducatif (convention nommage, retour terrain) / 30 % produit.
- **YouTube/Loom** : 5 démos vidéo d'1 min chacune, une par profil métier.
- **Lead magnet** : « Modèle ISO 19650 — JSON prêt à importer dans DOC-RENAME ». Échange contre email.

#### Étape 6 — Mesure (continu)

Tableau de bord hebdo minimal :

| KPI | Cible S4 | Cible S12 |
|---|---|---|
| Prospects scorés en base | 200 | 500 |
| DM envoyés/sem | 75 | 75 |
| Taux acceptation connexion | ≥ 30 % | ≥ 35 % |
| Taux réponse DM | ≥ 12 % | ≥ 18 % |
| Démos bookées/sem | 3 | 6 |
| Betas actives | 5 | 15 |
| NPS beta | — | ≥ 30 |
| Conversion beta → payant | — | mesuré (objectif > 20 % une fois Stripe câblé) |

### 5.4 Outils — pile minimale recommandée

| Besoin | Outil | Pourquoi |
|---|---|---|
| Sourcing LinkedIn | **Sales Navigator** | filtres précis + alertes signal |
| Extraction LinkedIn | **Evaboot** ou **Phantombuster** | export CSV propre |
| Enrichissement email | **Dropcontact** | RGPD-compliant, hébergé UE |
| Annuaire entreprises FR | **Pharow** ou API INSEE | données SIRENE fiables |
| Annuaire entreprises CH | **Zefix** + scraping ciblé | gratuit |
| Outreach séquencé | **Lemlist** ou **La Growth Machine** | LinkedIn + email multi-canal |
| CRM | **Notion** ou **HubSpot Free** | démarrer simple |
| Démo vidéo | **Loom** + dossier `video/` Remotion existant | preuve produit |
| Analyse marché | LinkedIn Jobs + Pôle Emploi BMO | détection signaux d'achat |

### 5.5 Choix de méthode — quelle approche en priorité

**Recommandation : outbound LinkedIn ciblé + content marketing**, dans cet ordre.

Pourquoi pas Google Ads d'abord :
- Volume de recherche faible sur « logiciel renommage BIM », CPM élevés, intention diluée.
- Mieux d'investir l'équivalent dans 2 mois de Sales Nav + Dropcontact.

Pourquoi pas cold email à volume :
- Pas encore de marque, déliverabilité fragile, risque de blacklist domaine.
- Reprendre cold email **après** 10 betas signées + 1 étude de cas publiée.

Pourquoi pas partenariats d'emblée :
- Sans 5 betas qui valident le produit, vous arrivez en partenariat sans preuves.
- Cibler 3 partenaires (édition BIMcollab, intégrateur Revit, formateur ISO 19650) **en mois 3**, pas avant.

### 5.6 Risques de prospection à anticiper

1. **« Vos fichiers restent locaux — comment je le vérifie ? »** → préparer une page `/security` avec network log screenshot, audit ZAP, lien CodeQL, mention CSP. La promesse local-first est votre différenciation, elle doit être prouvable en 30 secondes.
2. **« Et le RGPD ? »** → CGU + DPA à finir avant les premiers contacts B2B sérieux.
3. **« Pourquoi pas un simple PowerShell ou un script Python ? »** → réponse honnête : « parce que votre assistante n'écrit pas de scripts, et vos conventions évoluent ». Démontrer profils métier + import CSV/Excel d'entités.
4. **Pricing CHF en France** → annoncer EUR dès la cible FR (≈ 19.99 €/mois Pro, 34.90 €/mois Team). Pas plus tôt que la beta CH validée.

---

## 6. Plan d'action 30 jours

| Sem. | Tech | Commercial |
|---|---|---|
| 1 | Renommer middleware, aligner CHANGELOG, tag v0.1.0, commiter le SaaS hardening | Définir ICP final, ouvrir Sales Nav, sourcer 100 prospects scorés |
| 2 | Finir CGU + mentions légales + page `/security` | Lancer 75 DM LinkedIn personnalisés, publier 3 posts |
| 3 | Câbler Stripe Checkout minimal (Free → Pro), désactiver pricing tant qu'il n'est pas câblé | 75 nouveaux DM, premières démos |
| 4 | Auth (Clerk ou Supabase Auth, lecture seule des préférences) | Closer 5 betas, demander feedback structuré |

---

## 7. Décisions à prendre maintenant (avant prospection)

1. **Beta gratuite ou vente directe ?** — recommandation : beta gratuite 1 mois × 10 équipes, conversion auto en Pro après.
2. **Géo prioritaire** — CH romande puis FR, ou inverse ?
3. **Marque finale** — DOC-RENAME, BimDoc Renamer, ou nouveau nom ? Réserver le domaine `.ch` + `.com` avant communication.
4. **Statut juridique** — vendre depuis quelle entité ? Indispensable pour facturer en CHF puis EUR.
5. **Volume hebdo soutenable** — combien d'heures/semaine vous y consacrez ? Le plan ci-dessus suppose ≈ 10 h commercial/semaine.
