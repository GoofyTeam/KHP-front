import { HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NODE_ENV === "production"
    ? "https://dash.goofykhp.fr"
    : null;

export const { getClient, query, PreloadQuery } = registerApolloClient(
  async () => {
    const nextHeaders = await headers();
    const cookieHeader = nextHeaders.get("cookie") || "";

    const xsrfLink = setContext(async (_, { headers: hdrs }) => {
      try {
        // Read XSRF token from cookies on the server
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const xsrf = cookieStore.get("XSRF-TOKEN")?.value;

        let token = xsrf || "";
        try {
          if (token) token = decodeURIComponent(token);
        } catch {
          // keep raw token
        }

        return {
          headers: {
            ...hdrs,
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { "X-XSRF-TOKEN": token } : {}),
          },
        };
      } catch {
        return {
          headers: {
            ...hdrs,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        };
      }
    });

    const httpLink = new HttpLink({
      uri: `${API_URL}/graphql`,
      credentials: "include",
      fetch: (uri, options) =>
        fetch(uri, {
          ...options,
          headers: {
            ...options?.headers,
            cookie: cookieHeader,
          },
        }),
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link: xsrfLink.concat(httpLink),
    });
  }
);
