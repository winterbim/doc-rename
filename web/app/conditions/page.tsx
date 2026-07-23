import { CONTACT_EMAIL } from "@/lib/contact";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HAS_DIRECT_CHECKOUT } from "@/lib/pricing";


export const metadata: Metadata = {
  title: "Conditions générales d’utilisation et de vente",
  description:
    "CGU/CGV de BIMCHECK-Rename : objet, offres Free/Team/Cabinet, paiement, résiliation, responsabilité et droit applicable (droit français).",
  alternates: { canonical: "/conditions" },
  openGraph: {
    title: "Conditions générales d’utilisation et de vente",
    description: "Conditions applicables à BIMCHECK-Rename et état d’ouverture des offres.",
    url: "/conditions",
  },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-07-23";

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
            Conditions générales
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
              <li><strong>Free</strong> : 0 € — 3 lots de renommage par jour (200 fichiers / 250 Mo par lot), sans compte, traitement local.</li>
              <li><strong>Team</strong> : 19 € / mois — lots illimités (1 000 fichiers / 1 Go par lot), rapport de renommage TXT, 1 poste actif, support email, licence activée automatiquement après paiement.</li>
              <li><strong>Cabinet</strong> : 49 € / mois — tout Team, plus bibliothèque de conventions multi-clients, rapport CSV d’audit, 5 000 fichiers / 2 Go par lot, entités illimitées, 3 postes actifs simultanés, support prioritaire, onboarding assisté.</li>
              <li><strong>Pilote 14 jours</strong> : 49 € (paiement unique) — accès aux fonctionnalités Cabinet pendant 14 jours, onboarding guidé.</li>
            </ul>
            <p>
              Prix de référence en euros (EUR). L’interface peut afficher des
              équivalents CHF ou USD à titre indicatif (conversion arrondie). La facturation
              suit le lien de paiement Stripe (mode live) ou un devis écrit. Les factures
              portent la mention « TVA non applicable, art. 293 B du CGI ».
              {!HAS_DIRECT_CHECKOUT && (
                <> Lorsque le paiement en ligne n’est pas actif sur ce déploiement, la
                souscription s’effectue sur devis écrit.</>
              )}
            </p>
          </Section>

          <Section id="paiement" title="5. Paiement, reconduction et résiliation">
            {HAS_DIRECT_CHECKOUT ? (
              <>
                <p>
                  Les paiements sont traités par notre prestataire <strong>Stripe</strong> en
                  mode production ; l’éditeur n’a pas accès à vos données de carte. Les
                  abonnements mensuels sont reconduits tacitement à chaque échéance jusqu’à
                  résiliation. L’activation de la licence (lots illimités) est{' '}
                  <strong>automatique</strong> dès confirmation du paiement, sur le navigateur
                  qui ouvre la page de confirmation.
                </p>
                <p>
                  Vous pouvez résilier à tout moment ; la résiliation prend effet à la fin de la
                  période en cours, sans remboursement du mois entamé sauf disposition légale
                  impérative contraire. Modalités de résiliation :{' '}
                  <strong>en self-service depuis le portail client Stripe</strong> (lien « Gérer
                  mon abonnement » communiqué dans l’email de confirmation Stripe et sur la{' '}
                  <Link href="/pricing" className="text-brick hover:underline">page Tarifs</Link>),
                  ou par notification email à {CONTACT_EMAIL}.
                </p>
              </>
            ) : (
              <p>
                Le paiement en ligne n’est pas encore branché sur ce déploiement. Dès activation
                Stripe live, les offres Team, Cabinet et Pilote seront payables directement depuis
                le site. Contact : {CONTACT_EMAIL}.
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
              Droit applicable : <strong>droit français</strong>. Juridiction compétente : tribunaux
              de <strong>Paris</strong>, sous réserve des règles protectrices des consommateurs. Le
              service reste accessible aux clients établis en Suisse ; la facturation est établie en
              euros (EUR).
            </p>
            {/* TODO(Winter) — obligation légale (art. L.612-1 code conso) : souscrire à un
                médiateur de la consommation et remplacer le placeholder ci-dessous par
                « Médiateur : [NOM] — [site web] ». Ne pas publier de faux nom. */}
            <p>
              <strong>Médiation de la consommation</strong> : conformément aux articles L.612-1 et
              suivants du Code de la consommation, tout consommateur a le droit de recourir
              gratuitement à un médiateur de la consommation. Médiateur désigné : désignation en
              cours — le nom et les coordonnées du médiateur seront publiés ici dès la souscription
              effective. Dans l’intervalle, adressez toute réclamation à {CONTACT_EMAIL}.
            </p>
            <p className="text-ink-mute">Contact : {CONTACT_EMAIL}.</p>
          </Section>
        </div>
      </div>
    </main>
  );
}
