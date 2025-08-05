"use client";

import { useState, useCallback, useMemo } from "react";
import { httpClient } from "@/lib/httpClient";
import type {
  Ingredient,
  Category,
  GraphQLResponse,
  StockSummary,
  StockStatus,
} from "@/types/stocks";

const INGREDIENTS_QUERY = `
  query GetCompanyIngredients($page: Int!, $search: String, $categoryId: ID) {
    ingredients(page: $page, search: $search, categoryId: $categoryId) {
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

const CATEGORIES_QUERY = `
  query GetCategories {
    categories {
      data {
        id
        name
      }
    }
  }
`;

const isGraphQLResponse = (data: unknown): data is GraphQLResponse => {
  return (
    typeof data === "object" &&
    data !== null &&
    ("data" in data || "errors" in data)
  );
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
  return ingredients.reduce(
    (acc, ingredient) => {
      const status = getStockStatus(ingredient.quantities);
      acc.totalIngredients++;
      acc[
        status === "in-stock"
          ? "inStock"
          : status === "low-stock"
            ? "lowStock"
            : "outOfStock"
      ]++;
      return acc;
    },
    { totalIngredients: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
  );
};

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  initialLoading: boolean;
  searchLoading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fetchIngredients: (search?: string, categoryId?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  stockSummary: StockSummary;
}

export const useIngredients = (): UseIngredientsReturn => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchingMore, setSearchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const [currentCategoryId, setCurrentCategoryId] = useState<
    string | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchData = useCallback(
    async (
      page: number,
      search: string = "",
      categoryId?: string,
      reset: boolean = false
    ) => {
      if (reset) {
        setLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      } else {
        // Pour les recherches/filtres (page 1 mais pas reset), on utilise searchingMore
        setSearchingMore(true);
      }
      setError(null);

      try {
        const response = await httpClient.post<GraphQLResponse>("/graphql", {
          query: INGREDIENTS_QUERY,
          variables: {
            page,
            ...(search.trim() && { search: search.trim() }),
            ...(categoryId && { categoryId }),
          },
        });

        if (!isGraphQLResponse(response)) {
          throw new Error("Invalid GraphQL response");
        }

        if (response.errors?.length) {
          const errorMessage = response.errors[0]?.message ?? "GraphQL Error";
          if (errorMessage === "Unauthenticated.") {
            window.location.href = "/login";
            return;
          }
          throw new Error(errorMessage);
        }

        if (!response.data?.ingredients) {
          throw new Error("No ingredients data received");
        }

        const { data, paginatorInfo } = response.data.ingredients;
        const validIngredients = data.filter(validateIngredient);

        if (reset || page === 1) {
          // Pour le premier chargement ou les recherches (page 1), on remplace tout
          setIngredients(validIngredients);
        } else {
          // Pour l'infinite scroll (page > 1), on ajoute aux données existantes
          setIngredients((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const newItems = validIngredients.filter(
              (item) => !existingIds.has(item.id)
            );
            return [...prev, ...newItems];
          });
        }

        setCurrentPage(paginatorInfo.currentPage);
        setHasMore(paginatorInfo.hasMorePages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setSearchingMore(false);
        setIsFirstLoad(false);
      }
    },
    []
  );

  const fetchIngredients = useCallback(
    async (search: string = "", categoryId?: string): Promise<void> => {
      setCurrentSearch(search);
      setCurrentCategoryId(categoryId);
      // Pour les recherches après le premier chargement, on ne fait pas de reset complet
      const shouldReset = isFirstLoad;
      await fetchData(1, search, categoryId, shouldReset);
    },
    [fetchData, isFirstLoad]
  );

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loadingMore) {
      return;
    }
    await fetchData(currentPage + 1, currentSearch, currentCategoryId, false);
  }, [
    fetchData,
    currentPage,
    hasMore,
    loadingMore,
    currentSearch,
    currentCategoryId,
  ]);

  const stockSummary = useMemo(
    () => calculateStockSummary(ingredients),
    [ingredients]
  );

  return {
    ingredients,
    initialLoading: loading && isFirstLoad,
    searchLoading: searchingMore,
    loadingMore,
    error,
    hasMore,
    fetchIngredients,
    loadMore,
    stockSummary,
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await httpClient.post<GraphQLResponse>("/graphql", {
        query: CATEGORIES_QUERY,
      });

      if (!isGraphQLResponse(response)) {
        throw new Error("Invalid GraphQL response");
      }

      if (response.errors?.length) {
        const errorMessage = response.errors[0]?.message ?? "GraphQL Error";
        if (errorMessage === "Unauthenticated.") {
          window.location.href = "/login";
          return;
        }
        throw new Error(errorMessage);
      }

      if (!response.data?.categories) {
        throw new Error("No categories data received");
      }

      setCategories(response.data.categories.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
  };
};
