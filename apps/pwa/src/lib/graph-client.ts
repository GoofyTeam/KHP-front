import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import api from "./api";

async function csrfFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  if (init?.method === "POST") {
    await api.initCSRF();
    const token = api.readCookie("XSRF-TOKEN");
    if (!token) {
      throw new Error("CSRF token not found in cookies");
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

export const gqlClient = new GraphQLClient(
  `${import.meta.env.VITE_API_URL}/graphql`,
  { fetch: csrfFetch }
);

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
