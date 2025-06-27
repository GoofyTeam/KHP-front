# Progressive Web App

This directory contains a Vite-powered React PWA. The app uses `vite-plugin-pwa` to enable offline capabilities and automatic updates.

## Development

From the repository root run:

```sh
npm run dev -w apps/pwa
```

or start it directly:

```sh
cd apps/pwa && npm run dev
```

## Build

```sh
npm run build -w apps/pwa
# or
cd apps/pwa && npm run build
```

## Preview

```sh
npm run preview -w apps/pwa
# or
cd apps/pwa && npm run preview
```

### Docker & deployment

The app ships with a Dockerfile. You can build the container manually or via the
repository `Makefile`:

```bash
# build image and run it
make build-pwa
make start-pwa
```

On every push to `main`, the `deploy_pwa.yml` workflow builds and pushes the
image to GitHub Container Registry.

See the [root README](../../README.md) for shared scripts and additional setup instructions.
