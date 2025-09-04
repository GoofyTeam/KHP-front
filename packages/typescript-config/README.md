# `@workspace/typescript-config`

Shared TypeScript configurations for the workspace.

## Usage

In an app/package `tsconfig.json`:

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "strict": true
  },
  "include": ["src"]
}
```

Available presets:

- `base.json` — base config for libraries/apps
- `react-library.json` — for React libraries
- `nextjs.json` — for Next.js projects

Apps can override options as needed.
