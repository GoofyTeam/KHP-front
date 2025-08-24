import { createFileRoute } from "@tanstack/react-router";
import ProductHistoryPage from "../../pages/ProductHistory";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetIngredient,
  GetIngredientQuery,
} from "../../graphql/getProduct.gql";

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

    // Get product info with stockMovements
    const productData = await graphqlRequest<GetIngredientQuery>(
      GetIngredient,
      {
        id,
      }
    );

    console.log("🔍 Product with stockMovements:", productData);

    if (!productData.ingredient) {
      throw new Error("Product not found");
    }

    const allStockMovements = productData.ingredient.stockMovements || [];

    // Apply frontend filtering for now
    const getFilteredMovements = (
      movements: any[],
      filterType: string,
      monthKey?: string
    ) => {
      if (filterType === "all") return movements;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return movements.filter((movement) => {
        if (!movement.created_at) return false;
        const movementDate = new Date(movement.created_at);

        switch (filterType) {
          case "today":
            return (
              movementDate >= today &&
              movementDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            );
          case "week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return movementDate >= weekStart && movementDate <= now;
          case "month":
            if (monthKey && monthKey !== "all") {
              const [year, month] = monthKey.split("-").map(Number);
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
          default:
            return true;
        }
      });
    };

    const filteredMovements = getFilteredMovements(
      allStockMovements,
      filter,
      selectedMonth
    );

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
