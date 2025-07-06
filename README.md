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

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `npm run build`       | Build all apps and packages        |
| `npm run dev`         | Start all apps in development mode |
| `npm run lint`        | Lint all packages                  |
| `npm run format`      | Format files with Prettier         |
| `npm run check-types` | Run TypeScript type checks         |
| `npm run build:web`   | Build only the Next.js web app     |
| `npm run build:pwa`   | Build only the PWA                 |

In addition to npm scripts, a `Makefile` provides shortcuts to build and run the
Docker images for both apps:

```bash
# build and start both containers
make build-and-start
# build or start a single app
make build-web
make start-web
```

Run `make help` to see all available targets.

## Tests

There are currently no automated tests, but they are planned for the future.

## Continuous integration

GitHub Actions handle several automated tasks:

- **runs-linter** runs `npm run lint` on every pull request.
- **deploy_webapp** builds the web Docker image and pushes it to GHCR when `main` is updated.
- **deploy_pwa** does the same for the PWA.

## Contributing

Git hooks are managed with [Lefthook](https://github.com/evilmartians/lefthook).
Run the following after cloning to install them:

```bash
npx lefthook install
```

Commits must follow the format `[KHP-123] feat(scope): message`. The `verify-commit-msg.sh` script checks this automatically.

## Further documentation

- [apps/web/README.md](./apps/web/README.md)
- [apps/pwa/README.md](./apps/pwa/README.md)
- [packages/eslint-config/README.md](./packages/eslint-config/README.md)
- [packages/typescript-config/README.md](./packages/typescript-config/README.md)

## Aperçu rapide

Ce dépôt Turborepo contient deux applications (Next.js et une PWA Vite) ainsi que des paquets partagés pour l\'interface utilisateur et les configurations ESLint et TypeScript. Utilisez `npm install` puis `npm run dev` pour commencer.
