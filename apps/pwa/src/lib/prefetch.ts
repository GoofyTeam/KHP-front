import {
  GetCategoriesDocument,
  GetCompanyProductsDocument,
  GetLocationsDocument,
  type GetCompanyProductsQueryVariables,
} from "@workspace/graphql";
import { graphqlRequestWithOffline } from "./offline-graphql";

const PREFETCH_KEY = "khp:last-prefetch";
const PREFETCH_TTL = 1000 * 60 * 15; // 15 minutes

export async function prefetchEssentialData(options?: {
  force?: boolean;
}): Promise<void> {
  if (typeof window === "undefined") return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  const force = options?.force ?? false;
  const lastPrefetch = window.localStorage.getItem(PREFETCH_KEY);

  if (!force && lastPrefetch) {
    const elapsed = Date.now() - Number(lastPrefetch);
    if (!Number.isNaN(elapsed) && elapsed < PREFETCH_TTL) {
      return;
    }
  }

  const tasks: Array<Promise<unknown>> = [
    graphqlRequestWithOffline(GetLocationsDocument),
    graphqlRequestWithOffline(GetCategoriesDocument),
    graphqlRequestWithOffline(
      GetCompanyProductsDocument,
      { page: 1 } satisfies GetCompanyProductsQueryVariables
    ),
  ];

  await Promise.allSettled(tasks);

  window.localStorage.setItem(PREFETCH_KEY, String(Date.now()));
}
