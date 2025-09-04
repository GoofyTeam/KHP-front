# `@workspace/ui`

Shared React component library (lightweight design system) used by the apps in this monorepo.

## Contents

- `src/components/*` — reusable UI components (buttons, forms, etc.)
- `src/hooks/*` — utility hooks
- `src/lib/*` — helpers/utilities
- `src/styles/globals.css` — exported global styles

Exports are exposed via short paths:

- `@workspace/ui/components/*`
- `@workspace/ui/hooks/*`
- `@workspace/ui/lib/*`
- `@workspace/ui/globals.css`

## Usage in an app

No extra install is needed within the workspace. Import directly:

```tsx
// A component
import { Button } from "@workspace/ui/components/button";

// A hook
import { useSomething } from "@workspace/ui/hooks/use-something";

// Global styles (in your app entry)
import "@workspace/ui/globals.css";
```

## Development

Run dev from the repo root to benefit from HMR in consuming apps:

```bash
npm run dev
```

Local lint:

```bash
npm run lint
```
