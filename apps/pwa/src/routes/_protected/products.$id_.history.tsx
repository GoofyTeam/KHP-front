import { createFileRoute } from "@tanstack/react-router";
import ProductHistoryPage from "../../pages/ProductHistory";
import { graphqlRequest } from "../../lib/graph-client";
import { GetProductDocument, type GetProductQuery } from "@workspace/graphql";

import z from "zod";

const historySearchSchema = z.object({
  filter: z.enum(["all", "today", "week", "month"]).default("all"),
  selectedMonth: z.string().optional(),
});

export const Route = createFileRoute("/_protected/products/$id_/history")({
  validateSearch: historySearchSchema,
  loaderDeps: ({ search }) => ({
    filter: search.filter,
    selectedMonth: search.selectedMonth,
  }),
  loader: async ({ params, deps }) => {
    const { id } = params;
    const { filter, selectedMonth } = deps;

    const productData = await graphqlRequest<GetProductQuery>(GetProductDocument, {
      id,
    });

    if (!productData.ingredient) {
      throw new Error("Product not found");
    }

    const allStockMovements: Array<{
      id: string;
      type: string;
      quantity: number;
      created_at?: string;
      location?: { id: string; name: string };
    }> = productData.ingredient.stockMovements || [];

    const filteredMovements = (() => {
      if (filter === "all") return allStockMovements;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return allStockMovements.filter((movement) => {
        if (!movement.created_at) return false;
        const movementDate = new Date(movement.created_at);

        switch (filter) {
          case "today":
            return (
              movementDate >= today &&
              movementDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          case "week": {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return movementDate >= weekStart && movementDate <= now;
          }
          case "month": {
            if (selectedMonth && selectedMonth !== "all") {
              const [year, month] = selectedMonth.split("-").map(Number);
              return (
                movementDate.getFullYear() === year &&
                movementDate.getMonth() === month
              );
            }
            const currentMonthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1
            );
            return movementDate >= currentMonthStart && movementDate <= now;
          }
          default:
            return true;
        }
      });
    })();

    // Sort by created_at descending
    const sortedMovements = filteredMovements.sort(
      (a, b) =>
        new Date(b.created_at || "").getTime() -
        new Date(a.created_at || "").getTime()
    );

    console.log("📊 Filtered stockMovements:", {
      total: allStockMovements.length,
      filtered: sortedMovements.length,
      filter,
      selectedMonth,
    });

    return {
      product: productData.ingredient,
      stockMovements: sortedMovements,
      paginatorInfo: {
        hasMorePages: false,
        currentPage: 1,
        total: sortedMovements.length,
        count: sortedMovements.length,
      },
      currentFilter: filter,
      currentSelectedMonth: selectedMonth,
    };
  },
  component: ProductHistoryPage,
});
