import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité, sécurité et conditions",
  description:
    "Politique de confidentialité DOC-RENAME: traitement local des fichiers, migration SaaS, RGPD, CNIL, sécurité, cookies et conditions d'utilisation.",
  alternates: {
    canonical: "/privacy",
  },
};

const sections = [
  { href: "#resume", label: "Résumé" },
  { href: "#donnees", label: "Données" },
  { href: "#rgpd", label: "RGPD" },
  { href: "#securite", label: "Sécurité" },
  { href: "#conditions", label: "Conditions" },
  { href: "#contact", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-sm font-sans font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
          ← Retour à DOC-RENAME
        </Link>

        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Confidentialité · Sécurité · Conditions
          </p>
          <h1 className="max-w-3xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Un SaaS local-first pour des documents sensibles.
          </h1>
          <p className="mt-5 max-w-3xl font-sans text-xl leading-8 text-ink-soft">
            DOC-RENAME devient un service freemium / Pro / Team, mais le principe central ne
            change pas: le renommage, la prévisualisation et l’export ZIP se font dans votre
            navigateur lorsque la fonctionnalité le permet. Le contenu de vos fichiers n’est pas
            envoyé à DOC-RENAME pour être renommé.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">
            Dernière mise à jour: 17 mai 2026.
          </p>
        </header>

        <nav aria-label="Sections de la politique" className="flex flex-wrap gap-2 border-b border-line py-5">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-brick hover:text-brick"
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-12 py-12">
          <section id="resume" aria-labelledby="summary">
            <h2 id="summary" className="font-sans text-2xl font-semibold text-ink">
              Résumé clair
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-base font-semibold text-ink">Ce qui reste local</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Fichiers déposés, contenu des documents, prévisualisation, génération des noms et
                  ZIP de sortie restent traités côté navigateur pour le flux de renommage.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-base font-semibold text-ink">Ce qui peut être traité côté SaaS</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Compte, email, plan Free/Pro/Team, facturation, support, télémétrie minimale et
                  journaux d’erreur si ces services sont activés.
                </p>
              </div>
            </div>
          </section>

          <section id="donnees" aria-labelledby="data-collection">
            <h2 id="data-collection" className="font-sans text-2xl font-semibold text-ink">
              Données traitées
            </h2>

            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-paper-2 text-ink">
                  <tr>
                    <th className="border-b border-line px-4 py-3 font-semibold">Catégorie</th>
                    <th className="border-b border-line px-4 py-3 font-semibold">Exemples</th>
                    <th className="border-b border-line px-4 py-3 font-semibold">Finalité</th>
                    <th className="border-b border-line px-4 py-3 font-semibold">Base RGPD</th>
                  </tr>
                </thead>
                <tbody className="text-ink-soft">
                  <tr>
                    <td className="border-b border-line px-4 py-3 text-ink">Fichiers locaux</td>
                    <td className="border-b border-line px-4 py-3">Nom, extension, taille, contenu dans l’onglet</td>
                    <td className="border-b border-line px-4 py-3">Renommage, aperçu, export ZIP</td>
                    <td className="border-b border-line px-4 py-3">Exécution du service demandé</td>
                  </tr>
                  <tr>
                    <td className="border-b border-line px-4 py-3 text-ink">Préférences locales</td>
                    <td className="border-b border-line px-4 py-3">Profil métier, champs, conventions, thème, compteur Free quotidien</td>
                    <td className="border-b border-line px-4 py-3">Retrouver votre configuration et appliquer la limite gratuite locale</td>
                    <td className="border-b border-line px-4 py-3">Exécution du service / intérêt légitime</td>
                  </tr>
                  <tr>
                    <td className="border-b border-line px-4 py-3 text-ink">Compte SaaS</td>
                    <td className="border-b border-line px-4 py-3">Email, identifiant, plan, équipe</td>
                    <td className="border-b border-line px-4 py-3">Accès Free, Pro, Team et quotas</td>
                    <td className="border-b border-line px-4 py-3">Exécution du contrat</td>
                  </tr>
                  <tr>
                    <td className="border-b border-line px-4 py-3 text-ink">Facturation</td>
                    <td className="border-b border-line px-4 py-3">Plan, montant, statut, justificatifs</td>
                    <td className="border-b border-line px-4 py-3">Paiement, comptabilité, obligations légales</td>
                    <td className="border-b border-line px-4 py-3">Contrat / obligation légale</td>
                  </tr>
                  <tr>
                    <td className="border-b border-line px-4 py-3 text-ink">Support</td>
                    <td className="border-b border-line px-4 py-3">Emails, demandes, pièces jointes envoyées volontairement</td>
                    <td className="border-b border-line px-4 py-3">Répondre aux demandes et corriger les problèmes</td>
                    <td className="border-b border-line px-4 py-3">Intérêt légitime / contrat</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-ink">Mesure et erreurs</td>
                    <td className="px-4 py-3">Pages vues, environnement technique, erreurs applicatives</td>
                    <td className="px-4 py-3">Sécurité, stabilité, amélioration du service</td>
                    <td className="px-4 py-3">Intérêt légitime ou consentement selon le traceur</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 max-w-3xl text-ink-soft">
              DOC-RENAME ne doit pas recevoir vos fichiers pour renommer un lot. Si vous envoyez
              volontairement un fichier au support, il sera traité uniquement pour résoudre votre
              demande.
            </p>
          </section>

          <section aria-labelledby="local-storage">
            <h2 id="local-storage" className="font-sans text-2xl font-semibold text-ink">
              Stockage local, cookies et traceurs
            </h2>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Stockage local</h3>
                <p className="mt-2 text-ink-soft">
                  L’application utilise le stockage local du navigateur pour conserver les
                  préférences, conventions, champs actifs, règles de préfixes et paramètres
                  d’interface. Le compteur Free local peut aussi y stocker le nombre de fichiers
                  renommés dans la journée. Ces éléments sont supprimables depuis le navigateur ou par les
                  fonctions de réinitialisation de l’application lorsqu’elles existent.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Mesure d’audience</h3>
                <p className="mt-2 text-ink-soft">
                  La télémétrie est désactivée tant que les variables d’environnement requises ne
                  sont pas configurées. Si elle est activée, elle est limitée: pas d’autocapture,
                  pas d’enregistrement de session par défaut, masquage du texte et respect du
                  signal Do Not Track.
                </p>
              </div>
            </div>
          </section>

          <section id="rgpd" aria-labelledby="gdpr">
            <h2 id="gdpr" className="font-sans text-2xl font-semibold text-ink">
              RGPD, CNIL et droits des personnes
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              Cette page est rédigée pour respecter les principes de transparence du RGPD: expliquer
              simplement quelles données sont traitées, pourquoi, sur quelle base, pendant combien
              de temps et comment exercer vos droits.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-lg font-semibold text-ink">Responsable du traitement</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  DOC-RENAME, représenté par Jawani Fernandes, détermine les finalités et moyens des
                  traitements nécessaires au service SaaS. Pour les documents que vous traitez
                  localement, vous restez responsable de leur contenu et des personnes concernées
                  dans vos propres fichiers.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-lg font-semibold text-ink">Sous-traitants</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Des prestataires peuvent intervenir pour l’hébergement, les emails, le paiement,
                  les erreurs ou la mesure d’audience. Ils ne doivent pas recevoir le contenu des
                  fichiers déposés dans le renamer local.
                </p>
              </div>
            </div>

            <h3 className="mt-6 font-sans text-lg font-semibold text-ink">Vos droits</h3>
            <p className="mt-2 max-w-3xl text-ink-soft">
              Vous pouvez demander l’accès, la rectification, l’effacement, la limitation,
              l’opposition ou la portabilité des données personnelles vous concernant, lorsque ces
              droits s’appliquent. Vous pouvez aussi retirer votre consentement lorsqu’un traitement
              repose sur celui-ci. Si vous estimez que vos droits ne sont pas respectés, vous pouvez
              saisir l’autorité de contrôle compétente, notamment la CNIL.
            </p>

            <h3 className="mt-6 font-sans text-lg font-semibold text-ink">Durées de conservation</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-ink-soft">
              <li>Données de compte: pendant la durée du compte, puis suppression ou anonymisation.</li>
              <li>Données de facturation: durée requise par les obligations comptables et fiscales.</li>
              <li>Support: durée nécessaire au traitement de la demande et au suivi raisonnable.</li>
              <li>Journaux techniques: durée courte, proportionnée à la sécurité et au diagnostic.</li>
              <li>Données locales: jusqu’à suppression par l’utilisateur ou le navigateur.</li>
            </ul>
          </section>

          <section id="securite" aria-labelledby="security">
            <h2 id="security" className="font-sans text-2xl font-semibold text-ink">
              Sécurité et confidentialité opérationnelle
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-lg font-semibold text-ink">Mesures applicatives</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
                  <li>Traitement local prioritaire pour les fichiers.</li>
                  <li>Limites de taille et contrôles de noms avant lecture.</li>
                  <li>Content Security Policy et en-têtes de sécurité côté Next.js.</li>
                  <li>Pas d’envoi volontaire de contenu de fichiers à l’analytics ou au monitoring.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-line bg-white p-4">
                <h3 className="font-sans text-lg font-semibold text-ink">Limites</h3>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
                  <li>Vous devez vérifier les noms générés avant diffusion.</li>
                  <li>L’outil ne valide pas le contenu juridique, médical, financier ou technique.</li>
                  <li>Un fichier envoyé volontairement au support sort du flux local-first.</li>
                  <li>Aucun système ne garantit une sécurité absolue.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="conditions" aria-labelledby="terms">
            <h2 id="terms" className="font-sans text-2xl font-semibold text-ink">
              Conditions d’utilisation
            </h2>
            <div className="mt-4 grid gap-6">
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Objet du service</h3>
                <p className="mt-2 max-w-3xl text-ink-soft">
                  BimDoc Renamer aide à appliquer une convention de nommage BIM
                  (ISO 19650, SIA 2051 ou convention maison) à des lots de
                  livrables avant dépôt CDE. Le service ne remplace pas une
                  CDE, une GED, ni une certification réglementaire.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Offres Free, Pro et Team</h3>
                <p className="mt-2 max-w-3xl text-ink-soft">
                  Pendant la phase d’accès privé, le quota local de 3 fichiers par jour est
                  désactivé. L’offre Pro vise un usage individuel illimité à 19.99 CHF/mois.
                  L’offre Team vise les petites équipes à 34.90 CHF/mois, avec conventions
                  partagées et jusqu’à 3 utilisateurs inclus. Les modalités exactes de paiement,
                  taxes, renouvellement, résiliation et facturation sont précisées au moment de la
                  souscription ou dans le devis correspondant.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Responsabilité utilisateur</h3>
                <p className="mt-2 max-w-3xl text-ink-soft">
                  Vous êtes responsable des fichiers que vous traitez, des conventions que vous
                  appliquez, des droits sur les documents, de la conformité de vos traitements
                  internes et de la vérification finale avant envoi, dépôt ou archivage.
                </p>
              </div>
              <div>
                <h3 className="font-sans text-lg font-semibold text-ink">Usage interdit</h3>
                <p className="mt-2 max-w-3xl text-ink-soft">
                  Il est interdit d’utiliser DOC-RENAME pour contourner des obligations légales,
                  masquer l’origine de documents, diffuser des fichiers illicites ou traiter des
                  données sans base légale dans votre propre organisation.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="changes">
            <h2 id="changes" className="font-sans text-2xl font-semibold text-ink">
              Évolution de cette politique
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              Cette politique sera mise à jour lors de l’activation effective d’un paiement en
              ligne, d’un système de comptes, d’un nouvel hébergeur, d’un nouveau sous-traitant ou
              d’une modification importante des traitements. Les changements importants seront
              signalés dans l’application ou par email lorsque c’est nécessaire.
            </p>
          </section>

          <section id="contact" aria-labelledby="contact-title">
            <h2 id="contact-title" className="font-sans text-2xl font-semibold text-ink">
              Contact
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              Pour toute question relative à la confidentialité, à la sécurité, au RGPD ou aux
              conditions d’utilisation:{" "}
              <a
                href="mailto:contact@bimdoc-renamer.com"
                className="text-brick underline underline-offset-4 hover:text-brick-deep"
              >
                contact@bimdoc-renamer.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
