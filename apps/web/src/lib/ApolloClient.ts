import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL n’est pas défini.");
}

const nextHeaders = await headers();
const cookieHeader = nextHeaders.get("cookie") || "";

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // this needs to be an absolute url, as relative urls cannot be used in SSR
      uri: `${API_URL}/graphql`,
      credentials: "include", // include cookies for CSRF protection
      headers: {
        Accept: "application/json", // or any other value you want to specify
        "Content-Type": "application/json", // ensure the content type is set correctly
      },
      fetch: (uri, options) =>
        fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            cookie: cookieHeader,
          },
        }),
    }),
  });
});
