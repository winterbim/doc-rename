# BIMCHECK-Rename — vidéo de présentation

Projet **Remotion** (React → MP4) qui explique le fonctionnement du SaaS
BIMCHECK-Rename (import → convention → aperçu → ZIP, local-first, tarifs).

Logo officiel récupéré depuis `www.bimcheck-consulting.com` :
`public/brand/bimcheck-logo.png` (remplace l’ancien tile « BC »).

Sorties rendues (exemples) :

| Fichier | Format | Durée |
| --- | --- | --- |
| `out/bimcheck-rename-how-it-works-1920x1080.mp4` | 1920×1080 | ~84 s |
| `out/bimcheck-rename-how-it-works-short-1920x1080.mp4` | 1920×1080 | 30 s |
| `out/bimcheck-rename-cover.png` | still | — |

Projet en quatre compositions :

| Composition         | Format       | Durée  | Usage                                             |
| ------------------- | ------------ | ------ | ------------------------------------------------- |
| `MainMaster`        | 1920×1080    | ~94 s  | Site, YouTube, démo commerciale, salons.          |
| `MainVertical`      | 1080×1920    | ~94 s  | LinkedIn vidéo, Shorts, Reels (version longue).   |
| `MainShort`         | 1920×1080    | 30 s   | Posts, ads paid, en-tête de newsletter.           |
| `MainShortVertical` | 1080×1920    | 30 s   | TikTok, Reels, Shorts (version courte sociale).   |

Tout est en français, **muet** (par choix produit) et utilise des
sous-titres intégrés synchronisés. Aucune dépendance cloud, aucun service
TTS — la vidéo peut être rendue 100 % en local.

---

## Prérequis

- Node.js ≥ 20
- ~2 Go d'espace disque (Remotion télécharge Chromium pour le rendu)
- macOS, Linux ou Windows

---

## Démarrage

```bash
cd video
npm install
npm start            # lance Remotion Studio (preview interactif)
```

Le studio s'ouvre sur `http://localhost:3000`. Tu peux y :

- prévisualiser chaque composition image par image ;
- ajuster la timeline si une scène doit être plus longue / courte ;
- exporter une image PNG (`Render Still`) ou la vidéo complète.

---

## Rendu en ligne de commande

```bash
# Master 16:9 (1920×1080, ~94 s)
npm run build

# Variante verticale 9:16 (1080×1920, ~94 s)
npm run build:vertical

# Variante courte 16:9 (1920×1080, 30 s)
npm run build:short

# Variante courte 9:16 (1080×1920, 30 s)
npm run build:short:vertical

# Les 4 formats en une commande
npm run build:all
```

Les fichiers sortent dans `video/out/` :

```
out/
├── doc-rename-master-1920x1080.mp4
├── doc-rename-vertical-1080x1920.mp4
├── doc-rename-short-1920x1080.mp4
└── doc-rename-short-1080x1920.mp4
```

Profil d'encodage par défaut : H.264 / yuv420p / CRF 18 — qualité haute,
fichiers raisonnables (~20-40 Mo pour le master), compatible LinkedIn,
YouTube et la plupart des plateformes.

---

## Structure du projet

```
video/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── README.md
└── src/
    ├── index.ts                 # Entrée Remotion
    ├── Root.tsx                 # Enregistre les 4 compositions
    ├── lib/
    │   ├── tokens.ts            # Palette + fonts + durées scènes
    │   ├── easing.ts            # liftIn / softSpring / fadeOut
    │   └── script.ts            # Sous-titres (master + short)
    ├── components/              # UI primitives réutilisables
    │   ├── BrandMark.tsx        # Logo "DR" + wordmark
    │   ├── PaperBackground.tsx  # Fond "warm-paper" + grille
    │   ├── AppFrame.tsx         # Reproduction du shell BIMCHECK-Rename
    │   ├── Panel.tsx, SubPanel  # Cartes / sous-cartes
    │   ├── FileRow.tsx          # Ligne fichier (old / new / neutral)
    │   ├── Chip.tsx             # Pastilles profils / catégories
    │   ├── Cursor.tsx           # Curseur animé pour les clics
    │   ├── Headline.tsx         # Titres de scène
    │   ├── Subtitle.tsx         # Sous-titres globaux
    │   └── ProgressBar.tsx      # Barre de progression dorée
    ├── scenes/                  # Une scène par étape du script
    │   ├── SceneProblem.tsx
    │   ├── SceneSolution.tsx
    │   ├── SceneImport.tsx
    │   ├── SceneNomenclature.tsx
    │   ├── SceneBIM.tsx
    │   ├── SceneOthers.tsx
    │   ├── SceneExport.tsx
    │   ├── ScenePrivacy.tsx
    │   └── SceneCTA.tsx
    └── compositions/
        ├── MainScenes.tsx       # Timeline visuelle (réutilisable)
        ├── MainMaster.tsx       # 16:9 + sous-titres + progress bar
        ├── MainVertical.tsx     # 9:16 + bandes haut/bas + sous-titres
        ├── MainShort.tsx        # 30 s 16:9
        └── MainShortVertical.tsx# 30 s 9:16
```

---

## Identité visuelle

Tous les tokens sont dans [`src/lib/tokens.ts`](src/lib/tokens.ts) et sont
copiés **verbatim** depuis le landing de production
([`web/app/page.tsx`](../web/app/page.tsx)) :

| Token             | Hex       | Rôle                          |
| ----------------- | --------- | ----------------------------- |
| `paper`           | `#F7F3EA` | Fond principal                |
| `paperHard`       | `#FFFAF0` | Fond carte / champ            |
| `ink`             | `#241F19` | Texte principal, logo, CTA    |
| `inkSoft`         | `#5B5045` | Texte secondaire              |
| `muted`           | `#817466` | Sous-titres, métadonnées      |
| `brick`           | `#A54835` | Accent chaleureux (CTA, em)   |
| `moss`            | `#4F6948` | États positifs (renommé, OK) |
| `gold`            | `#C0913F` | Accent doré (badge ZIP, prog) |
| `blue`            | `#314D63` | Catégories info / DOCX        |

Polices :

- **Sans-serif** : Inter / system-ui — corps de texte, UI.
- **Serif italique** : Newsreader — accents éditoriaux (« *professionnel*,
  *votre navigateur*, *chaque métier* »).
- **Monospace** : JetBrains Mono — noms de fichiers, aperçu de
  nomenclature.

> Note : Remotion utilise les polices déjà installées sur le système. Si
> tu veux la même typographie que le landing, installe Inter, Newsreader
> et JetBrains Mono localement ou ajoute-les via `@remotion/google-fonts`.

---

## Storyboard

| #  | Scène         | Plage    | Visuel                                                        |
| -- | ------------- | -------- | ------------------------------------------------------------- |
| 1  | Problem       | 0–10 s   | Liste de fichiers désordonnés + badge « ? » en brick.          |
| 2  | Solution      | 10–20 s  | Logo DR géant + tagline + chips profils.                       |
| 3  | Import        | 20–32 s  | Drop-zone → liste de 6 fichiers détectés (curseur drop).       |
| 4  | Nomenclature  | 32–48 s  | Champs disponibles → convention active, preview live.          |
| 5  | BIM           | 48–60 s  | Avant / Après côte à côte (panneaux).                          |
| 6  | Others        | 60–72 s  | 3 colonnes : Finance / RH / Juridique.                         |
| 7  | Export        | 72–82 s  | Saisie du nom ZIP, clic, ZIP descend dans le coin.             |
| 8  | Privacy       | 82–90 s  | Diagramme Navigateur → ZIP local, badge cadenas, mention      |
|    |               |          | « aucun contenu envoyé au serveur » barrée en brick.           |
| 9  | CTA           | 90–94 s  | Fond ink + logo + « Renommez. Normalisez. Exportez. » + bouton |

Chaque scène respecte la palette warm-paper et reprend les composants UI
de l'app (AppFrame, FileRow, Chip, Panel) pour rester crédible.

---

## Sous-titres (script complet)

Les sous-titres sont dans [`src/lib/script.ts`](src/lib/script.ts). Voici
le texte en clair, organisé par scène (timing arrondi à la seconde).

### Master (94 s)

| t (s)         | Texte                                          |
| ------------- | ---------------------------------------------- |
| 0.4 – 3.6     | Des fichiers mal nommés ralentissent vos projets. |
| 3.8 – 7.0     | Perte de temps, erreurs, doublons.             |
| 7.2 – 9.8     | Des livrables difficiles à contrôler.          |
| 10.2 – 14.8   | BIMCHECK-Rename                                     |
| 15.0 – 19.8   | Renommage documentaire professionnel.          |
| 20.3 – 24.8   | Importez vos fichiers ou vos archives.         |
| 25.0 – 28.6   | PDF, DOCX, images, tableurs, ZIP…              |
| 28.8 – 31.8   | Tout reste dans votre navigateur.              |
| 32.3 – 36.4   | Construisez votre convention.                  |
| 36.6 – 41.8   | Champs métier, ordre, séparateur.              |
| 42.0 – 47.8   | Une règle claire, appliquée à tous les fichiers. |
| 48.3 – 53.0   | Cas d’usage : BIM / Construction               |
| 53.2 – 59.8   | Plans, DOE, rapports, livrables CDE.           |
| 60.3 – 65.4   | Finance · RH · Juridique · Administratif.      |
| 65.6 – 71.8   | Le même principe, adapté à chaque métier.      |
| 72.3 – 76.6   | Exportez tout en ZIP personnalisé.             |
| 76.8 – 81.8   | Un livrable propre, prêt à transmettre.        |
| 82.3 – 86.4   | Vos fichiers restent dans votre navigateur.    |
| 86.6 – 89.8   | Aucun contenu document envoyé au serveur.      |
| 90.3 – 93.8   | Renommez. Normalisez. Exportez.                |

### Short (30 s)

| t (s)         | Texte                                          |
| ------------- | ---------------------------------------------- |
| 0.4 – 3.6     | Des fichiers mal nommés ralentissent vos projets. |
| 4.0 – 7.5     | BIMCHECK-Rename — renommage documentaire pro.       |
| 8.0 – 12.5    | Importez. Construisez une convention métier.   |
| 13.0 – 18.0   | Champs : Projet · Bâtiment · Lot · Type · Rév. |
| 18.5 – 23.0   | Renommez tout un lot en quelques secondes.     |
| 23.5 – 27.0   | Exportez un ZIP propre. Local au navigateur.   |
| 27.5 – 29.8   | Essayez maintenant — doc-rename.com            |

---

## Assets nécessaires

La vidéo est **100 % code, 0 image bitmap**. Toutes les UI, icônes et
illustrations sont rendues à la volée par Remotion à partir de SVG et de
composants React. Conséquences pratiques :

- aucun dossier `public/` à pré-remplir ;
- aucune capture d'écran à fournir ;
- pas de stock vidéo / image — donc pas de licence à gérer ;
- modifier la palette, le wording ou l'ordre des scènes = quelques
  lignes dans `tokens.ts` ou `script.ts`, pas de re-shoot.

Si tu veux remplacer la reconstitution par de **vraies captures**, place
les PNG dans `video/public/` et utilise `<Img>` ou `staticFile()` dans la
scène concernée — l'AppFrame peut accueillir un screenshot en `<Img>` à
la place de ses children.

---

## Ajouter une voix off plus tard

La vidéo est livrée muette. Pour ajouter une piste plus tard :

1. Enregistre (ou génère par TTS) un MP3 / WAV calé sur la timeline
   `94 s` (master) ou `30 s` (short).
2. Place le fichier dans `video/public/voiceover.mp3`.
3. Dans `src/compositions/MainMaster.tsx`, ajoute :
   ```tsx
   import { Audio, staticFile } from 'remotion';
   // …
   <Audio src={staticFile('voiceover.mp3')} />
   ```
4. Re-rends. Les sous-titres restent — c'est plutôt un atout pour
   l'accessibilité.

> Important produit : ne pas promettre dans la voix off des choses que
> l'app ne fait pas (certification ISO, RGPD validée, etc.). Le script
> sous-titré ci-dessus a déjà été rédigé en évitant ces promesses.

---

## Conventions de timing

- **30 fps** partout. Donne 30 frames / seconde, ce qui rend les conversions
  seconde ↔ frame triviales (`s * 30`).
- Les durées de scène sont centralisées dans `tokens.ts > SCENE_FRAMES`.
  Modifier une valeur recompose automatiquement les sous-titres
  (sceneStartFrames) et la durée totale (`TOTAL_FRAMES`).
- Les helpers `liftIn`, `softSpring`, `fadeOut` dans `easing.ts`
  garantissent que toutes les apparitions partagent la même courbe.

---

## Garde-fous éditoriaux

Conformément au brief, la vidéo :

- **n'invente aucune fonctionnalité absente de l'app** ;
- **ne montre jamais un serveur recevant des fichiers** (scène 8 le dit
  explicitement) ;
- **ne revendique aucune certification** (ISO, RGPD entreprise, etc.) ;
- **n'utilise pas de stock générique** — uniquement le système visuel
  réel de BIMCHECK-Rename ;
- **garde une promesse mesurée** : « rapidement », « quelques minutes »,
  pas de « instantané » ou « magique ».

---

## Maintenance

| Tâche                          | Où regarder                                  |
| ------------------------------ | -------------------------------------------- |
| Changer la palette             | `src/lib/tokens.ts > colors`                 |
| Modifier le timing d'une scène | `src/lib/tokens.ts > SCENE_FRAMES`           |
| Réécrire un sous-titre         | `src/lib/script.ts > subtitles`              |
| Ajouter une scène              | nouveau fichier dans `src/scenes/` + Sequence dans `MainScenes` |
| Ajouter une variante de format | nouvelle composition + entrée dans `Root.tsx`|
| Changer l'URL CTA              | `src/scenes/SceneCTA.tsx` (texte `doc-rename.com`) |

---

## Licence

Code interne BIMCHECK-Rename — copyright (c) 2026 Winter Fernandes. Tous droits
réservés. Voir le `LICENSE` racine.
