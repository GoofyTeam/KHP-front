"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@apollo/client";
import {
  GetIngredientsDocument,
  GetCategoriesDocument,
} from "@/graphql/generated/graphql";
import type {
  Ingredient,
  Category,
  StockStatus,
  StockSummary,
} from "@/types/stocks";

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

interface UseIngredientsApolloReturn {
  ingredients: Ingredient[];
  initialLoading: boolean;
  searchLoading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMore: () => void;
  stockSummary: StockSummary;
}

export const useIngredientsApollo = (
  search: string = "",
  categoryId?: string,
  initialData?: Ingredient[], // Ajout du paramètre pour les données SSR
  initialHasMore?: boolean // Ajout pour savoir s'il y a plus de données
): UseIngredientsApolloReturn => {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(
    initialData || []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasInitialData] = useState(!!initialData?.length);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Utiliser cache-first si on a des données initiales, sinon cache-and-network
  const fetchPolicy =
    hasInitialData && !search.trim() && !categoryId
      ? "cache-first"
      : "cache-and-network";

  const {
    data,
    loading,
    error,
    fetchMore: apolloFetchMore,
  } = useQuery(GetIngredientsDocument, {
    variables: {
      page: 1,
      ...(search.trim() && { search: search.trim() }),
      ...(categoryId && { categoryId }),
    },
    fetchPolicy,
    notifyOnNetworkStatusChange: true,
    // Skip la requête initiale si on a déjà des données SSR et aucun filtre
    skip: hasInitialData && !search.trim() && !categoryId,
  });

  // Mettre à jour les ingrédients quand les données changent
  useEffect(() => {
    if (data?.ingredients?.data) {
      setAllIngredients(data.ingredients.data as Ingredient[]);
      setCurrentPage(data.ingredients.paginatorInfo.currentPage);
      // Réinitialiser hasReachedEnd quand on a de nouvelles données
      setHasReachedEnd(false);
    }
  }, [data]);

  // Réinitialiser hasReachedEnd et allIngredients quand les paramètres de recherche changent
  useEffect(() => {
    setHasReachedEnd(false);
    setCurrentPage(1);
    setIsLoadingMore(false);
  }, [search, categoryId]);

  const hasMore = useMemo(() => {
    if (hasReachedEnd) return false;
    return (
      data?.ingredients?.paginatorInfo?.hasMorePages ?? initialHasMore ?? false
    );
  }, [data, initialHasMore, hasReachedEnd]);

  const fetchMore = useCallback(() => {
    const now = Date.now();

    // Éviter les appels trop fréquents (minimum 1 seconde entre les appels)
    if (now - lastFetchTime < 1000) {
      return;
    }

    if (!hasMore || isLoadingMore) {
      return;
    }

    setLastFetchTime(now);
    setIsLoadingMore(true);

    apolloFetchMore({
      variables: {
        page: currentPage + 1,
        ...(search.trim() && { search: search.trim() }),
        ...(categoryId && { categoryId }),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        setIsLoadingMore(false);

        if (!fetchMoreResult?.ingredients?.data) {
          setHasReachedEnd(true);
          return prev;
        }

        const newIngredients = fetchMoreResult.ingredients.data;

        // Si pas de nouveaux ingrédients, on marque la fin
        if (newIngredients.length === 0) {
          setHasReachedEnd(true);
          return prev;
        }

        // Créer un Set des IDs existants pour une vérification plus efficace
        const existingIds = new Set(allIngredients.map((item) => item.id));
        const filteredNew = newIngredients.filter(
          (item) => !existingIds.has(item.id)
        );

        // Si tous les ingrédients sont déjà présents, on marque la fin
        if (filteredNew.length === 0) {
          setHasReachedEnd(true);
          return prev;
        }

        // Mettre à jour les ingrédients de manière optimisée
        setAllIngredients((current) => {
          // Vérifier encore une fois pour éviter les doublons
          const currentIds = new Set(current.map((item) => item.id));
          const trulyNew = filteredNew.filter(
            (item) => !currentIds.has(item.id)
          );
          return [...current, ...(trulyNew as Ingredient[])];
        });

        setCurrentPage(fetchMoreResult.ingredients.paginatorInfo.currentPage);

        return {
          ingredients: {
            ...fetchMoreResult.ingredients,
            data: [...(prev.ingredients?.data || []), ...filteredNew],
          },
        };
      },
    }).catch((error) => {
      console.error("Error fetching more ingredients:", error);
      setIsLoadingMore(false);
    });
  }, [
    apolloFetchMore,
    hasMore,
    isLoadingMore,
    currentPage,
    search,
    categoryId,
    allIngredients,
    lastFetchTime,
  ]);

  const stockSummary = useMemo(
    () => calculateStockSummary(allIngredients),
    [allIngredients]
  );

  return {
    ingredients: allIngredients,
    initialLoading: loading && currentPage === 1 && !hasInitialData,
    searchLoading: loading && !!(search.trim() || categoryId),
    loadingMore: isLoadingMore,
    error: error?.message || null,
    hasMore,
    fetchMore,
    stockSummary,
  };
};

export const useCategoriesApollo = () => {
  const { data, loading, error } = useQuery(GetCategoriesDocument, {
    fetchPolicy: "cache-first",
  });

  const fetchCategories = useCallback(async () => {
    // Cette fonction est maintenant gérée automatiquement par Apollo
    return Promise.resolve();
  }, []);

  return {
    categories: (data?.categories?.data as Category[]) || [],
    loading,
    error: error?.message || null,
    fetchCategories,
  };
};
