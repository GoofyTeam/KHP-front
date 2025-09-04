# `@workspace/graphql`

Container for shared GraphQL queries/artifacts.

## Structure

- `queries/generated/schema.graphql` — reference GraphQL schema (from introspection)

Both apps (`apps/web`, `apps/pwa`) run their own introspection/generation during dev/build. This package can act as a central place to share fragments, queries or a canonical schema between apps if desired.

## Updating the schema

From an app:

- `apps/web`: `npm run introspect` writes `src/graphql/schema/schema.graphql`
- `apps/pwa`: `npm run introspect` writes `src/graphql/generated/schema.graphql`

You can sync the schema into this package if you want a single shared location (optional depending on your workflow).
