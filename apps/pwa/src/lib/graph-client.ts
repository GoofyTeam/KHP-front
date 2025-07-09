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
      throw new Error("CSRF token introuvable dans les cookies");
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
  {
    fetch: csrfFetch,
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function graphqlRequest<T = any, V extends object = Variables>(
  query: RequestDocument,
  variables?: V
): Promise<T> {
  try {
    return await gqlClient.request<T>({
      document: query,
      variables: variables,
    });
  } catch (err) {
    // Vous pouvez personnaliser le traitement des erreurs GraphQL ici
    console.error("Erreur GraphQL", err);
    throw err;
  }
}
