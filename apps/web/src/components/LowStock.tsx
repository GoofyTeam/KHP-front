"use client";

import React from "react";
import { AlertTriangle, XCircle, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { GetThresholdQuery } from "@workspace/graphql";

// --- Types
export type LowStockItem = {
  id: string;
  title: string;
  subtitle: string;
  threshold: string;
  status: "warning" | "error";
  icon: React.ReactNode;
  onClick?: () => void;
};

export type LowStockProps = {
  thresholdData: GetThresholdQuery | null | undefined;
  className?: string;
};

// --- Utilities

function calculateStockPercentage(
  currentQuantity: number,
  threshold: number
): number {
  if (threshold === 0) return 100;
  return (currentQuantity / threshold) * 100;
}

function getStockStatus(percentage: number): {
  status: "warning" | "error";
  icon: React.ReactNode;
} {
  if (percentage >= 50) {
    return {
      status: "warning",
      icon: (
        <AlertTriangle
          className="mt-0.5 h-4 w-4 text-khp-warning"
          aria-hidden
        />
      ),
    };
  } else {
    return {
      status: "error",
      icon: <XCircle className="mt-0.5 h-4 w-4 text-khp-error" aria-hidden />,
    };
  }
}

function transformThresholdDataToLowStockItems(
  data: GetThresholdQuery
): LowStockItem[] {
  const items: LowStockItem[] = [];

  if (data.ingredientTreshold) {
    for (const ingredient of data.ingredientTreshold) {
      const threshold = ingredient.threshold || 100;

      for (const quantity of ingredient.quantities || []) {
        const totalQuantity = quantity.quantity;
        const percentage = calculateStockPercentage(totalQuantity, threshold);
        const { status, icon } = getStockStatus(percentage);

        if (percentage < 100) {
          items.push({
            id: `ingredient-${ingredient.id}-${quantity.location?.name}`,
            title: `${ingredient.name} - ${quantity.location?.name}`,
            subtitle: `In stock: ${totalQuantity}${ingredient.unit}`,
            threshold: `Threshold: ${threshold}${ingredient.unit}`,
            status,
            icon,
          });
        }
      }
    }
  }

  if (data.PreparationsThreshold) {
    for (const preparation of data.PreparationsThreshold) {
      const threshold = preparation.threshold || 50;

      for (const quantity of preparation.quantities || []) {
        const totalQuantity = quantity.quantity;
        const percentage = calculateStockPercentage(totalQuantity, threshold);
        const { status, icon } = getStockStatus(percentage);

        if (percentage < 100) {
          items.push({
            id: `preparation-${preparation.id}-${quantity.location?.name}`,
            title: `${preparation.name} - ${quantity.location?.name}`,
            subtitle: `In stock: ${totalQuantity}${preparation.unit}`,
            threshold: `Threshold: ${threshold}${preparation.unit}`,
            status,
            icon,
          });
        }
      }
    }
  }

  return items.sort((a, b) => {
    // Sort by status first (error before warning)
    if (a.status !== b.status) {
      return a.status === "error" ? -1 : 1;
    }
    // Then alphabetically by title
    return a.title.localeCompare(b.title);
  });
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-sm text-khp-text-secondary">
      Aucun produit en stock faible
    </div>
  );
}

// --- Main component
export function LowStock({ thresholdData, className }: LowStockProps) {
  const data = transformThresholdDataToLowStockItems(
    thresholdData || {
      ingredientTreshold: [],
      PreparationsThreshold: [],
    }
  );

  return (
    <section
      className={cn(
        "rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0",
        className
      )}
      aria-label="Low Stock"
    >
      <header className="mb-3 flex items-center justify-between gap-3 px-3 md:px-4 lg:px-5 shrink-0">
        <h2 className="text-lg font-semibold text-khp-text-primary">
          Low Stock
        </h2>

        <div className="flex items-center gap-2">
          <Link
            href="/stocks/restock"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-khp-primary/90 text-khp-primary/90"
            aria-label="Add stock"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="min-h-0 overflow-y-auto">
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full text-left flex items-start gap-3 py-2.5 px-3 md:px-4 lg:px-5"
                  onClick={item.onClick}
                >
                  {item.icon}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-khp-text-primary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-khp-text-secondary">
                      {item.subtitle}
                      <span className="mx-2">-</span>
                      {item.threshold}
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
