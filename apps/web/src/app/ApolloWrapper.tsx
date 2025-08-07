"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";
import Cookie from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined.");
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: `${API_URL}/graphql`,
    credentials: "include",
    fetch: (uri, options) => {

      const csrfToken = Cookie.get("XSRF-TOKEN") || "";

      const headers = {
        ...options?.headers,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": csrfToken,
      };

      return fetch(uri, {
        ...options,
        headers,
      });
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
    credentials: "include", // include cookies for CSRF protection
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
