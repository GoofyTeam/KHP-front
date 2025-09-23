import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import api from "./api";

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : import.meta.env.MODE === "production"
    ? "https://app.goofykhp.fr"
    : null;

async function csrfFetch(
  input: string | URL | Request,
  init: RequestInit = {},
): Promise<Response> {
  if (init.method === "POST") {
    let token = api.readCookie("XSRF-TOKEN");

    if (!token) {
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

  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (response.status === 419) {
    await api.initCSRF();
    const newToken = api.readCookie("XSRF-TOKEN");

    if (newToken && init.method === "POST") {
      init.headers = {
        ...(init.headers || {}),
        "X-XSRF-TOKEN": newToken,
        "Content-Type": "application/json",
      };

      return fetch(input, {
        ...init,
        credentials: "include",
      });
    }
  }

  return response;
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
  requestHeaders?: HeadersInit,
): Promise<TData> {
  // @ts-expect-error - L'argument de type '[TVars | undefined, HeadersInit | undefined]' n'est pas attribuable au paramètre de type 'VariablesAndRequestHeadersArgs<TVars>'.
  return gqlClient.request<TData, TVars>(document, variables, requestHeaders);
}
