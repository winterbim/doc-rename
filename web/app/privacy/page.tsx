import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confidentialité",
  description:
    "Politique de confidentialité de DOC-RENAME: traitement local des fichiers, aucun upload serveur pour le renommage BIM.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit text-sm font-sans font-semibold text-ink hover:text-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
        >
          ← Retour à DOC-RENAME
        </Link>

        <header className="border-b border-line pb-10">
          <p className="mb-3 text-xs font-sans font-semibold uppercase tracking-[0.16em] text-ink-mute">
            Politique de confidentialité
          </p>
          <h1 className="max-w-2xl font-sans text-5xl font-semibold leading-tight tracking-tight text-ink sm:text-6xl">
            Vos fichiers restent dans votre navigateur.
          </h1>
          <p className="mt-5 max-w-2xl font-sans text-xl leading-8 text-ink-soft">
            DOC-RENAME est conçu pour préparer des livrables BIM sensibles sans envoyer les
            fichiers source vers un serveur. Le renommage, la lecture ZIP et les aperçus se font
            localement lorsque le navigateur le permet.
          </p>
          <p className="mt-5 text-sm font-sans text-ink-mute">
            Dernière mise à jour: janvier 2026.
          </p>
        </header>

        <div className="grid gap-10 py-12">
          <section aria-labelledby="data-collection">
            <h2 id="data-collection" className="font-sans text-2xl font-semibold text-ink">
              Données collectées
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              DOC-RENAME ne collecte pas le contenu de vos fichiers et ne les transmet pas à un
              service externe pour les renommer. Les noms de fichiers, archives et documents déposés
              sont traités dans la session locale du navigateur.
            </p>
          </section>

          <section aria-labelledby="local-storage">
            <h2 id="local-storage" className="font-sans text-2xl font-semibold text-ink">
              Données stockées localement
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              L&apos;application peut conserver dans le stockage local du navigateur des préférences
              d&apos;interface, des modèles de nomenclature, des règles de préfixes et un historique
              textuel de renommage. Ces données restent sur l&apos;appareil utilisé.
            </p>
          </section>

          <section id="rgpd" aria-labelledby="gdpr">
            <h2 id="gdpr" className="font-sans text-2xl font-semibold text-ink">
              RGPD et suppression
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              Vous pouvez supprimer les données locales depuis les réglages du navigateur ou depuis
              les commandes de l&apos;application lorsque disponibles. Comme les fichiers ne sont pas
              uploadés, DOC-RENAME ne conserve pas de copie serveur de vos documents.
            </p>
          </section>

          <section id="conditions" aria-labelledby="terms">
            <h2 id="terms" className="font-sans text-2xl font-semibold text-ink">
              Conditions d&apos;utilisation
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              L&apos;outil aide à appliquer une convention de nommage BIM. La validation finale de la
              conformité avec les exigences du projet, de la CDE ou du maître d&apos;ouvrage reste à la
              charge de l&apos;utilisateur.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact" className="font-sans text-2xl font-semibold text-ink">
              Contact
            </h2>
            <p className="mt-3 max-w-3xl text-ink-soft">
              Pour toute question:{" "}
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
