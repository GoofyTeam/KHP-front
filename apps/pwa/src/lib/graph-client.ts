import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.MODE === "production"
    ? "https://app.goofykhp.fr"
    : null;

async function csrfFetch(
  input: string | URL | Request,
  init: RequestInit = {}
): Promise<Response> {
  // Ne traiter que les requêtes POST
  if (init.method === "POST") {
    let token = api.readCookie("XSRF-TOKEN");

    if (!token) {
      //console.info("CSRF token not found in cookies, initializing CSRF...");
      await api.initCSRF();
      token = api.readCookie("XSRF-TOKEN");
      if (!token) {
        throw new Error("CSRF token not found in cookies after initCSRF()");
      }
    }

    init.headers = {
      ...(init.headers || {}),
      "X-XSRF-TOKEN": token,
      "Content-Type": "application/json",
    };
  }

  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

export const gqlClient = new GraphQLClient(`${API_URL}/graphql`, {
  fetch: csrfFetch,
});

export async function graphqlRequest<
  TData = unknown,
  TVars extends Variables = Variables,
>(
  document: RequestDocument,
  variables?: TVars,
  requestHeaders?: HeadersInit
): Promise<TData> {
  // @ts-expect-error - L'argument de type '[TVars | undefined, HeadersInit | undefined]' n'est pas attribuable au paramètre de type 'VariablesAndRequestHeadersArgs<TVars>'.
  return gqlClient.request<TData, TVars>(document, variables, requestHeaders);
}
