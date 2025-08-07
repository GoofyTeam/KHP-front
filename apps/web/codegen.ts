import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/graphql/schema/schema.graphql",
  documents: "./src/graphql/queries/**/*.{ts,tsx,graphql,gql}",
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    "./src/graphql/generated/": {
      preset: "client",
      config: {
        documentMode: "documentNode",
      },
    },
  },
};

export default config;
