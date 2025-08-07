"use client";

import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useQuery } from "@apollo/client";
import { Search, MoreVertical, AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { MultiSelect } from "@workspace/ui/components/multi-select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

import { GetIngredientsDocument } from "@/graphql/generated/graphql";
import { IngredientsTable } from "@/components/ingredients-table/ingredients-table";
import { useIngredientsColumns } from "@/components/ingredients-table/ingredients-columns";
import type { Ingredient } from "@/types/stocks";

interface Category {
  id: string;
  name: string;
}

interface StocksContainerProps {
  initialCategories: Category[];
}

export default function StocksContainer({
  initialCategories,
}: StocksContainerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [isRegisterLostMode, setIsRegisterLostMode] = useState(false);
  const [page, setPage] = useState(1);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);

  const debouncedSearchTerm = useDebounce(searchInput.trim(), 400);
  const debouncedCategories = useDebounce(categoryFilters, 300);

  const categoryId =
    debouncedCategories.length > 0 ? debouncedCategories[0] : undefined;

  const {
    data: ingredientsData,
    loading: ingredientsLoading,
    error: ingredientsError,
    fetchMore,
  } = useQuery(GetIngredientsDocument, {
    variables: {
      page: 1,
      search: debouncedSearchTerm || undefined,
      categoryId: categoryId || undefined,
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

  const categoryOptions = useMemo(() => {
    return initialCategories.map((cat) => ({
      label: cat.name,
      value: cat.id.toString(),
    }));
  }, [initialCategories]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
    setAllIngredients([]);
  }, []);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setCategoryFilters(categories);
    setPage(1);
    setAllIngredients([]);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || ingredientsLoading) return;

    const nextPage = page + 1;
    try {
      const result = await fetchMore({
        variables: {
          page: nextPage,
          search: debouncedSearchTerm || undefined,
          categoryId: categoryId || undefined,
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
    debouncedSearchTerm,
    categoryId,
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
      <div className="flex items-center justify-between space-x-2">
        <div className="flex flex-col-reverse md:flex-row w-full items-center gap-2">
          <div className="flex w-full md:w-auto items-center space-x-2">
            <MultiSelect
              options={categoryOptions}
              onValueChange={handleCategoriesChange}
              defaultValue={categoryFilters}
              placeholder="Select categories"
              variant="default"
              className="w-full md:w-auto"
            />
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isRegisterLostMode ? (
                    <DropdownMenuItem
                      onClick={handleCancelRegisterLost}
                      className="text-destructive focus:text-destructive"
                    >
                      <Button
                        variant="outline"
                        onClick={handleCancelRegisterLost}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Cancel
                      </Button>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleRegisterLost}
                      className="text-destructive focus:text-destructive"
                    >
                      <Button
                        variant="khp-destructive"
                        onClick={handleRegisterLost}
                        className="w-full"
                      >
                        Register loss
                      </Button>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleAddToStock}>
                    <Button
                      variant="khp-default"
                      onClick={handleAddToStock}
                      className="w-full"
                    >
                      Add to stock
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              name="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 w-full h-[48px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            {isRegisterLostMode ? (
              <Button
                variant="outline"
                onClick={handleCancelRegisterLost}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel
              </Button>
            ) : (
              <>
                <Button variant="khp-destructive" onClick={handleRegisterLost}>
                  Register loss
                </Button>
                <Button variant="khp-default" onClick={handleAddToStock}>
                  Add to stock
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <IngredientsTable<Ingredient, unknown>
        columns={columns}
        data={ingredients}
        columnFilters={[]}
        onColumnFiltersChange={() => {}}
        searchLoading={ingredientsLoading && debouncedSearchTerm !== ""}
        initialLoading={ingredientsLoading && ingredients.length === 0}
        loadingMore={false}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isRegisterLostMode={isRegisterLostMode}
      />
    </div>
  );
}
