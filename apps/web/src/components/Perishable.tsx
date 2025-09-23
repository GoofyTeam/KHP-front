"use client";

import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { GetPerishableQuery } from "@/graphql/generated/graphql";

// --- Types
export type PerishableItem = {
  id: string | number;
  title: string;
  expirationInfo: string;
  locationQuantity: string;
  status?: "warning" | "error";
  expirationDate: string;
  onClick?: () => void;
};

export type PerishableData = {
  id: string;
  ingredient: {
    name: string;
  };
  location: {
    name: string;
  };
  quantity: number;
  is_read: boolean;
  expiration_at: string;
};

export type PerishableProps = {
  data?: PerishableItem[] | GetPerishableQuery | null;
  className?: string;
};

// --- Utilities

function getExpirationMessage(expirationDate: string): string {
  const now = new Date();
  const expiration = new Date(expirationDate);

  const diffInMs = expiration.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 1) {
    return `Expires in ${diffInDays} days`;
  } else if (diffInDays === 1) {
    return `Expires tomorrow`;
  } else if (diffInDays === 0) {
    return `Expires today`;
  } else if (diffInDays === -1) {
    return `Expired yesterday`;
  } else {
    return `Expired ${Math.abs(diffInDays)} days ago`;
  }
}

function StatusIcon({ status }: { status?: PerishableItem["status"] }) {
  switch (status) {
    case "error":
      return <XCircle className="mt-0.5 h-4 w-4 text-khp-error" aria-hidden />;
    case "warning":
    default:
      return (
        <AlertTriangle
          className="mt-0.5 h-4 w-4 text-khp-warning"
          aria-hidden
        />
      );
  }
}

function transformPerishableItem(
  item: PerishableData,
  type: "soon" | "expired",
): PerishableItem {
  const expirationMessage = getExpirationMessage(item.expiration_at);
  const locationQuantityText =
    item.quantity <= 0
      ? "Out of stock"
      : `${item.quantity}kg in ${item.location.name}`;

  return {
    id: item.id,
    title: item.ingredient.name,
    expirationInfo: expirationMessage,
    locationQuantity: locationQuantityText,
    status: type === "expired" ? "error" : "warning",
    expirationDate: item.expiration_at,
  };
}

function hasAvailableStock(item: PerishableData): boolean {
  return item.quantity > 0;
}

function transformData(queryData: GetPerishableQuery): PerishableItem[] {
  const unreadItems: PerishableItem[] = [];

  if (queryData.expired) {
    const unreadExpired = queryData.expired
      .filter(
        (item) =>
          !item.is_read && hasAvailableStock(item as unknown as PerishableData),
      )
      .map((item) =>
        transformPerishableItem(item as unknown as PerishableData, "expired"),
      );
    unreadItems.push(...unreadExpired);
  }

  if (queryData.soon) {
    const unreadSoon = queryData.soon
      .filter(
        (item) =>
          !item.is_read && hasAvailableStock(item as unknown as PerishableData),
      )
      .map((item) =>
        transformPerishableItem(item as unknown as PerishableData, "soon"),
      );
    unreadItems.push(...unreadSoon);
  }

  return sortPerishableItems(unreadItems);
}

function sortPerishableItems(items: PerishableItem[]): PerishableItem[] {
  return items.sort((a, b) => {
    const aIsExpired = a.status === "error";
    const bIsExpired = b.status === "error";

    if (aIsExpired && !bIsExpired) return -1;
    if (!aIsExpired && bIsExpired) return 1;

    const aExpiration = new Date(a.expirationDate);
    const bExpiration = new Date(b.expirationDate);

    if (aIsExpired && bIsExpired) {
      return bExpiration.getTime() - aExpiration.getTime();
    } else {
      return aExpiration.getTime() - bExpiration.getTime();
    }
  });
}

function isGraphQLData(data: unknown): data is GetPerishableQuery {
  return Boolean(
    data &&
      typeof data === "object" &&
      data !== null &&
      ("soon" in data || "expired" in data),
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
      No critical alerts
    </div>
  );
}

// --- Main component
export function Perishable({ data, className }: PerishableProps) {
  const transformedData: PerishableItem[] = React.useMemo(() => {
    if (!data) return [];

    if (isGraphQLData(data)) {
      return transformData(data);
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }, [data]);

  return (
    <section
      className={cn(
        "rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0",
        className,
      )}
      aria-label="Expiry"
    >
      <header className="mb-3 flex items-center justify-between gap-3 px-3 md:px-4 lg:px-5 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900">Expiry</h2>

        <div className="flex items-center gap-2">
          <Link
            href="/expiry"
            className="text-right py-1 text-xs font-medium text-khp-primary/90 underline hover:text-khp-primary-hover"
          >
            More details
          </Link>
        </div>
      </header>

      <div className="min-h-0 overflow-y-auto">
        {transformedData.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {transformedData.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full text-left flex items-start gap-3 py-2.5 px-3 md:px-4 lg:px-5",
                    item.status === "error"
                      ? "bg-khp-error/10"
                      : "bg-transparent",
                  )}
                  onClick={item.onClick}
                >
                  <StatusIcon status={item.status} />

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 break-words text-xs text-slate-500">
                      {item.expirationInfo}
                      <span className="mx-2">-</span>
                      {item.locationQuantity}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
