"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useQuery } from "@apollo/client";
import { GetMenuCategoriesDocument } from "@/graphql/generated/graphql";
import { Button } from "@workspace/ui/components/button";
import { Trash2, Edit, Loader2, Tag, Plus } from "lucide-react";
import type { MenuCategory } from "@/graphql/generated/graphql";

export interface MenuCategoriesListRef {
  refresh: () => Promise<void>;
}

interface MenuCategoriesListProps {
  onEdit?: (category: MenuCategory) => void;
  onAdd?: () => void;
  selectedCategory?: MenuCategory | null;
  onDelete?: (category: MenuCategory) => void;
  isDeleting?: boolean;
}

export const MenuCategoriesList = forwardRef<
  MenuCategoriesListRef,
  MenuCategoriesListProps
>(({ onEdit, onAdd, selectedCategory, onDelete, isDeleting = false }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, loading, error, refetch, fetchMore } = useQuery(
    GetMenuCategoriesDocument,
    {
      variables: {
        first: 10,
        page: 1,
      },
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
  );

  const paginatorInfo = data?.menuCategories?.paginatorInfo;

  useEffect(() => {
    if (
      data?.menuCategories?.data &&
      currentPage === 1 &&
      allCategories.length === 0
    ) {
      setAllCategories(data.menuCategories.data as MenuCategory[]);
    }
  }, [data, currentPage, allCategories.length]);

  const categories = allCategories;

  const loadMore = useCallback(async () => {
    if (!paginatorInfo?.hasMorePages || isLoadingMore || loading) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const result = await fetchMore({
        variables: {
          first: 10,
          page: nextPage,
        },
      });

      if (result.data?.menuCategories?.data) {
        setAllCategories((prev) => [
          ...prev,
          ...(result.data.menuCategories.data as MenuCategory[]),
        ]);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more categories:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    paginatorInfo?.hasMorePages,
    isLoadingMore,
    loading,
    currentPage,
    fetchMore,
  ]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage > 0.8) {
        loadMore();
      }
    },
    [loadMore],
  );

  const handleRefetch = useCallback(async () => {
    setCurrentPage(1);
    setAllCategories([]);
    await refetch({
      first: 10,
      page: 1,
    });
  }, [refetch]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: handleRefetch,
    }),
    [handleRefetch],
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

  if (categories.length === 0 && !loading) {
    return (
      <div className="text-center py-12 px-6">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-khp-primary/10 rounded-full flex items-center justify-center">
            <Tag className="h-8 w-8 text-khp-primary" />
          </div>
          <h3 className="text-lg font-semibold text-khp-text-primary mb-2">
            No categories yet
          </h3>
          <p className="text-khp-text-secondary mb-6">
            Create your first menu category to start organizing your menus
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
    <div className="h-[28rem] overflow-y-auto" onScroll={handleScroll}>
      <div className="p-4 pt-0 space-y-2">
        {categories.map((category) => {
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

        {isLoadingMore && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-khp-primary mr-2" />
            <span className="text-sm text-khp-text-secondary">
              Loading more categories...
            </span>
          </div>
        )}

        {paginatorInfo &&
          !paginatorInfo.hasMorePages &&
          categories.length > 0 && (
            <div className="text-center py-4">
              <span className="text-sm text-khp-text-secondary">
                All categories loaded
              </span>
            </div>
          )}
      </div>
    </div>
  );
});

MenuCategoriesList.displayName = "MenuCategoriesList";
