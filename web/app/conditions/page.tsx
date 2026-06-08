import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation et de vente",
  description:
    "CGU/CGV de BimDoc Renamer : objet, offres Free/Pro/Team, paiement, résiliation, responsabilité et droit applicable (Suisse & France).",
  alternates: { canonical: "/conditions" },
  // BROUILLON : ne pas indexer tant que l’entité juridique n’est pas renseignée.
  robots: { index: false, follow: false },
};

const TODO = "[À COMPLÉTER]";

const sections = [
  { href: "#objet", label: "Objet" },
  { href: "#service", label: "Service" },
  { href: "#compte", label: "Compte" },
  { href: "#offres", label: "Offres & prix" },
  { href: "#paiement", label: "Paiement" },
  { href: "#retractation", label: "Rétractation" },
  { href: "#usage", label: "Usage" },
  { href: "#dispo", label: "Disponibilité" },
  { href: "#responsabilite", label: "Responsabilité" },
  { href: "#droit", label: "Droit" },
];

function Section({
  id,
  title,
  children,
}: Readonly<{
  id: string;
  title: string;
  children: ReactNode;
}>) {
  return (
    <section id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="font-sans text-2xl font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-ink-soft">{children}</div>
    </section>
  );
}

export default function ConditionsPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-sm font-sans font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
          ← Retour à BimDoc Renamer
        </Link>

        {/* BROUILLON — à retirer avant publication */}
        <div
          role="note"
          className="mb-8 rounded-lg border border-brick/40 bg-brick/5 p-4 text-sm leading-6 text-brick-deep"
        >
          <strong>Brouillon non contractuel.</strong> Modèle de CGU/CGV à <strong>faire relire par
          un professionnel du droit</strong> et à compléter ({TODO}) avant mise en ligne. Sans valeur
          juridique en l’état. Couvre à la fois la Suisse (CO / nLPD) et la France (Code civil / Code
          de la consommation / RGPD) — adapter selon l’entité réellement créée.
        </div>

        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Conditions générales · Suisse &amp; France
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Conditions d’utilisation et de vente
          </h1>
          <p className="mt-5 max-w-3xl font-sans text-xl leading-8 text-ink-soft">
            Les présentes conditions régissent l’accès et l’usage de BimDoc Renamer, outil de
            renommage de livrables BIM, ainsi que la souscription aux offres payantes.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">Dernière mise à jour : {TODO}.</p>
        </header>

        <nav aria-label="Sections des conditions" className="flex flex-wrap gap-2 border-b border-line py-5">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brick hover:text-brick"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-12 py-12">
          <Section id="objet" title="1. Objet et acceptation">
            <p>
              Les présentes Conditions Générales d’Utilisation et de Vente (« CGU/CGV ») encadrent la
              relation entre l’éditeur (voir{" "}
              <Link href="/mentions-legales" className="text-brick hover:underline">mentions légales</Link>)
              et tout utilisateur (« vous »). L’utilisation du service vaut acceptation pleine et
              entière des présentes.
            </p>
          </Section>

          <Section id="service" title="2. Description du service">
            <p>
              BimDoc Renamer permet de renommer et préparer des lots de livrables BIM selon une
              convention de nommage (ISO 19650, SIA 2051 ou personnalisée), puis de les exporter en
              ZIP. Le renommage, la prévisualisation et la génération du ZIP s’effectuent localement
              dans votre navigateur : le contenu de vos fichiers n’est pas transmis à l’éditeur.
            </p>
            <p>
              Le service ne constitue ni une certification ISO 19650, ni un système de gestion CDE, et
              ne modifie pas le contenu interne des fichiers (RVT, IFC, DWG, etc.).
            </p>
          </Section>

          <Section id="compte" title="3. Accès et compte">
            <p>
              La version Free est utilisable sans compte. Les offres payantes peuvent nécessiter un
              identifiant d’accès fourni après paiement. Vous êtes responsable de la confidentialité
              de vos identifiants et de toute activité réalisée via votre accès.
            </p>
          </Section>

          <Section id="offres" title="4. Offres et prix">
            <ul className="list-disc pl-5">
              <li><strong>Free</strong> : 0 CHF — usage limité (lots quotidiens plafonnés), sans compte.</li>
              <li><strong>Pro</strong> : 19,99 CHF / mois — usage illimité, conventions sauvegardées.</li>
              <li><strong>Team</strong> : 34,90 CHF / mois — jusqu’à 3 utilisateurs, conventions partagées.</li>
              <li><strong>Entreprise / Pilote</strong> : sur devis ou selon l’offre pilote en vigueur.</li>
            </ul>
            <p>
              Prix en francs suisses (CHF), {TODO} hors taxes / TTC selon le statut TVA de l’éditeur.
              Les prix peuvent évoluer ; le tarif applicable est celui en vigueur lors de la
              souscription. Une tarification en euros (EUR) pourra être proposée pour le marché
              français.
            </p>
          </Section>

          <Section id="paiement" title="5. Paiement, reconduction et résiliation">
            <p>
              Les paiements sont traités par notre prestataire <strong>Stripe</strong> ; l’éditeur
              n’a pas accès à vos données de carte. Les abonnements mensuels sont reconduits
              tacitement à chaque échéance jusqu’à résiliation.
            </p>
            <p>
              Vous pouvez résilier à tout moment ; la résiliation prend effet à la fin de la période
              en cours, sans remboursement du mois entamé sauf disposition légale impérative
              contraire. Modalités de résiliation : {TODO} (ex. par email à {CONTACT_EMAIL}).
            </p>
          </Section>

          <Section id="retractation" title="6. Droit de rétractation (consommateurs)">
            <p>
              Pour un client <strong>consommateur en France</strong>, un droit de rétractation de 14
              jours s’applique en principe. Toutefois, pour un service numérique fourni immédiatement,
              vous pouvez être invité à renoncer expressément à ce droit afin d’accéder au service
              sans délai. Les clients <strong>professionnels (B2B)</strong> ne bénéficient pas de ce
              droit. En droit suisse, aucun droit de rétractation légal général ne s’applique à la
              vente en ligne. À préciser : {TODO}.
            </p>
          </Section>

          <Section id="usage" title="7. Obligations et usages interdits">
            <p>Vous vous engagez à ne pas :</p>
            <ul className="list-disc pl-5">
              <li>contourner les limites techniques ou d’usage (notamment de l’offre Free) ;</li>
              <li>utiliser le service à des fins illicites ou portant atteinte aux droits de tiers ;</li>
              <li>tenter de décompiler, copier ou revendre le service sans autorisation ;</li>
              <li>perturber le fonctionnement ou la sécurité du service.</li>
            </ul>
          </Section>

          <Section id="dispo" title="8. Disponibilité et évolutions">
            <p>
              Le service est fourni « en l’état » et « selon disponibilité ». L’éditeur ne garantit
              pas une disponibilité ininterrompue et peut faire évoluer, suspendre ou interrompre tout
              ou partie du service, notamment pour maintenance. Aucun niveau de service (SLA) n’est
              garanti dans les offres standard.
            </p>
          </Section>

          <Section id="responsabilite" title="9. Garanties et responsabilité">
            <p>
              L’utilisateur reste seul responsable de la vérification des noms générés et de la
              conformité de ses livrables aux exigences de son projet ou de son CDE. Dans la limite
              autorisée par la loi, la responsabilité de l’éditeur est limitée aux dommages directs et
              plafonnée au montant payé au cours des 12 derniers mois. L’éditeur n’est pas responsable
              des pertes de données, indirectes ou immatérielles.
            </p>
          </Section>

          <Section id="droit" title="10. Données, modifications et droit applicable">
            <p>
              Le traitement des données personnelles est décrit dans la{" "}
              <Link href="/privacy" className="text-brick hover:underline">politique de confidentialité</Link>.
              L’éditeur peut modifier les présentes CGU/CGV ; la version applicable est celle publiée
              à la date d’utilisation.
            </p>
            <p>
              Droit applicable : {TODO} (suisse et/ou français selon l’entité). Juridiction
              compétente : tribunaux du siège de l’éditeur, sous réserve des règles protectrices des
              consommateurs. Pour la France, en cas de litige de consommation, un médiateur de la
              consommation pourra être désigné : {TODO}.
            </p>
            <p className="text-ink-mute">Contact : {CONTACT_EMAIL}.</p>
          </Section>
        </div>
      </div>
    </main>
  );
}
