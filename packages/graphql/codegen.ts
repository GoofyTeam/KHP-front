import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema/schema.graphql",
  documents: "./src/**/*.{gql,graphql}",
  ignoreNoDocuments: false,
  //maxConcurrency: 1,
  generates: {
    "./src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typed-document-node",
      ],
      config: {
        documentMode: "documentNode",
        preResolveTypes: true,
        mergeInFieldsFromFragmentSpreads: true,
      },
    },
  },
};

export default config;
