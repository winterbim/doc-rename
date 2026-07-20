import { CONTACT_EMAIL } from "@/lib/contact";
import type { Metadata } from "next";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Identification de l’éditeur de BIMCHECK-Rename, hébergement, propriété intellectuelle et droit applicable.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-01-01";
const LEGAL_PLACEHOLDER = "Informations légales disponibles sur demande écrite";

export default function MentionsLegalesPage() {
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
            Informations légales · Suisse &amp; France
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Mentions légales
          </h1>
          <p className="mt-5 text-sm font-sans text-ink-mute">Dernière mise à jour : {LAST_UPDATED}.</p>
        </header>

        <div className="grid gap-12 py-12">
          <section aria-labelledby="editeur">
            <h2 id="editeur" className="font-sans text-2xl font-semibold text-ink">
              Éditeur du service
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface dark:bg-paper-2">
              <table className="w-full border-collapse text-left text-sm">
                <tbody className="divide-y divide-line">
                  {[
                    ["Raison sociale / nom", LEGAL_PLACEHOLDER],
                    ["Forme juridique", LEGAL_PLACEHOLDER],
                    ["Adresse du siège", LEGAL_PLACEHOLDER],
                    ["N° d’identification", LEGAL_PLACEHOLDER],
                    ["N° de TVA", LEGAL_PLACEHOLDER],
                    ["Capital social", LEGAL_PLACEHOLDER],
                    ["Directeur de la publication", "Jawani Fernandes"],
                    ["Contact", CONTACT_EMAIL],
                  ].map(([k, v]) => (
                    <tr key={k}>
                      <th scope="row" className="bg-paper-2 px-4 py-3 font-medium text-ink align-top w-1/3">
                        {k}
                      </th>
                      <td className="px-4 py-3 text-ink-soft">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="hebergeur">
            <h2 id="hebergeur" className="font-sans text-2xl font-semibold text-ink">
              Hébergement
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Le site et l’application sont hébergés par <strong>Vercel Inc.</strong>, 340 S Lemon Ave
              #4133, Walnut, CA 91789, États-Unis — <a className="text-brick hover:underline" href="https://vercel.com">vercel.com</a>.
              Le traitement des fichiers déposés s’effectue localement dans le navigateur de
              l’utilisateur (architecture local-first) ; voir la{" "}
              <Link href="/security" className="text-brick hover:underline">page sécurité</Link>.
            </p>
          </section>

          <section aria-labelledby="pi">
            <h2 id="pi" className="font-sans text-2xl font-semibold text-ink">
              Propriété intellectuelle
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              La marque « BIMCHECK-Rename », le logiciel, son code, son interface et ses contenus sont
              protégés et restent la propriété exclusive de l’éditeur. Toute reproduction ou
              réutilisation non autorisée est interdite. Le code source est distribué sous licence
              propriétaire (UNLICENSED).
            </p>
          </section>

          <section aria-labelledby="donnees">
            <h2 id="donnees" className="font-sans text-2xl font-semibold text-ink">
              Données personnelles
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Le traitement des données personnelles (compte, facturation, télémétrie optionnelle) est
              décrit dans la{" "}
              <Link href="/privacy" className="text-brick hover:underline">
                politique de confidentialité
              </Link>{" "}
              (conforme RGPD pour l’UE et nLPD pour la Suisse).
            </p>
          </section>

          <section aria-labelledby="droit">
            <h2 id="droit" className="font-sans text-2xl font-semibold text-ink">
              Droit applicable
            </h2>
            <p className="mt-4 text-sm leading-6 text-ink-soft">
              Le présent site est régi par le droit du siège de l’éditeur. Tout litige relève des
              tribunaux compétents du siège de l’éditeur, sous réserve des dispositions impératives
              protégeant les consommateurs.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
