"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

import { GetIngredientsDocument } from "@/graphql/generated/graphql";
import { IngredientsTable } from "@/components/stocks/ingredients-table/ingredients-table";
import { useIngredientsColumns } from "@/components/stocks/ingredients-table/ingredients-columns";
import StocksFilters from "@/components/stocks/stocks-filters";
import type { Ingredient } from "@/types/stocks";

interface Category {
  id: string;
  name: string;
}

interface StocksPageProps {
  initialCategories: Category[];
}

interface FilterState {
  search: string;
  categoryId?: string;
}

export default function StocksPage({ initialCategories }: StocksPageProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoryId: undefined,
  });
  const [isRegisterLostMode, setIsRegisterLostMode] = useState(false);
  const [page, setPage] = useState(1);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  // Requête pour les ingrédients
  const {
    data: ingredientsData,
    loading: ingredientsLoading,
    error: ingredientsError,
    fetchMore,
  } = useQuery(GetIngredientsDocument, {
    variables: {
      page: 1,
      search: filters.search || undefined,
      categoryId: filters.categoryId || undefined,
    },
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data?.ingredients?.data) {
        setAllIngredients(data.ingredients.data as Ingredient[]);
      }
    },
  });

  const columns = useIngredientsColumns(isRegisterLostMode);
  const ingredients = allIngredients;
  const hasMore =
    ingredientsData?.ingredients?.paginatorInfo?.hasMorePages || false;

  // Reset ingredients when filters change
  useEffect(() => {
    setPage(1);
    setAllIngredients([]);
  }, [filters.search, filters.categoryId]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || ingredientsLoading) return;

    const nextPage = page + 1;
    try {
      const result = await fetchMore({
        variables: {
          page: nextPage,
          search: filters.search || undefined,
          categoryId: filters.categoryId || undefined,
        },
      });

      if (result.data?.ingredients?.data) {
        setAllIngredients((prev) => [
          ...prev,
          ...(result.data.ingredients.data as Ingredient[]),
        ]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more ingredients:", error);
    }
  }, [
    hasMore,
    ingredientsLoading,
    page,
    fetchMore,
    filters.search,
    filters.categoryId,
  ]);

  const handleRegisterLost = useCallback(() => {
    setIsRegisterLostMode(true);
  }, []);

  const handleCancelRegisterLost = useCallback(() => {
    setIsRegisterLostMode(false);
  }, []);

  const handleAddToStock = useCallback(() => {
    console.log("Adding to stock...");
  }, []);

  if (ingredientsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Loading Error</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {ingredientsError.message}
              </p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StocksFilters
        initialCategories={initialCategories}
        onFiltersChange={handleFiltersChange}
        isRegisterLostMode={isRegisterLostMode}
        onRegisterLost={handleRegisterLost}
        onCancelRegisterLost={handleCancelRegisterLost}
        onAddToStock={handleAddToStock}
      />

      <IngredientsTable<Ingredient, unknown>
        columns={columns}
        data={ingredients}
        columnFilters={[]}
        onColumnFiltersChange={() => {}}
        searchLoading={ingredientsLoading && filters.search !== ""}
        initialLoading={ingredientsLoading && ingredients.length === 0}
        loadingMore={false}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isRegisterLostMode={isRegisterLostMode}
      />
    </div>
  );
}
