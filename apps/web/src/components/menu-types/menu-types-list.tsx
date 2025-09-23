"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2, Pencil, Plus, Trash2, ListOrdered } from "lucide-react";

import {
  GetMenuTypesDocument,
  GetMenuTypesQuery,
  type MenuType,
} from "@workspace/graphql";
import { cn } from "@workspace/ui/lib/utils";

export interface MenuTypesListRef {
  refresh: () => Promise<void>;
}

interface MenuTypesListProps {
  onEdit?: (menuType: MenuType) => void;
  onAdd?: () => void;
  selectedMenuType?: MenuType | null;
  onDelete?: (menuType: MenuType) => void;
  isDeleting?: boolean;
}

export const MenuTypesList = forwardRef<MenuTypesListRef, MenuTypesListProps>(
  ({ onEdit, onAdd, selectedMenuType, onDelete, isDeleting = false }, ref) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, loading, error, refetch } = useQuery<GetMenuTypesQuery>(
      GetMenuTypesDocument,
      {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        notifyOnNetworkStatusChange: true,
      }
    );

    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          setIsRefreshing(true);
          try {
            await refetch();
          } finally {
            setIsRefreshing(false);
          }
        },
      }),
      [refetch]
    );

    const menuTypes = useMemo(() => {
      if (!data?.menuTypes) return [] as MenuType[];

      return [...data.menuTypes].sort((a, b) => {
        if (a.public_index === b.public_index) {
          return a.name.localeCompare(b.name);
        }
        return a.public_index - b.public_index;
      });
    }, [data?.menuTypes]);

    if (error) {
      return (
        <div className="bg-khp-surface rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <p className="text-khp-danger mb-4">Error loading menu types</p>
            <Button onClick={() => refetch()} variant="khp-default">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (loading && menuTypes.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-khp-primary" />
          <span className="ml-2 text-khp-text-secondary">
            Loading menu types...
          </span>
        </div>
      );
    }

    if (menuTypes.length === 0) {
      return (
        <div className="text-center py-12 px-6">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-khp-primary/10 rounded-full flex items-center justify-center">
              <ListOrdered className="h-8 w-8 text-khp-primary" />
            </div>
            <h3 className="text-lg font-semibold text-khp-text-primary mb-2">
              No menu types yet
            </h3>
            <p className="text-khp-text-secondary mb-6">
              Create your first menu type to organize your public menus
            </p>
            {onAdd && (
              <Button onClick={onAdd} variant="khp-default" className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Create Menu Type
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[28rem] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2 text-sm text-khp-text-secondary">
          <span>Type</span>
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <span className="flex items-center gap-1 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" /> Refreshing...
              </span>
            )}
          </div>
        </div>
        <div className="p-4 pt-0 space-y-2">
          {menuTypes.map((menuType) => {
            const isSelected = selectedMenuType?.id === menuType.id;
            return (
              <div
                key={menuType.id}
                className={cn(
                  "h-20 py-3 px-4 cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors rounded-md border flex items-center justify-between",
                  isSelected
                    ? "border-khp-primary bg-khp-primary/10"
                    : "border-khp-border bg-white hover:border-khp-primary/30"
                )}
                onClick={() => onEdit?.(menuType)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-khp-text-primary text-base">
                    {menuType.name}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-khp-text-secondary">
                    <Badge
                      variant="secondary"
                      className="bg-khp-primary/10 text-khp-primary"
                    >
                      Public index: {menuType.public_index}
                    </Badge>
                    <span className="text-xs text-khp-text/60">
                      ID: {menuType.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(menuType);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 text-khp-text-secondary hover:text-khp-primary hover:bg-khp-primary/10"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(menuType);
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
            );
          })}
        </div>
      </div>
    );
  }
);

MenuTypesList.displayName = "MenuTypesList";
