"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GetMostUsedIngredientsDocument } from "@/graphql/generated/graphql";

export type UsedItem = {
  id: string | number;
  name: string;
  usedCount: number;
  imageUrl?: string;
  href?: string;
};

export type UsedItemsProps = {
  className?: string;
  title?: string;
  items?: UsedItem[];
  images?: "enabled" | "disabled";
  maxItems?: number;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function UsedItems({
  className,
  title = "Most Used Items",
  items,
  images = "enabled",
  maxItems = 5,
}: UsedItemsProps) {
  const { data, loading, error } = useQuery(GetMostUsedIngredientsDocument, {
    skip: !!items,
    fetchPolicy: "cache-first",
  });

  const apiItems: UsedItem[] = useMemo(() => {
    const rows = data?.ingredients?.data ?? [];
    return rows.slice(0, maxItems).map((row, idx) => ({
      id: row?.name ?? idx,
      name: row?.name ?? "—",
      usedCount: row?.withdrawals_this_week_count ?? 0,
    }));
  }, [data, maxItems]);

  const dataToShow: UsedItem[] = items ?? apiItems;

  const showImages = images !== "disabled";

  return (
    <section
      className={cx(
        "rounded-md border border-khp-primary/30 shadow-sm",
        "p-3 md:p-4 flex flex-col min-h-0",
        className
      )}
      aria-label={title}
    >
      <h2 className="text-base font-semibold text-slate-800 md:text-lg">
        {title}
      </h2>

      {loading && !items && (
        <ul className="mt-3 space-y-3">
          {Array.from({ length: maxItems }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              {showImages && (
                <div className="h-9 w-9 rounded-md border border-emerald-400/60" />
              )}
              <div className="flex-1">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="mt-1 h-3 w-24 rounded bg-slate-100" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && !items && (
        <p className="mt-3 text-sm text-red-600">Failed to load items.</p>
      )}

      <div className="mt-3 flex-1 min-h-0 overflow-y-auto">
        <ul className="space-y-3">
          {dataToShow.map((item) => (
            <li key={item.id}>
              <UsedItemRow item={item} showImage={showImages} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function UsedItemRow({
  item,
  showImage,
}: {
  item: UsedItem;
  showImage: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3">
      {showImage &&
        (item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-9 w-9 rounded-md object-cover ring-1 ring-emerald-300/40"
          />
        ) : (
          <div
            className="h-9 w-9 rounded-md border border-emerald-400/60 bg-transparent"
            aria-hidden
          />
        ))}

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-900">
          {item.name}
        </p>
        <p className="text-xs text-slate-500">
          {item.usedCount} used this week
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
