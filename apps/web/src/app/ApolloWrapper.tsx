"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import Cookie from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.NODE_ENV === "production"
    ? "https://dash.goofykhp.fr"
    : null;

// Function to refresh CSRF token
const refreshCSRFToken = async (): Promise<string | null> => {
  try {
    const res = await fetch(`${API_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to refresh CSRF token");
      return null;
    }

    return Cookie.get("XSRF-TOKEN") || null;
  } catch (error) {
    console.error("Error refreshing CSRF token:", error);
    return null;
  }
};

function makeClient() {
  const httpLink = new HttpLink({
    uri: `${API_URL}/graphql`,
    credentials: "include",
    fetch: async (uri, options) => {
      const csrfToken = Cookie.get("XSRF-TOKEN") || "";

      const headers = {
        ...options?.headers,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken,
      };

      const response = await fetch(uri, {
        ...options,
        headers,
      });

      // Handle CSRF token expiration with automatic retry
      if (response.status === 419) {
        console.warn(
          "Apollo GraphQL CSRF token expired, refreshing token and retrying..."
        );

        const newToken = await refreshCSRFToken();

        if (newToken) {
          // Update headers with new token and retry
          const updatedHeaders = {
            ...headers,
            "X-XSRF-TOKEN": newToken,
          };

          return fetch(uri, {
            ...options,
            headers: updatedHeaders,
          });
        }
      }

      return response;
    },
    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    //fetchOptions: {
    // you can pass additional options that should be passed to `fetch` here,
    // e.g. Next.js-related `fetch` options regarding caching and revalidation
    // see https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options
    //},
  });

  // use the `ApolloClient` from "@apollo/client-integration-nextjs"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/client-integration-nextjs"
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
