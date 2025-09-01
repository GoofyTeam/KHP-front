import React from "react";
import Link from "next/link";
import { query } from "@/lib/ApolloClient";
import { GetMostUsedIngredientsDocument } from "@/graphql/generated/graphql";
import { cn } from "@workspace/ui/lib/utils";

export type UsedItemsProps = {
  className?: string;
  title?: string;
  images?: "enabled" | "disabled";
  maxItems?: number;
};

export default async function UsedItems({
  className,
  title = "Most Used Items",
  images = "enabled",
  maxItems = 5,
}: UsedItemsProps) {
  const { data } = await query({ query: GetMostUsedIngredientsDocument });
  const rows = data?.ingredients?.data ?? [];
  const items = rows.slice(0, maxItems).map((row, idx) => ({
    id: row?.name ?? idx,
    name: row?.name ?? "—",
    usedCount: row?.withdrawals_this_week_count ?? 0,
  }));
  const showImages = images !== "disabled";

  return (
    <section
      className={cn(
        "rounded-md border border-khp-primary/30 shadow-sm",
        "p-3 md:p-4 flex flex-col min-h-0",
        className
      )}
      aria-label={title}
    >
      <h2 className="text-base font-semibold text-slate-800 md:text-lg">
        {title}
      </h2>

      <div className="mt-3 flex-1 min-h-0 overflow-y-auto">
        <ul className="space-y-3">
          {items.map((item) => (
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
  item: {
    id: string | number;
    name: string;
    usedCount: number;
    imageUrl?: string;
    href?: string;
  };
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

  return item.href ? (
    <Link href={item.href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}
