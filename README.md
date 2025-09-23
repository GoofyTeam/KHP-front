# KHP Front — Kitchen Inventory Management System

Kitchen Hospitality Platform (KHP) is a [Turborepo](https://turbo.build) monorepo that powers a kitchen-focused inventory management system for restaurants and commercial kitchens. It combines a desktop/tablet dashboard with a mobile-first scanner experience to keep stock levels accurate from receiving to service.

## Repository Structure

- `apps/web` — [Next.js](https://nextjs.org/) kitchen dashboard for managers and expediter stations
- `apps/pwa` — [Vite + React](https://vitejs.dev/) mobile barcode scanning Progressive Web App for stock operations
- `packages/ui` — shared React UI components tailored to kitchen workflows and surfaces
- `packages/eslint-config` — shared ESLint configuration
- `packages/typescript-config` — shared TypeScript configurations
- `packages/graphql` — shared GraphQL artifacts (optional)

All projects use TypeScript and common tooling.

## Architecture

```mermaid
flowchart LR
  subgraph "KHP Applications"
    Web[Kitchen Dashboard<br/>apps/web]
    PWA[Mobile Barcode Scanner<br/>apps/pwa]
  end

  subgraph Shared Packages
    UI[&#64;workspace/ui<br/>Kitchen UI Library]
    ESLint[&#64;workspace/eslint-config]
    TS[&#64;workspace/typescript-config]
    GQL[packages/graphql<br/>Shared artifacts]
  end

  Backend[(KHP GraphQL API<br/>https://back.goofykhp.fr/graphql)]
  InventoryDB[(Inventory Services<br/>Real-time stock tracking)]

  Web --> UI
  Web --> ESLint
  Web --> TS
  PWA --> UI
  PWA --> ESLint
  PWA --> TS
  UI --> ESLint
  UI --> TS
  Web --> Backend
  PWA --> Backend
  Backend --> InventoryDB
  Web --> InventoryDB
```

### Development Flow

```mermaid
sequenceDiagram
  participant Staff as Kitchen Staff
  participant Mobile as PWA Scanner
  participant API as GraphQL API
  participant Inventory as Inventory Services
  participant Dashboard as Web Dashboard

  Staff->>Mobile: Scan item barcode
  Mobile->>API: Submit inventory mutation (introspected schema)
  API->>Inventory: Update stock quantities
  Inventory-->>Dashboard: Push real-time inventory counts
  Dashboard->>Staff: Display alerts and replenishment insights
```

## Requirements

- Node.js >= 18 (repo uses `npm@11`)
- Network access to fetch the GraphQL schema on first run
- Camera access with barcode scanning capability on mobile devices for the PWA
- Docker (optional) to build runtime images

## Setup

```bash
npm install
```

On first run, both apps will generate TypeScript types from the KHP GraphQL schema. Ensure you have network access for schema introspection and a valid API token when working against protected environments.

## Environment Variables

- `apps/web` — create `.env` (see `.env.example`):
  - `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:8000` or production `https://back.goofykhp.fr/graphql`)
- `apps/pwa` — `.env` expected:
  - `VITE_API_URL` (e.g. `http://localhost:8000` or production `https://back.goofykhp.fr/graphql`)
  - `VITE_PROJECT_NAME` (e.g. `KHP-front`)
  - `VITE_ENABLE_CAMERA` (set to `true` to prompt for camera/barcode access)

## Development

Start everything with Turborepo:

```bash
npm run dev
```

Run a specific app:

```bash
npm run dev:web   # Next.js
npm run dev:pwa   # Vite (host exposed)
```

By default, Web runs at `http://localhost:3000` and PWA at `http://localhost:5173`.
Both apps perform schema introspection against `https://back.goofykhp.fr/graphql` before starting to ensure mutations and queries stay in sync with the backend contract. The dashboard focuses on monitoring and reporting, while the mobile scanner optimizes receiving, counts, and station-level adjustments.

## Build & Quality

- `npm run build` — build all apps and packages
- `npm run build:web` / `npm run build:pwa` — targeted builds
- `npm run lint` — lint the entire workspace
- `npm run check-types` — TypeScript checks
- `npm run format` — Prettier (`*.ts, *.tsx, *.md`)

## Docker (optional)

Dockerfiles are provided for both apps. The `Makefile` includes shortcuts and can be wired into CI/CD to build and publish deployable images for each surface:

```bash
# Build and start both apps
make build-and-start

# Web only
make build-web
make start-web   # maps host 5432 -> container 3000

# PWA only
make build-pwa
make start-pwa   # maps host 5433 -> container 80
```

### Runtime Topology

```mermaid
flowchart TB
  subgraph Host
    H1[5432 -> Web Container:3000]
    H2[5433 -> PWA Container:80]
  end
```

## Conventions

- Git hooks managed by [Lefthook](https://github.com/evilmartians/lefthook):

```bash
npx lefthook install
```

- Commit format: `[KHP-123] feat(scope): message` enforced by `verify-commit-msg.sh`.
- Prefer colocating kitchen-specific business logic within feature folders (`inventory`, `recipes`, etc.) and sharing reusable primitives via `packages/ui` or `packages/graphql`.
- Keep schema changes versioned by re-running code generation (`npm run dev` or `turbo run introspect`) before submitting merge requests.

## Per-Project Docs

- `apps/web` — see `apps/web/README.md`
- `apps/pwa` — see `apps/pwa/README.md`
- `packages/ui` — see `packages/ui/README.md`
- `packages/eslint-config` — see `packages/eslint-config/README.md`
- `packages/typescript-config` — see `packages/typescript-config/README.md`
- `packages/graphql` — see `packages/graphql/README.md`
