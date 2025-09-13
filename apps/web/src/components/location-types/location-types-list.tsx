"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useQuery } from "@apollo/client";
import { GetLocationTypesDocument } from "@/graphql/generated/graphql";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Trash2, Edit, Loader2, Layers, Plus, Shield } from "lucide-react";
import type { LocationType } from "@/graphql/generated/graphql";

export interface LocationTypesListRef {
  refresh: () => Promise<void>;
}

interface LocationTypesListProps {
  onEdit?: (locationType: LocationType) => void;
  onAdd?: () => void;
  selectedLocationType?: LocationType | null;
  onDelete?: (locationType: LocationType) => void;
  isDeleting?: boolean;
}

export const LocationTypesList = forwardRef<
  LocationTypesListRef,
  LocationTypesListProps
>(
  (
    { onEdit, onAdd, selectedLocationType, onDelete, isDeleting = false },
    ref
  ) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [allLocationTypes, setAllLocationTypes] = useState<LocationType[]>(
      []
    );
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { data, loading, error, refetch, fetchMore } = useQuery(
      GetLocationTypesDocument,
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

    const paginatorInfo = data?.locationTypes?.paginatorInfo;

    useEffect(() => {
      if (
        data?.locationTypes?.data &&
        currentPage === 1 &&
        allLocationTypes.length === 0
      ) {
        setAllLocationTypes(data.locationTypes.data as LocationType[]);
      }
    }, [data, currentPage, allLocationTypes.length]);

    const locationTypes = allLocationTypes;

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

        if (result.data?.locationTypes?.data) {
          setAllLocationTypes((prev) => [
            ...prev,
            ...(result.data.locationTypes.data as LocationType[]),
          ]);
          setCurrentPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more location types:", error);
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
      [loadMore]
    );

    const handleRefetch = useCallback(async () => {
      setCurrentPage(1);
      setAllLocationTypes([]);
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
      [handleRefetch]
    );

    if (error) {
      return (
        <div className="bg-khp-surface rounded-lg shadow-sm border p-6">
          <div className="text-center py-8">
            <p className="text-khp-danger mb-4">Error loading location types</p>
            <Button onClick={() => refetch()} variant="khp-default">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (loading && allLocationTypes.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-khp-primary" />
          <span className="ml-2 text-khp-text-secondary">
            Loading location types...
          </span>
        </div>
      );
    }

    if (locationTypes.length === 0 && !loading) {
      return (
        <div className="text-center py-12 px-6">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-khp-primary/10 rounded-full flex items-center justify-center">
              <Layers className="h-8 w-8 text-khp-primary" />
            </div>
            <h3 className="text-lg font-semibold text-khp-text-primary mb-2">
              No location types yet
            </h3>
            <p className="text-khp-text-secondary mb-6">
              Create your first location type to categorize your storage areas
            </p>
            {onAdd && (
              <Button onClick={onAdd} variant="khp-default" className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Create Location Type
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[28rem] overflow-y-auto" onScroll={handleScroll}>
        <div className="p-4 pt-0 space-y-2">
          {locationTypes.map((locationType) => {
            const isSelected = selectedLocationType?.id === locationType.id;
            return (
              <div
                key={locationType.id}
                className={`h-16 py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors rounded-md border ${
                  isSelected
                    ? "border-khp-primary bg-khp-primary/10"
                    : "border-khp-border bg-white hover:border-khp-primary/30"
                }`}
                onClick={() => onEdit?.(locationType)}
              >
                <div className="flex items-center justify-between w-full h-full">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="font-medium text-khp-text-primary truncate mr-3">
                      {locationType.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex justify-end">
                      {locationType.is_default && (
                        <Badge
                          variant="default"
                          className="text-xs font-medium flex items-center gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(locationType);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-khp-text-secondary hover:text-khp-primary hover:bg-khp-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {onDelete && !locationType.is_default && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(locationType);
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
              </div>
            );
          })}

          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-khp-primary mr-2" />
              <span className="text-sm text-khp-text-secondary">
                Loading more location types...
              </span>
            </div>
          )}

          {paginatorInfo &&
            !paginatorInfo.hasMorePages &&
            locationTypes.length > 0 && (
              <div className="text-center py-4">
                <span className="text-sm text-khp-text-secondary">
                  All location types loaded
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }
);

LocationTypesList.displayName = "LocationTypesList";
