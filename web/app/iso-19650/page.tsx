import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Guide de convention de nommage ISO 19650',
  description:
    "Guide pratique de la convention de nommage ISO 19650 (UK National Annex). Champs, exemples, FAQ. Modèle JSON prêt à importer dans BIMCHECK-Rename.",
  alternates: {
    canonical: '/iso-19650',
  },
  openGraph: {
    title: 'Guide de convention de nommage ISO 19650',
    description: 'Guide pratique et modèle adaptable pour préparer vos noms de fichiers avant dépôt.',
    url: '/iso-19650',
  },
  keywords: [
    'ISO 19650',
    'convention nommage BIM',
    'UK National Annex',
    'BS EN ISO 19650',
    'auto-naming BIM',
    'livrable BIM',
    'BEP',
    'EIR',
    'CDE',
  ],
};

const fields: Array<{ code: string; label: string; sample: string; comment: string }> = [
  { code: 'Project', label: 'Code projet', sample: 'PRJ01', comment: 'Identifiant unique selon votre BEP.' },
  { code: 'Originator', label: 'Émetteur', sample: 'AGC', comment: "Code de l’entreprise ou agence émettrice." },
  { code: 'Volume', label: 'Volume / système', sample: 'ZZ', comment: 'ZZ = projet entier · sinon code à 2 lettres.' },
  { code: 'Level', label: 'Niveau', sample: 'GF', comment: 'GF = RdC · 00, 01, 02 = niveaux · B1 = sous-sol.' },
  { code: 'Type', label: 'Type', sample: 'DR', comment: 'DR=Drawing, MO=Model, RP=Report, SP=Specification, SH=Schedule, CO=Correspondence.' },
  { code: 'Role', label: 'Discipline', sample: 'A', comment: 'A=Architecte, S=Structure, M=MEP, C=Civil, L=Landscape, I=Interior.' },
  { code: 'Number', label: 'Numéro', sample: '0001', comment: 'Séquence à 4 chiffres.' },
  { code: 'Suffix', label: 'Révision indicative', sample: 'P02', comment: 'Exemple à adapter : statut et révision peuvent être gérés séparément selon le BEP / EIR.' },
];

const faq: Array<{ q: string; a: string }> = [
  {
    q: 'Cette convention est-elle obligatoire en marché public ?',
    a: "Pas automatiquement. Les exigences contractuelles, le BEP / EIR et les règles du CDE du projet déterminent le format à appliquer. Ce modèle doit donc être validé par le responsable de l’information du projet.",
  },
  {
    q: 'Que faire si mon BEP impose un autre ordre de champs ?',
    a: "Le modèle ci-dessous est un point de départ. Dans BIMCHECK-Rename, vous pouvez réorganiser, ajouter ou supprimer des champs librement — la convention résultante reste exportable en JSON pour archivage.",
  },
  {
    q: 'Quelle différence entre P02 et S2 ?',
    a: 'Dans certains schémas, P02 représente une révision et S2 un statut d’usage ou de partage. Leur sens exact, leur emplacement dans le nom et les valeurs autorisées doivent être lus dans le BEP / EIR et la configuration du CDE.',
  },
  {
    q: 'Est-ce compatible avec Autodesk Docs / ACC ?',
    a: "BIMCHECK-Rename produit des noms de fichiers ; leur acceptation dans Autodesk Docs / ACC dépend du standard de nommage configuré pour votre projet. Comparez toujours l’aperçu avec les règles du CDE avant le dépôt.",
  },
  {
    q: 'Quid de la Suisse ?',
    a: "Appliquez d’abord les exigences contractuelles du projet. SIA 2051 peut être une référence pertinente en Suisse, sans prévaloir automatiquement. Le profil Swiss BIM de l’atelier reste un point de départ à adapter.",
  },
];

export default function Iso19650Page() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-sm font-sans font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
          ← Retour à BIMCHECK-Rename
        </Link>

        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Guide pratique · UK National Annex
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            La convention <em className="font-serif italic font-normal text-brick">ISO 19650</em> expliquée
            sans jargon.
          </h1>
          <p className="mt-5 max-w-3xl font-sans text-xl leading-8 text-ink-soft">
            ISO 19650 encadre la gestion de l’information sur les projets BIM.
            Les noms de fichiers dépendent toutefois du contrat, du BEP / EIR,
            des annexes applicables et du CDE. Voici un exemple adaptable, plus
            un modèle réellement importable — pas une certification de conformité.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">
            Dernière mise à jour : 2026-05-20.
          </p>
        </header>

        <section className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            Structure du nom de fichier
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Le modèle téléchargeable ci-dessous combine sept champs et un exemple
            de révision. Cet ordre n’est pas universel : adaptez-le aux documents
            du projet, et gérez le statut séparément si le CDE l’exige.
          </p>
          <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper-2/30 p-6">
            <code className="block whitespace-pre font-mono text-base text-ink">
              {`Project-Originator-Volume-Level-Type-Role-Number-Suffix.ext

PRJ01    -AGC -ZZ -GF -DR -A -0001    -P02   .pdf
↑project ↑em ↑vol ↑lvl ↑type ↑role ↑number ↑suffix`}
            </code>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-2/60">
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Champ</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Libellé</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Exemple</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-ink">Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.code} className="border-b border-line">
                    <td className="px-4 py-3 font-mono text-xs text-brick">{f.code}</td>
                    <td className="px-4 py-3 text-sm text-ink">{f.label}</td>
                    <td className="px-4 py-3 font-mono text-xs text-olive font-semibold">{f.sample}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{f.comment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            Modèle JSON prêt à importer
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Téléchargez le modèle ci-dessous et importez-le dans BIMCHECK-Rename
            Renamer (bouton « ↑ Fichier » du panneau Nomenclature). Vous
            pouvez ensuite réorganiser les champs ou ajuster les exemples
            pour coller à votre BEP.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/templates/iso-19650-uk-na.json"
              download="iso-19650-uk-na.json"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brick"
            >
              ↓ Télécharger le modèle JSON
            </a>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Ouvrir BIMCHECK-Rename pour l’importer →
            </Link>
          </div>

          <div className="mt-8 rounded-lg border border-line bg-ink p-6">
            <p className="mb-3 text-xs font-mono uppercase tracking-wide text-gold-soft" style={{ color: '#E0B96B' }}>
              iso-19650-uk-na.json — aperçu
            </p>
            <pre className="overflow-x-auto text-xs leading-relaxed text-paper">
{`{
  "name": "ISO 19650 — UK National Annex",
  "separator": "-",
  "case": "UPPER",
  "fields": [
    { "code": "Project",    "label": "Code projet",  "example": "PRJ01" },
    { "code": "Originator", "label": "Émetteur",     "example": "AGC"   },
    { "code": "Volume",     "label": "Volume",       "example": "ZZ"    },
    { "code": "Level",      "label": "Niveau",       "example": "GF"    },
    { "code": "Type",       "label": "Type",         "example": "DR"    },
    { "code": "Role",       "label": "Discipline",   "example": "A"     },
    { "code": "Number",     "label": "Numéro",       "example": "0001"  }
  ],
  "suffix": { "code": "Revision", "format": "{Status}{NN}" }
}`}
            </pre>
          </div>
        </section>

        <section className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            Exemples Avant / Après
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Quelques transformations typiques sur un lot de fin de phase :
          </p>

          <div className="mt-6 grid gap-3">
            {[
              ['facade etage 1 FINAL v2.pdf', 'PRJ01-AGC-ZZ-XX-DR-A-0001-P02.pdf'],
              ['plan rdc copie.dwg', 'PRJ01-AGC-ZZ-GF-DR-A-0010-P01.dwg'],
              ['rapport synthese v3.docx', 'PRJ01-AGC-ZZ-XX-RP-S-0003-P03.docx'],
              ['DOE structure.zip', 'PRJ01-AGC-ZZ-XX-ZZ-S-DOE-P01.zip'],
            ].map(([before, after]) => (
              <div key={before} className="grid gap-2 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 sm:gap-6 dark:bg-paper-2">
                <code className="font-mono text-xs text-ink-mute line-through decoration-brick">{before}</code>
                <code className="font-mono text-xs font-semibold text-olive">{after}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            Checklist avant dépôt CDE
          </h2>
          <p className="mt-4 max-w-3xl text-base text-ink-soft">
            Avant de pousser un lot dans Autodesk Docs, Trimble Connect, Kroqi ou votre CDE interne,
            vérifiez les points qui créent le plus souvent des rejets ou des retours de coordination.
          </p>
          <ul className="mt-6 grid gap-3 text-sm leading-6 text-ink-soft sm:grid-cols-2">
            {[
              'Convention confirmée dans le BEP ou la convention donneur d’ordre.',
              'Codes émetteur, discipline, zone, niveau et type validés.',
              'Statut et révision séparés de la séquence documentaire.',
              'Aperçu Avant / Après relu sur les fichiers sensibles du jalon.',
              'ZIP final exporté avec l’arborescence attendue.',
              'Aucun contenu fichier envoyé à un service externe pendant le renommage.',
            ].map((item) => (
              <li key={item} className="flex gap-2 rounded-lg border border-line bg-surface p-3 dark:bg-paper-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-line py-12">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-ink">
            Questions fréquentes
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faq.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer text-base font-semibold text-ink">{item.q}</summary>
                <p className="mt-3 max-w-3xl text-sm text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="rounded-lg bg-ink p-8 text-paper sm:p-12">
            <p className="text-xs font-mono uppercase tracking-wide text-gold-soft" style={{ color: '#E0B96B' }}>
              Étape suivante
            </p>
            <h2 className="mt-2 max-w-2xl font-sans text-3xl font-semibold leading-tight">
              Appliquez cette convention à votre prochain lot — sans compte.
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
                style={{ background: '#C0913F' }}
              >
                Ouvrir BIMCHECK-Rename →
              </Link>
              <Link
                href="/pilot"
                className="inline-flex items-center gap-2 rounded-full border border-paper/40 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                Demander un pilote
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-line py-8 text-sm text-ink-mute">
          <p>
            BIMCHECK-Rename — guide ISO 19650 ·{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brick font-semibold underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
