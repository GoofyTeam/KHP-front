import type { Metadata } from "next";

import { AutoBreadcrumb } from "@/components/auto-breadcrumb";
import { ExpiryTable } from "@/components/expiry/expiry-table";
import type { ExpiryStatus, ExpiryTableItem } from "@/components/expiry/types";
import {
  GetPerishableDocument,
  type GetPerishableQuery,
} from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";

export const metadata: Metadata = {
  title: "KHP | Expiry",
  description: "Review ingredients that are approaching or past their expiration date.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Maybe<T> = T | null | undefined;

type PerishableNode = NonNullable<
  NonNullable<GetPerishableQuery["expired"]>[number]
>;

function toExpiryTableItems(
  items: Maybe<GetPerishableQuery["expired"]>,
  status: ExpiryStatus
): ExpiryTableItem[] {
  if (!items?.length) {
    return [];
  }

  return items
    .filter((item): item is PerishableNode => Boolean(item))
    .filter((item) => {
      const quantity = Number(item.quantity ?? 0);
      return (
        item.is_read === false &&
        typeof item.expiration_at === "string" &&
        item.expiration_at.length > 0 &&
        Number.isFinite(quantity) &&
        quantity > 0
      );
    })
    .map<ExpiryTableItem>((item) => ({
      id: String(item.id),
      name: item.ingredient?.name ?? "Unknown ingredient",
      quantity: Number(item.quantity ?? 0),
      location: item.location?.name ?? "Unknown location",
      expirationDate: item.expiration_at,
      status,
    }));
}

function sortExpiryItems(items: ExpiryTableItem[]): ExpiryTableItem[] {
  return [...items].sort((a, b) => {
    const aExpired = a.status === "expired";
    const bExpired = b.status === "expired";

    if (aExpired && !bExpired) return -1;
    if (!aExpired && bExpired) return 1;

    const aTime = new Date(a.expirationDate).getTime();
    const bTime = new Date(b.expirationDate).getTime();

    const aHasTime = Number.isFinite(aTime);
    const bHasTime = Number.isFinite(bTime);

    if (!aHasTime && !bHasTime) return 0;
    if (!aHasTime) return 1;
    if (!bHasTime) return -1;

    return aExpired ? bTime - aTime : aTime - bTime;
  });
}

function buildExpiryItems(data: Maybe<GetPerishableQuery>): ExpiryTableItem[] {
  if (!data) {
    return [];
  }

  const entries: ExpiryTableItem[] = [
    ...toExpiryTableItems(data.expired, "expired"),
    ...toExpiryTableItems(data.soon, "soon"),
  ];

  return sortExpiryItems(entries);
}

export default async function ExpiryPage() {
  const { data, error } = await query({ query: GetPerishableDocument });

  if (error) {
    throw new Error(`Failed to fetch expiry data: ${error.message}`);
  }

  const items = buildExpiryItems(data);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-khp-secondary bg-background">
        <div className="space-y-3 px-6 py-4">
          <AutoBreadcrumb listClassName="text-xl font-semibold" />
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">
        <ExpiryTable items={items} />
      </div>
    </div>
  );
}