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

import {
  useIngredientsApollo,
  useCategoriesApollo,
} from "@/hooks/useIngredientsApollo";
import { IngredientsTable } from "@/components/ingredients-table/ingredients-table";
import { useIngredientsColumns } from "@/components/ingredients-table/ingredients-columns";
import type { Ingredient } from "@/types/stocks";

interface StocksClientProps {
  initialIngredients?: {
    data: Array<{
      id: string;
      name: string;
      unit: string;
      image_url?: string | null;
      quantities: Array<{
        quantity: number;
        location: {
          id: string;
          name: string;
        };
      }>;
      categories: Array<{
        id: string;
        name: string;
      }>;
    }>;
    paginatorInfo: {
      count: number;
      currentPage: number;
      hasMorePages: boolean;
      lastPage: number;
      perPage: number;
      total: number;
      firstItem?: number | null;
      lastItem?: number | null;
    };
  };
  initialCategories?: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
}

export default function StocksClient({
  initialIngredients,
  initialCategories,
}: StocksClientProps) {
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [isRegisterLostMode, setIsRegisterLostMode] = useState(false);

  const debouncedSearchTerm = useDebounce(searchInput.trim(), 400);
  const debouncedCategories = useDebounce(categoryFilters, 300);

  const categoryId =
    debouncedCategories.length > 0 ? debouncedCategories[0] : undefined;

  // Utilisation des hooks Apollo pour les interactions client
  const {
    ingredients,
    initialLoading,
    searchLoading,
    loadingMore,
    error: ingredientsError,
    hasMore,
    fetchMore,
  } = useIngredientsApollo(
    debouncedSearchTerm,
    categoryId,
    initialIngredients?.data as Ingredient[],
    initialIngredients?.paginatorInfo?.hasMorePages
  );

  const { categories, fetchCategories } = useCategoriesApollo();

  // Utiliser les données SSR seulement si aucune recherche/filtre n'est actif
  const displayIngredients = useMemo(() => {
    // Si on a une recherche ou un filtre actif, utiliser uniquement les résultats du hook
    if (debouncedSearchTerm || categoryId) {
      return ingredients;
    }
    // Sinon, utiliser les données du hook ou les données initiales comme fallback
    return ingredients.length > 0
      ? ingredients
      : initialIngredients?.data || [];
  }, [ingredients, initialIngredients?.data, debouncedSearchTerm, categoryId]);

  const displayCategories = useMemo(() => {
    return categories.length > 0 ? categories : initialCategories?.data || [];
  }, [categories, initialCategories?.data]);

  const error = ingredientsError;
  const columns = useIngredientsColumns(isRegisterLostMode);

  const categoryOptions = useMemo(() => {
    return displayCategories.map((cat) => ({
      label: cat.name,
      value: cat.id.toString(),
    }));
  }, [displayCategories]);

  // Optimisation : mémoriser les résultats filtrés pour éviter les re-renders inutiles
  const filteredResults = useMemo(() => {
    return displayIngredients;
  }, [displayIngredients]);

  const isSearchLoading = searchLoading;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setCategoryFilters(categories);
  }, []);

  const loadMoreRef = useRef(fetchMore);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const isLoadingRef = useRef(false);

  loadMoreRef.current = fetchMore;
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;

  const handleLoadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    loadMoreRef.current();

    // Reset après un délai plus court
    setTimeout(() => {
      isLoadingRef.current = false;
    }, 500);
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

  const fetchCategoriesRef = useRef(fetchCategories);
  const lastSearchRef = useRef<{ search: string; categoryId?: string }>({
    search: "",
  });

  fetchCategoriesRef.current = fetchCategories;

  useLayoutEffect(() => {
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
              <h3 className="text-lg font-semibold">Loading Error</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
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
        {...dataTableProps}
        isRegisterLostMode={isRegisterLostMode}
      />
    </div>
  );
}
