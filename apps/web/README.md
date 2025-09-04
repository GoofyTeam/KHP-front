# Web Application (Next.js)

Next.js web app for the KHP project. See the [root README](../../README.md) for workspace-wide commands.

## Prerequisites

- Node.js >= 18
- `.env` with at least:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

See `.env.example` for a minimal sample.

## Development

From the repo root:

```bash
npm run dev:web
```

Or directly in this folder:

```bash
cd apps/web
npm run dev
```

Runs at http://localhost:3000.

### GraphQL Introspection & Codegen

This app generates GraphQL artifacts before `dev` and `build`:

- `npm run introspect` fetches the schema from `https://back.goofykhp.fr/graphql` and writes `src/graphql/schema/schema.graphql`.
- `npm run codegen` (run automatically) executes `graphql-codegen` using `codegen.ts`.

Ensure you have network access on first run.

## Build & Run

Production build:

```bash
npm run build
```

Start in production mode:

```bash
npm run start
```

From the root you can filter builds:

```bash
npm run build --filter=web
```

## Available Scripts

- `dev` — Next.js dev mode (+ codegen)
- `build` — production build (+ codegen)
- `start` — Next.js production server
- `preview` — build then start
- `lint` — run ESLint
- `introspect` — download remote GraphQL schema
- `codegen` — generate GraphQL types/operations

## Docker & Deployment

A `Dockerfile` is provided. Use the root `Makefile`:

```bash
make build-web
make start-web   # maps host 5432 -> container 3000
```

The CI workflow (`deploy_webapp`) can build and publish the image (GHCR) on pushes to `main`.
