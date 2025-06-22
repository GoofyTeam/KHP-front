# KHP Frontend Monorepo

This repository is a [Turborepo](https://turbo.build) workspace that hosts two applications and several shared packages.

## Repository structure

- `apps/web` – a [Next.js](https://nextjs.org/) web application.
- `apps/pwa` – a [Vite](https://vitejs.dev/) powered Progressive Web App.
- `packages/ui` – shared React component library.
- `packages/eslint-config` – shared ESLint configuration.
- `packages/typescript-config` – shared TypeScript configuration.

All packages use TypeScript and share the same tooling.

## Quick start

```bash
npm install
npm run dev
```

This installs all dependencies and starts all apps in development mode with Turborepo.

To run an individual application:

```bash
cd apps/web && npm run dev    # Next.js web app
# or
cd apps/pwa && npm run dev    # Vite PWA
```

## Available scripts

The root `package.json` exposes several scripts:

| Script | Description |
| ------ | ----------- |
| `npm run build` | Build all apps and packages |
| `npm run dev` | Start all apps in development mode |
| `npm run lint` | Lint all packages |
| `npm run format` | Format files with Prettier |
| `npm run check-types` | Run TypeScript type checks |

## Tests

There are currently no automated tests, but they are planned for the future.

## Further documentation

- [apps/web/README.md](./apps/web/README.md)
- [apps/pwa/README.md](./apps/pwa/README.md)
- [packages/eslint-config/README.md](./packages/eslint-config/README.md)
- [packages/typescript-config/README.md](./packages/typescript-config/README.md)

## Aperçu rapide

Ce dépôt Turborepo contient deux applications (Next.js et une PWA Vite) ainsi que des paquets partagés pour l\'interface utilisateur et les configurations ESLint et TypeScript. Utilisez `npm install` puis `npm run dev` pour commencer.
