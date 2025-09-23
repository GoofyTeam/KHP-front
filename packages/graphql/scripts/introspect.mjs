import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getIntrospectionQuery,
  buildClientSchema,
  printSchema,
} from "graphql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const endpoint =
  process.env.GRAPHQL_ENDPOINT ??
  process.argv[2] ??
  "https://back.goofykhp.fr/graphql";

async function fetchSchema() {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schema: ${response.status} ${response.statusText}`
    );
  }

  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(payload.errors)}`);
  }

  if (!payload.data) {
    throw new Error("No data returned from introspection query");
  }

  return printSchema(buildClientSchema(payload.data));
}

async function writeSchema(schemaSDL) {
  const schemaDir = path.resolve(__dirname, "../src/schema");
  await fs.mkdir(schemaDir, { recursive: true });

  const schemaPath = path.join(schemaDir, "schema.graphql");
  const tempPath = `${schemaPath}.tmp`;

  await fs.writeFile(tempPath, schemaSDL, "utf8");
  await fs.rename(tempPath, schemaPath);

  console.log(`GraphQL schema written to ${schemaPath}`);
}

try {
  const schemaSDL = await fetchSchema();
  await writeSchema(schemaSDL);
} catch (error) {
  console.error("Failed to introspect GraphQL schema:\n", error);
  process.exitCode = 1;
}
