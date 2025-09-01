"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Info, XCircle, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";

// --- Types ------------------------------------------------------------------
export type ListPanelType = "activity" | "critical" | "low-stock";

export type ListItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  time?: string;
  status?: "info" | "warning" | "error" | "success";
  icon?: React.ReactNode;
  onClick?: () => void;
};

export type ListPanelProps = {
  type: ListPanelType;
  items?: ListItem[];
  title?: string;
  className?: string;
  compact?: boolean;
  fill?: boolean;

  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  addHref?: string;
};

// --- Utilities ---------------------------------------------------------------

function StatusIcon({ status }: { status?: ListItem["status"] }) {
  switch (status) {
    case "error":
      return <XCircle className="mt-0.5 h-4 w-4 text-khp-error" aria-hidden />;
    case "warning":
      return (
        <AlertTriangle
          className="mt-0.5 h-4 w-4 text-khp-warning"
          aria-hidden
        />
      );
    case "info":
    case "success":
      return <Info className="mt-0.5 h-4 w-4 text-khp-info" aria-hidden />;
    default:
      return null;
  }
}

function HeaderButton({ label, href }: { label?: string; href?: string }) {
  if (!label || !href) return null;
  return (
    <Link
      href={href}
      className="text-right py-1 text-xs font-medium text-khp-primary/90 underline"
    >
      {label}
    </Link>
  );
}

// --- Variants ---------------------------------------------------------------
const defaultTitles: Record<ListPanelType, string> = {
  activity: "Recent Activity",
  critical: "Critical Shelf Alerts",
  "low-stock": "Low Stock",
};

// --- Fake data --------------------------------------------------------------
function useFakeData(type: ListPanelType): ListItem[] {
  return useMemo(() => {
    switch (type) {
      case "activity":
        return [
          {
            id: 1,
            title: "Tomato stock is below 2 kg",
            status: "warning",
            time: "19:24",
          },
          {
            id: 2,
            title: "Out of stock: Mozzarella (0 kg)",
            status: "error",
            time: "19:16",
          },
          {
            id: 3,
            title: "Stock synced with latest Metro invoice",
            status: "info",
            time: "19:03",
          },
          {
            id: 4,
            title: "New dish created: Vegetarian Burger",
            status: "info",
            time: "18:55",
          },
          {
            id: 5,
            title: "New order recorded for table 12",
            status: "info",
            time: "18:47",
          },
          {
            id: 6,
            title: "Failed to sync with server — data not saved",
            status: "error",
            time: "18:22",
          },
        ];
      case "critical":
        return [
          {
            id: 1,
            title: "Milk — expired 2 days ago",
            status: "error",
          },
          {
            id: 2,
            title: "Chicken Thighs — expired yesterday",
            status: "error",
          },
          {
            id: 3,
            title: "Fresh Cream — expired today",
            status: "error",
          },
          {
            id: 4,
            title: "Mozzarella — expired 1 day ago",
            status: "warning",
          },
          {
            id: 5,
            title: "Spinach — expires in 1 day",
            status: "warning",
          },
          {
            id: 6,
            title: "Yogurt — expires in 2 days",
            status: "warning",
          },
          {
            id: 7,
            title: "Strawberries — expires in 1 day",
            status: "warning",
          },
          {
            id: 8,
            title: "Brie Cheese — expires in 2 days",
            status: "warning",
          },
          {
            id: 9,
            title: "Zucchini — expires in 3 days",
            status: "warning",
          },
          {
            id: 10,
            title: "Saucisson — expires in 2 days",
            status: "warning",
          },
          {
            id: 11,
            title: "Salad — expires in 2 days",
            status: "warning",
          },
        ];
      case "low-stock":
        return [
          {
            id: 1,
            title: "Mozzarella — low stock: 2 units",
            status: "warning",
          },
          {
            id: 2,
            title: "Shrimp — low stock: 5 units",
            status: "warning",
          },
        ];
    }
  }, [type]);
}

// --- Main component ----------------------------------------------------------
export function ListPanel({
  type,
  title,
  compact,
  className,
  primaryActionLabel,
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  addHref,
}: ListPanelProps) {
  const data = useFakeData(type);
  const spacing = compact ? "py-2" : "py-2.5";
  const titleSize = compact ? "text-base" : "text-lg";
  const isCritical = type === "critical";

  const defPrimary =
    primaryActionLabel ?? (isCritical ? "More details" : undefined);
  const defSecondary =
    secondaryActionLabel ?? (type === "activity" ? "More details" : undefined);

  return (
    <section
      className={cn(
        "rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0",
        className
      )}
      aria-label={title ?? defaultTitles[type]}
    >
      <header className="mb-3 flex items-center justify-between gap-3 px-3 md:px-4 lg:px-5 shrink-0">
        <h2 className={cn("font-semibold text-slate-900", titleSize)}>
          {title ?? defaultTitles[type]}
        </h2>

        <div className="flex items-center gap-2">
          <HeaderButton label={defSecondary} href={secondaryActionHref} />
          <HeaderButton label={defPrimary} href={primaryActionHref} />
          {type === "low-stock" && addHref && (
            <Link
              href={addHref}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-khp-primary/90 text-khp-primary/90"
              aria-label="Add item"
            >
              <Plus className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </header>

      <div className={cn("min-h-0 overflow-y-auto")}>
        {data.length === 0 ? (
          <EmptyState label="No items" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full text-left flex items-start gap-3",
                    spacing,
                    "px-3 md:px-4 lg:px-5",
                    isCritical ? "bg-red-50" : ""
                  )}
                  onClick={it.onClick}
                >
                  {it.icon ?? <StatusIcon status={it.status} />}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-900">
                      {it.title}
                    </p>
                    {it.subtitle && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {it.subtitle}
                      </p>
                    )}
                  </div>

                  {it.time && (
                    <span className="shrink-0 text-xs text-slate-500">
                      {it.time}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
      {label}
    </div>
  );
}
