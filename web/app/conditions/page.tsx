import { CONTACT_EMAIL } from "@/lib/contact";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HAS_DIRECT_CHECKOUT, PAID_ACCOUNTS_AVAILABLE } from "@/lib/pricing";


export const metadata: Metadata = {
  title: "Conditions générales d’utilisation et de vente",
  description:
    "CGU/CGV de BIMCHECK-Rename : objet, offres Free/Team/Cabinet, paiement, résiliation, responsabilité et droit applicable (Suisse & France).",
  alternates: { canonical: "/conditions" },
  openGraph: {
    title: "Conditions générales d’utilisation et de vente",
    description: "Conditions applicables à BIMCHECK-Rename et état d’ouverture des offres.",
    url: "/conditions",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-07-21";

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
          ← Retour à BIMCHECK-Rename
        </Link>


        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Conditions générales · Suisse &amp; France
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Conditions d’utilisation et de vente
          </h1>
          <p className="mt-5 max-w-3xl font-sans text-xl leading-8 text-ink-soft">
            Les présentes conditions régissent l’accès et l’usage de BIMCHECK-Rename, outil de
            convention de nommage multi-métiers, ainsi que la souscription aux offres payantes.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">Dernière mise à jour : {LAST_UPDATED}.</p>
        </header>

        <nav aria-label="Sections des conditions" className="flex flex-wrap gap-2 border-b border-line py-5">
          {sections.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brick hover:text-brick dark:bg-paper-2"
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
              BIMCHECK-Rename permet de renommer et préparer des lots de fichiers selon une
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
              <li><strong>Free</strong> : 0 € — 5 lots de renommage par jour, sans compte, traitement local.</li>
              <li><strong>Team</strong> : tarif cible 19 € / mois — lots illimités, compte, sync des conventions, jusqu’à 10 utilisateurs et 3 projets.</li>
              <li><strong>Cabinet</strong> : tarif cible 49 € / mois — jusqu’à 1 000 membres et projets, support prioritaire.</li>
              <li><strong>Pilote 14 jours</strong> : 49 € (paiement unique) — onboarding guidé, selon offre en vigueur.</li>
            </ul>
            <p>
              Prix de référence en euros (EUR). L’interface peut afficher des
              équivalents CHF ou USD à titre indicatif (conversion arrondie). La facturation
              suit le lien de paiement Stripe ou le devis seulement lorsqu’une offre est ouverte.
              Tant que les comptes payants sont fermés, ces montants ne constituent pas une offre
              de vente. Avant toute commande, un écrit devra préciser le prix HT/TTC, les taxes,
              l’identité de facturation et les droits effectivement fournis.
            </p>
          </Section>

          <Section id="paiement" title="5. Paiement, reconduction et résiliation">
            {HAS_DIRECT_CHECKOUT && PAID_ACCOUNTS_AVAILABLE ? (
              <>
                <p>
                  Les paiements sont traités par notre prestataire <strong>Stripe</strong> ;
                  l’éditeur n’a pas accès à vos données de carte. Les abonnements mensuels sont
                  reconduits tacitement à chaque échéance jusqu’à résiliation.
                </p>
                <p>
                  Vous pouvez résilier à tout moment ; la résiliation prend effet à la fin de la
                  période en cours, sans remboursement du mois entamé sauf disposition légale
                  impérative contraire. Modalités de résiliation : notification par email à{' '}
                  {CONTACT_EMAIL}.
                </p>
              </>
            ) : (
              <p>
                Aucun paiement ni abonnement n’est actuellement initié depuis le site public. Les
                comptes Team et Cabinet ne sont pas ouverts. Les demandes servent à préparer un
                échange, sans prélèvement ni engagement ; aucune commande n’est acceptée tant que
                l’identité légale, le traitement fiscal et les droits livrés ne sont pas confirmés par écrit.
              </p>
            )}
          </Section>

          <Section id="retractation" title="6. Droit de rétractation (consommateurs)">
            <p>
              Pour un client <strong>consommateur en France</strong>, un droit de rétractation de 14
              jours s’applique en principe. Toutefois, pour un service numérique fourni immédiatement,
              vous pouvez être invité à renoncer expressément à ce droit afin d’accéder au service
              sans délai. Les clients <strong>professionnels (B2B)</strong> ne bénéficient pas de ce
              droit. En droit suisse, aucun droit de rétractation légal général ne s’applique à la
              vente en ligne.
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
              Droit applicable : droit du siège de l’éditeur. Juridiction compétente : tribunaux du
              siège de l’éditeur, sous réserve des règles protectrices des consommateurs. Pour la
              France, en cas de litige de consommation, un médiateur de la consommation peut être saisi
              conformément aux dispositions légales en vigueur.
            </p>
            <p className="text-ink-mute">Contact : {CONTACT_EMAIL}.</p>
          </Section>
        </div>
      </div>
    </main>
  );
}
