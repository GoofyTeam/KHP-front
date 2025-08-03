"use client";

import { useState, useEffect, useCallback } from "react";
import { httpClient } from "@/lib/httpClient";
import type {
  Ingredient,
  GraphQLResponse,
  GraphQLVariables,
  StockSummary,
  StockStatus,
} from "@/types/stocks";

const INGREDIENTS_QUERY = `
  query GetCompanyIngredients($page: Int!, $name: String) {
    ingredients(page: $page, name: $name) {
      data {
        id
        name
        unit
        image_url
        quantities {
          quantity
          location {
            id
            name
            locationType {
              name
            }
          }
        }
        categories {
          id
          name
        }
      }
      paginatorInfo {
        count
        currentPage
        hasMorePages
        lastPage
        perPage
        total
        firstItem
        lastItem
      }
    }
  }
`;

const isGraphQLResponse = (data: unknown): data is GraphQLResponse => {
  if (typeof data !== "object" || data === null) return false;

  const response = data as Record<string, unknown>;
  const hasData = "data" in response;
  const hasErrors = "errors" in response && Array.isArray(response.errors);

  if (!hasData && !hasErrors) return false;

  if (hasData) {
    const responseData = response.data;
    if (typeof responseData !== "object" || responseData === null) return false;

    const dataObj = responseData as Record<string, unknown>;
    if (!("ingredients" in dataObj)) return false;
  }

  return true;
};

const validateIngredient = (item: unknown): item is Ingredient => {
  if (typeof item !== "object" || item === null) return false;

  const ingredient = item as Record<string, unknown>;

  return (
    typeof ingredient.id === "string" &&
    typeof ingredient.name === "string" &&
    typeof ingredient.unit === "string" &&
    Array.isArray(ingredient.quantities) &&
    Array.isArray(ingredient.categories)
  );
};

export const getStockStatus = (
  quantities: Array<{ quantity: number }>
): StockStatus => {
  const totalQuantity = quantities.reduce((sum, q) => sum + q.quantity, 0);

  if (totalQuantity === 0) return "out-of-stock";
  if (totalQuantity < 10) return "low-stock";
  return "in-stock";
};

export const calculateStockSummary = (
  ingredients: Ingredient[]
): StockSummary => {
  const summary: StockSummary = {
    totalIngredients: ingredients.length,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  };

  ingredients.forEach((ingredient) => {
    const status = getStockStatus(ingredient.quantities);
    switch (status) {
      case "in-stock":
        summary.inStock++;
        break;
      case "low-stock":
        summary.lowStock++;
        break;
      case "out-of-stock":
        summary.outOfStock++;
        break;
    }
  });

  return summary;
};

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  initialLoading: boolean;
  searchLoading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fetchIngredients: (search?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  stockSummary: StockSummary;
}

export const useIngredients = (): UseIngredientsReturn => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchData = useCallback(
    async (page: number, search: string = "", reset: boolean = false) => {
      if (reset) {
        if (!isInitialized) {
          setInitialLoading(true);
        } else {
          setSearchLoading(true);
        }
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Add % wildcards for partial LIKE search and convert to lowercase
      const searchTerm = search.trim()
        ? `%${search.trim().toLowerCase()}%`
        : undefined;

      const variables: GraphQLVariables = {
        page,
        ...(searchTerm ? { name: searchTerm } : {}),
      };

      const requestBody = {
        query: INGREDIENTS_QUERY.trim(),
        variables,
      };

      try {
        let response: GraphQLResponse;

        try {
          response = await httpClient.post<GraphQLResponse>(
            "/graphql",
            requestBody
          );
        } catch (postError) {
          console.error("POST échoué:", postError);
          throw postError;
        }

        if (!isGraphQLResponse(response)) {
          throw new Error(
            `Format de réponse GraphQL invalide: ${JSON.stringify(response)}`
          );
        }

        if (response.errors && response.errors.length > 0) {
          const errorMessage =
            response.errors[0]?.message ?? "Erreur GraphQL inconnue";

          if (errorMessage === "Unauthenticated.") {
            window.location.href = "/login";
            return;
          }

          throw new Error(errorMessage);
        }

        if (!response.data) {
          throw new Error("Aucune donnée reçue du serveur");
        }

        const { data, paginatorInfo } = response.data.ingredients;
        const validIngredients = data.filter(validateIngredient);

        if (validIngredients.length !== data.length) {
          console.warn(
            `${data.length - validIngredients.length} ingrédients invalides ignorés`
          );
        }

        if (reset) {
          setIngredients(validIngredients);
        } else {
          // Déduplication: éviter les doublons basés sur l'ID
          setIngredients((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = validIngredients.filter(
              (item) => !existingIds.has(item.id)
            );

            if (newItems.length < validIngredients.length) {
              console.log(
                `${validIngredients.length - newItems.length} doublons évités`
              );
            }

            return [...prev, ...newItems];
          });
        }

        setCurrentPage(paginatorInfo.currentPage);
        setHasMore(paginatorInfo.hasMorePages);

        if (!isInitialized) {
          setIsInitialized(true);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des ingrédients:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erreur inconnue lors du chargement");
        }
      } finally {
        setInitialLoading(false);
        setSearchLoading(false);
        setLoadingMore(false);
      }
    },
    [isInitialized]
  );

  const fetchIngredients = useCallback(
    async (search: string = ""): Promise<void> => {
      setCurrentSearch(search);
      await fetchData(1, search, true);
    },
    [fetchData]
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loadingMore) {
      console.log("LoadMore blocked:", { hasMore, loadingMore });
      return;
    }
    console.log(`Loading page ${currentPage + 1}...`);
    await fetchData(currentPage + 1, currentSearch, false);
  }, [fetchData, currentPage, hasMore, loadingMore, currentSearch]);

  const stockSummary = calculateStockSummary(ingredients);

  return {
    ingredients,
    initialLoading,
    searchLoading,
    loadingMore,
    error,
    hasMore,
    fetchIngredients,
    loadMore,
    stockSummary,
  };
};
