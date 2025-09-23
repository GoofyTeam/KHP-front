import type { RequestDocument, Variables } from "graphql-request";
import {
  type OfflineCacheRecord,
  deleteDataCache,
  getDataCache,
  saveDataCache,
} from "./offline-db";
import { hashString } from "../utils/hash";

const DEFAULT_TTL = 1000 * 60 * 60 * 24; // 24 hours

function serializeDocument(document: RequestDocument): string {
  if (typeof document === "string") {
    return document;
  }

  try {
    return JSON.stringify(document);
  } catch (error) {
    console.warn("Failed to stringify GraphQL document for caching", error);
    return String(document);
  }
}

function buildGraphQLCacheKey(
  document: RequestDocument,
  variables?: Variables
): string {
  const payload = {
    document: serializeDocument(document),
    variables: variables ?? null,
  };

  const rawKey = JSON.stringify(payload);
  return `gql:${hashString(rawKey)}`;
}

export async function cacheGraphQLResponse<T>(
  document: RequestDocument,
  variables: Variables | undefined,
  value: T,
  ttl = DEFAULT_TTL
): Promise<OfflineCacheRecord<T>> {
  const cacheKey = buildGraphQLCacheKey(document, variables);
  return saveDataCache(cacheKey, value, ttl);
}

export async function getCachedGraphQLResponse<T>(
  document: RequestDocument,
  variables?: Variables
): Promise<OfflineCacheRecord<T> | null> {
  const cacheKey = buildGraphQLCacheKey(document, variables);
  return getDataCache<T>(cacheKey);
}

export async function invalidateGraphQLCache(
  document: RequestDocument,
  variables?: Variables
): Promise<void> {
  const cacheKey = buildGraphQLCacheKey(document, variables);
  await deleteDataCache(cacheKey);
}

