"use client";

import { useState, useCallback, useMemo, useLayoutEffect, useRef } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Search, MoreVertical, Plus, AlertTriangle } from "lucide-react";

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

// Plus besoin de FilterState - état découplé

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

  // État local optimisé pour le mode register lost
  const [isRegisterLostMode, setIsRegisterLostMode] = useState(false);

  // Colonnes memoized pour éviter les re-renders inutiles
  const columns = useColumns(isRegisterLostMode);

  // État local pour l'input de recherche (découplé du tableau)
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

  // Optimisation des données pour éviter les re-renders inutiles
  const lastIngredientsRef = useRef<typeof ingredients>([]);
  const filteredResults = useMemo(() => {
    // Si la longueur est différente, on met à jour
    if (ingredients.length !== lastIngredientsRef.current.length) {
      lastIngredientsRef.current = ingredients;
      return ingredients;
    }

    // Si les IDs sont différents, on met à jour
    const currentIds = ingredients.map((i) => i.id).join(",");
    const lastIds = lastIngredientsRef.current.map((i) => i.id).join(",");
    if (currentIds !== lastIds) {
      lastIngredientsRef.current = ingredients;
      return ingredients;
    }

    // Sinon, on garde l'ancienne référence pour éviter les re-renders
    return lastIngredientsRef.current;
  }, [ingredients]);

  // Plus besoin de callback pour les filtres

  // État de chargement - seulement du hook
  const isSearchLoading = searchLoading;

  // Handlers découplés - pas de relation avec le tableau
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value); // Pas de startTransition - pas de re-render du tableau
  }, []);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setCategoryFilters(categories); // Pas de startTransition - pas de re-render du tableau
  }, []);

  // Refs pour accéder aux valeurs actuelles sans causer de re-renders
  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const isLoadingRef = useRef(false); // Protection contre les appels multiples

  // Mettre à jour les refs
  loadMoreRef.current = loadMore;
  hasMoreRef.current = hasMore;
  loadingMoreRef.current = loadingMore;

  // Version stable de handleLoadMore avec protection
  const handleLoadMore = useCallback(() => {
    // Protection contre les appels multiples
    if (isLoadingRef.current || loadingMoreRef.current || !hasMoreRef.current) {
      return;
    }

    isLoadingRef.current = true;
    loadMoreRef
      .current()
      .catch(console.error)
      .finally(() => {
        // Délai réduit pour permettre l'infinite scroll
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 300);
      });
  }, []); // Pas de dépendances = fonction stable

  // Handler pour activer le mode "register lost"
  const handleRegisterLost = useCallback(() => {
    setIsRegisterLostMode(true);
  }, [setIsRegisterLostMode]);

  // Handler pour annuler le mode "register lost"
  const handleCancelRegisterLost = useCallback(() => {
    setIsRegisterLostMode(false);
  }, [setIsRegisterLostMode]);

  const handleAddToStock = useCallback(() => {
    // TODO: Logique d'ajout au stock
    console.log("Adding to stock...");
  }, []);

  // Refs pour les fonctions stables
  const fetchIngredientsRef = useRef(fetchIngredients);
  const fetchCategoriesRef = useRef(fetchCategories);
  const lastSearchRef = useRef<{ search: string; categoryId?: string }>({
    search: "",
  });

  // Mettre à jour les refs
  fetchIngredientsRef.current = fetchIngredients;
  fetchCategoriesRef.current = fetchCategories;

  // Chargement initial - une seule fois au montage
  useLayoutEffect(() => {
    fetchIngredientsRef.current().catch(console.error);
    fetchCategoriesRef.current().catch(console.error);
  }, []); // Pas de dépendances = une seule fois

  // Recherche avec debounce - se déclenche toujours (même pour input vide)
  useLayoutEffect(() => {
    const categoryId =
      debouncedCategories.length > 0 ? debouncedCategories[0] : undefined;

    // Éviter les appels inutiles si les paramètres n'ont pas changé
    const currentSearch = { search: debouncedSearchTerm, categoryId };
    if (
      lastSearchRef.current.search === currentSearch.search &&
      lastSearchRef.current.categoryId === currentSearch.categoryId
    ) {
      return;
    }

    lastSearchRef.current = currentSearch;

    // Appel API même si search est vide (pour réafficher le tableau normal)
    fetchIngredientsRef
      .current(debouncedSearchTerm || "", categoryId)
      .catch(console.error);
  }, [debouncedSearchTerm, debouncedCategories]);

  // Props stables pour le DataTable - AUCUN lien avec l'input de recherche
  const dataTableProps = {
    data: filteredResults,
    columnFilters: [], // Tableau vide constant
    onColumnFiltersChange: () => {}, // Fonction vide
    searchLoading: isSearchLoading,
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

  // Skeleton complet seulement pour le premier chargement
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-44 bg-muted rounded animate-pulse" />
              <div className="h-10 w-36 bg-muted rounded animate-pulse" />
              <div className="h-10 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="h-96 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <MultiSelect
            options={categoryOptions}
            onValueChange={handleCategoriesChange}
            defaultValue={categoryFilters}
            placeholder="Select Categories"
            variant="default"
            className="w-auto"
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 max-w-sm h-[48px]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-2">
            {isRegisterLostMode ? (
              <Button
                variant="outline"
                onClick={handleCancelRegisterLost}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="khp-destructive"
                size="lg"
                onClick={handleRegisterLost}
              >
                Register lost
              </Button>
            )}
            <Button variant="khp-default" size="lg" onClick={handleAddToStock}>
              Add to stock
            </Button>
          </div>

          <div className="lg:hidden">
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
                    Cancel
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleRegisterLost}
                    className="text-destructive focus:text-destructive"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Register lost
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleAddToStock}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <DataTable columns={columns} {...dataTableProps} />
    </div>
  );
}
