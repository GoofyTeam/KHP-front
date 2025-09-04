# Progressive Web App (Vite + React)

Vite-based PWA using `vite-plugin-pwa` for offline support and updates.

## Prerequisites

`.env` file (a sample exists already):

```env
VITE_PROJECT_NAME=KHP-front
VITE_API_URL=http://localhost:8000
```

## Development

From the repo root:

```bash
npm run dev:pwa   # uses the dev:host script
```

Or directly in this folder:

```bash
cd apps/pwa
npm run dev       # or npm run dev:host to expose on the network
```

Default port: http://localhost:5173.

### GraphQL Introspection

Before `dev`, the `introspect` command downloads the GraphQL schema from `https://back.goofykhp.fr/graphql` to `src/graphql/generated/schema.graphql`. Network is required on first launch.

## Build & Preview

```bash
npm run build
npm run preview   # serves the production build locally
```

You can also control builds/runs from the root via Turborepo (see root README).

## Docker & Deployment

A `Dockerfile` is provided. Use the root `Makefile`:

```bash
make build-pwa
make start-pwa   # maps host 5433 -> container 80
```

The CI workflow (`deploy_pwa`) can build and publish the image (GHCR) on pushes to `main`.

See the [root README](../../README.md) for shared commands and general setup.
