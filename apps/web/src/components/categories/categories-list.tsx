"use client";

import { useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@apollo/client";
import { GetCategoriesDocument } from "@/graphql/generated/graphql";
import { Button } from "@workspace/ui/components/button";
import { Trash2, Edit, Loader2, Tags, Plus } from "lucide-react";
import type { Category } from "@/graphql/generated/graphql";

export interface CategoriesListRef {
  refresh: () => Promise<void>;
}

interface CategoriesListProps {
  onEdit?: (category: Category) => void;
  onAdd?: () => void;
  selectedCategory?: Category | null;
  onDelete?: (category: Category) => void;
  isDeleting?: boolean;
}

type ListFormData = {
  allCategories: Category[];
  currentPage: number;
  isLoadingMore: boolean;
  hasReachedEnd: boolean;
};

export const CategoriesList = forwardRef<
  CategoriesListRef,
  CategoriesListProps
>(({ onEdit, onAdd, selectedCategory, onDelete, isDeleting = false }, ref) => {
  const form = useForm<ListFormData>({
    defaultValues: {
      allCategories: [],
      currentPage: 1,
      isLoadingMore: false,
      hasReachedEnd: false,
    },
  });

  const { watch, setValue } = form;
  const allCategories = watch("allCategories");
  const currentPage = watch("currentPage");
  const isLoadingMore = watch("isLoadingMore");
  const hasReachedEnd = watch("hasReachedEnd");

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetCategoriesDocument,
    {
      variables: {
        first: 10,
        page: 1,
      },
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    }
  );

  const paginatorInfo = data?.categories?.paginatorInfo;

  useEffect(() => {
    if (data?.categories?.data && currentPage === 1) {
      setValue("allCategories", data.categories.data as Category[]);
    }
  }, [data, currentPage, paginatorInfo, setValue]);

  const loadMore = useCallback(async () => {
    if (!paginatorInfo?.hasMorePages || isLoadingMore || hasReachedEnd) {
      return;
    }

    const nextPage = currentPage + 1;
    setValue("isLoadingMore", true);

    try {
      const result = await fetchMore({
        variables: {
          first: 10,
          page: nextPage,
        },
      });

      if (result.data?.categories?.data) {
        const newCategories = result.data.categories.data as Category[];
        if (newCategories.length === 0) {
          setValue("hasReachedEnd", true);
          return;
        }

        setValue("allCategories", [...allCategories, ...newCategories]);
        setValue("currentPage", nextPage);
      }
    } catch (error) {
      console.error("Error loading more categories:", error);
    } finally {
      setValue("isLoadingMore", false);
    }
  }, [
    paginatorInfo?.hasMorePages,
    isLoadingMore,
    hasReachedEnd,
    currentPage,
    allCategories,
    fetchMore,
    setValue,
  ]);

  // Scroll handler for infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!paginatorInfo?.hasMorePages || isLoadingMore || hasReachedEnd) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      if (scrollPercentage > 0.8) {
        loadMore();
      }
    },
    [loadMore, paginatorInfo?.hasMorePages, isLoadingMore, hasReachedEnd]
  );

  // Reset and refetch data (for refresh after mutations)
  const handleRefetch = useCallback(async () => {
    setValue("currentPage", 1);
    setValue("allCategories", []);
    setValue("isLoadingMore", false);
    setValue("hasReachedEnd", false);

    await refetch({
      first: 10,
      page: 1,
    });
  }, [refetch, setValue]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: handleRefetch,
    }),
    [handleRefetch]
  );

  if (error) {
    return (
      <div className="bg-khp-surface rounded-lg shadow-sm border p-6">
        <div className="text-center py-8">
          <p className="text-khp-danger mb-4">Error loading categories</p>
          <Button onClick={() => refetch()} variant="khp-default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (loading && allCategories.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-khp-primary" />
        <span className="ml-2 text-khp-text-secondary">
          Loading categories...
        </span>
      </div>
    );
  }

  if (allCategories.length === 0 && !loading) {
    return (
      <div className="text-center py-12 px-6">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-khp-primary/10 rounded-full flex items-center justify-center">
            <Tags className="h-8 w-8 text-khp-primary" />
          </div>
          <h3 className="text-lg font-semibold text-khp-text-primary mb-2">
            No categories yet
          </h3>
          <p className="text-khp-text-secondary mb-6">
            Create your first category to start organizing your products
          </p>
          {onAdd && (
            <Button onClick={onAdd} variant="khp-default" className="px-6">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" onScroll={handleScroll}>
      <div className="p-4 pt-0 space-y-2">
        {allCategories.map((category) => {
          const isSelected = selectedCategory?.id === category.id;
          return (
            <div
              key={category.id}
              className={`h-16 py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors rounded-md border ${
                isSelected
                  ? "border-khp-primary bg-khp-primary/10"
                  : "border-khp-border bg-white hover:border-khp-primary/30"
              }`}
              onClick={() => onEdit?.(category)}
            >
              <div className="flex items-center justify-between w-full h-full">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="font-medium text-khp-text-primary truncate mr-3">
                    {category.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(category);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-khp-text-secondary hover:text-khp-primary hover:bg-khp-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(category);
                      }}
                      disabled={isDeleting}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-khp-primary mr-2" />
            <span className="text-sm text-khp-text-secondary">
              Loading more categories...
            </span>
          </div>
        )}

        {/* End of list indicator */}
        {paginatorInfo &&
          !paginatorInfo.hasMorePages &&
          allCategories.length > 0 && (
            <div className="text-center py-4">
              <span className="text-sm text-khp-text-secondary">
                All {allCategories.length} categories loaded
              </span>
            </div>
          )}
      </div>
    </div>
  );
});

CategoriesList.displayName = "CategoriesList";
