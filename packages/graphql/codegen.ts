import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./src/schema/schema.graphql",
  documents: "./src/**/*.{gql,graphql}",
  ignoreNoDocuments: false,
  maxConcurrency: 1,
  generates: {
    "./src/generated/": {
      preset: "client",
      config: {
        documentMode: "documentNode",
        fragmentMasking: false
      }
    }
  }
};

export default config;
