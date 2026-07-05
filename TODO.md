# TODO — Audit final “vendable” + renommage BIMCHEcK-Rename

## 1) Rebranding global
- [ ] Uniformiser le nom produit vers **BIMCHEcK-Rename** dans les pages publiques et docs clés
- [ ] Mettre à jour metadata (titre, applicationName, URLs publiques)
- [ ] Mettre à jour le package name web si nécessaire

### Audit ciblé effectué
- [x] Lecture `web/app/layout.tsx` (metadata globale + branding + URL)
- [x] Lecture `web/app/page.tsx` (landing principale + branding + schema.org + footer)
- [x] Lecture `web/app/mentions-legales/page.tsx` (TODO juridiques bloquants)
- [x] Lecture `web/app/conditions/page.tsx` (TODO juridiques bloquants)
- [x] Lecture `web/next.config.ts` (CSP + headers sécurité)
- [x] Lecture `web/app/api/access/route.ts` (cookie de protection d’accès)
- [x] Lecture `web/instrumentation.ts` et `web/instrumentation-client.ts` (Sentry)

## 2) Juridique publiable
- [ ] Supprimer les TODO bloquants dans `/mentions-legales` et `/conditions`
- [ ] Rendre les textes juridiquement non trompeurs et publiables en l’état
- [ ] Aligner `/privacy` avec les textes finaux

## 3) Hardening sécurité
- [ ] Vérifier/resserrer CSP et security headers
- [ ] Vérifier politique cookie sur API access
- [ ] Vérifier garde-fous Sentry/env en production
- [ ] Aligner page `/security` avec l’implémentation réelle

## 4) Validation opérationnelle
- [ ] Lancer lint/tests/build
- [ ] Corriger si erreurs
- [ ] Mettre à jour CHANGELOG avec les changements majeurs
