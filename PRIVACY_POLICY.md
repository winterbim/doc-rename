# Politique de confidentialité — BIMCHECK-Rename

Version courte (référence publique : `/privacy` sur le site).

## Principe

BIMCHECK-Rename renomme les lots de fichiers **localement dans le navigateur**.
Les fichiers ne sont **pas envoyés** à un serveur pour être renommés.

## Données traitées côté navigateur

- Fichiers importés (en mémoire / Blob) le temps de la session
- Préférences et conventions (localStorage : champs, profil métier, entités…)
- Compteur de quota Free (local, non nominatif sur les fichiers)

## Télémétrie optionnelle

Si activée (`NEXT_PUBLIC_TELEMETRY_ENABLED` / PostHog / Sentry), uniquement des
événements d’usage et d’erreurs techniques — **pas le contenu des fichiers**.

## Contact

Voir l’email de contact dans l’application (`web/lib/contact.ts`).

## Propriété

Logiciel propriétaire, Winter Fernandes. Tous droits réservés.
