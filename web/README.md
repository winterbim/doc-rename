# BIMCHECK-Rename — application web

Application principale du monorepo. Voir le [README racine](../README.md)
et [docs/product/VISION.md](../docs/product/VISION.md).

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind 4
- Convex (auth / conventions cloud optionnelles)
- Vitest + Playwright

## Démarrage

```bash
npm ci
npm run dev
```

## Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md).

### Où est quoi

| Besoin | Emplacement |
|---|---|
| Logique de renommage pure | `lib/rename-engine/` |
| Profils métiers | `lib/profiles/` |
| UI renamer | `components/`, `app/app/` |
| Landing / pricing / legal | `app/page.tsx`, `app/pricing`, etc. |

## Scripts utiles

```bash
npm run lint
npm test
npm run test:e2e
npm run build
npm run verify
```
