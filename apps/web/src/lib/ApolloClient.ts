import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-integration-nextjs";
import type { DocumentNode } from "graphql";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined.");
}

// Create Apollo Client for server-side rendering
const { getClient, query } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: `${API_URL}/graphql`,
      credentials: "include",
      // For server-side rendering, we need to handle cookies manually
      fetch: async (uri, options) => {
        const { headers } = await import("next/headers");
        const headersList = await headers();
        const cookieHeader = headersList.get("cookie") || "";

        return fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            Accept: "application/json",
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
        });
      },
    }),
  });
});

export { getClient, query };
