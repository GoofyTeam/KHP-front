"use client";

import { useState, useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { useDebounce } from "@uidotdev/usehooks";
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
import { useIngredients, useCategories } from "@/hooks/useIngredients";
import { DataTable } from "@/components/data-table/data-table";
import { useColumns } from "@/components/data-table/columns";

export default function StocksPage() {
  const {
    ingredients,
    initialLoading,
    searchLoading,
    loadingMore,
    error,
    hasMore,
    fetchIngredients,
    loadMore,
  } = useIngredients();

  const { categories, fetchCategories } = useCategories();

  const [isRegisterLostMode, setIsRegisterLostMode] = useState(false);

  const columns = useColumns(isRegisterLostMode);

  const [searchInput, setSearchInput] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  const debouncedSearchTerm = useDebounce(searchInput.trim(), 400);
  const debouncedCategories = useDebounce(categoryFilters, 300);

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      label: cat.name,
      value: cat.id.toString(),
    }));
  }, [categories]);

  const lastIngredientsRef = useRef<typeof ingredients>([]);
  const filteredResults = useMemo(() => {
    if (ingredients.length !== lastIngredientsRef.current.length) {
      lastIngredientsRef.current = ingredients;
      return ingredients;
    }

    const currentIds = ingredients.map((i) => i.id).join(",");
    const lastIds = lastIngredientsRef.current.map((i) => i.id).join(",");
    if (currentIds !== lastIds) {
      lastIngredientsRef.current = ingredients;
      return ingredients;
    }

    return lastIngredientsRef.current;
  }, [ingredients]);

  const isSearchLoading = searchLoading;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setCategoryFilters(categories);
  }, []);

  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const isLoadingRef = useRef(false);

  loadMoreRef.current = loadMore;
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;

  const handleLoadMore = useCallback(() => {
    if (isLoadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    loadMoreRef
      .current()
      .catch(console.error)
      .finally(() => {
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 300);
      });
  }, []);

  const handleRegisterLost = useCallback(() => {
    setIsRegisterLostMode(true);
  }, [setIsRegisterLostMode]);

  const handleCancelRegisterLost = useCallback(() => {
    setIsRegisterLostMode(false);
  }, [setIsRegisterLostMode]);

  const handleAddToStock = useCallback(() => {
    console.log("Adding to stock...");
  }, []);

  const fetchIngredientsRef = useRef(fetchIngredients);
  const fetchCategoriesRef = useRef(fetchCategories);
  const lastSearchRef = useRef<{ search: string; categoryId?: string }>({
    search: "",
  });

  fetchIngredientsRef.current = fetchIngredients;
  fetchCategoriesRef.current = fetchCategories;

  useLayoutEffect(() => {
    fetchIngredientsRef.current().catch(console.error);
    fetchCategoriesRef.current().catch(console.error);
  }, []);

  useLayoutEffect(() => {
    const categoryId =
      debouncedCategories.length > 0 ? debouncedCategories[0] : undefined;

    const currentSearch = { search: debouncedSearchTerm, categoryId };
    if (
      lastSearchRef.current.search === currentSearch.search &&
      lastSearchRef.current.categoryId === currentSearch.categoryId
    ) {
      return;
    }

    lastSearchRef.current = currentSearch;

    fetchIngredientsRef
      .current(debouncedSearchTerm || "", categoryId)
      .catch(console.error);
  }, [debouncedSearchTerm, debouncedCategories]);

  const dataTableProps = {
    data: filteredResults,
    columnFilters: [],
    onColumnFiltersChange: () => {},
    searchLoading: isSearchLoading,
    initialLoading,
    loadingMore,
    hasMore,
    onLoadMore: handleLoadMore,
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Erreur de chargement</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button
              onClick={() => fetchIngredients().catch(console.error)}
              variant="outline"
            >
              Réessayer
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
              placeholder="Select Categories"
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
                        Register lost
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
              className="pl-10 w-full  h-[48px]"
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
                  Register lost
                </Button>
                <Button variant="khp-default" onClick={handleAddToStock}>
                  Add to stock
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <DataTable columns={columns} {...dataTableProps} isRegisterLostMode={isRegisterLostMode} />
    </div>
  );
}
