import type { RequestDocument, Variables } from "graphql-request";
import { graphqlRequest } from "./graph-client";
import {
  cacheGraphQLResponse,
  getCachedGraphQLResponse,
} from "./offline-cache";

export interface OfflineAwareResult<T> {
  data: T;
  source: "network" | "cache";
  timestamp: number;
  error?: unknown;
}

export async function graphqlRequestWithOffline<
  TData,
  TVars extends Variables = Variables,
>(
  document: RequestDocument,
  variables?: TVars,
  requestHeaders?: HeadersInit
): Promise<OfflineAwareResult<TData>> {
  try {
    const data = await graphqlRequest<TData, TVars>(
      document,
      variables,
      requestHeaders
    );

    let timestamp = Date.now();
    try {
      const record = await cacheGraphQLResponse<TData>(
        document,
        variables,
        data
      );
      timestamp = record.timestamp;
    } catch (cacheError) {
      console.warn("Failed to cache GraphQL response", cacheError);
    }

    return {
      data,
      source: "network",
      timestamp,
    };
  } catch (error) {
    const cached = await getCachedGraphQLResponse<TData>(document, variables);
    if (cached) {
      console.warn("Serving GraphQL data from offline cache", error);
      return {
        data: cached.value,
        source: "cache",
        timestamp: cached.timestamp,
        error,
      };
    }

    throw error;
  }
}

