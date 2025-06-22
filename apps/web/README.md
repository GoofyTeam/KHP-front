# Web App

This directory contains the Next.js web application for the KHP project. It lives inside the Turborepo workspace defined at the repository root.

See [the root README](../../README.md) for general workspace commands.

## Development

From the repository root run:

```bash
npm run dev
```

This will run `turbo run dev` and start this application along with any other packages that define a `dev` script. To run only this app:

```bash
cd apps/web
npm run dev
```

Open <http://localhost:3000> in your browser once the server is running.

## Build

Create an optimized production build with:

```bash
npm run build
```

From the root you can build only this app using a filter:

```bash
npm run build --filter=web
```

## Available scripts

- `dev` – start Next.js in development mode
- `build` – produce a production build
- `start` – run the production server
- `preview` – build then start the production server
- `lint` – run ESLint on the project

