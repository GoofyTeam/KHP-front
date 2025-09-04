# `@workspace/eslint-config`

Shared ESLint configuration for the workspace.

## Usage

Using ESLint flat config in `eslint.config.js` / `eslint.config.mjs`:

```js
// Example (adapt to your project)
import base from "@workspace/eslint-config/base";
// or for Next.js
// import nextjs from "@workspace/eslint-config/next-js";

export default [
  // nextjs,
  base,
  // your additional rules
];
```

Apps can extend `base` or `next-js` and add custom rules as needed.

## Scripts

Run lint from the repo root:

```bash
npm run lint
```

Or locally within a package/app:

```bash
eslint .
```
