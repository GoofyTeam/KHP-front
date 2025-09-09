"use client";

import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useQuery } from "@apollo/client";
import { GetLocationsDocument, SortOrder } from "@/graphql/generated/graphql";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Trash2, Edit, Loader2, MapPin, Plus } from "lucide-react";
import type { Location } from "@/graphql/generated/graphql";

export interface LocationsListRef {
  refresh: () => Promise<void>;
}

interface LocationsListProps {
  onEdit?: (location: Location) => void;
  onAdd?: () => void;
  selectedLocation?: Location | null;
  onDelete?: (location: Location) => void;
  isDeleting?: boolean;
}

export const LocationsList = forwardRef<LocationsListRef, LocationsListProps>(
  ({ onEdit, onAdd, selectedLocation, onDelete, isDeleting = false }, ref) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [allLocations, setAllLocations] = useState<Location[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const { data, loading, error, refetch, fetchMore } = useQuery(
      GetLocationsDocument,
      {
        variables: {
          first: 10,
          page: 1,
          orderBy: [{ column: "updated_at", order: SortOrder.Desc }],
        },
        fetchPolicy: "cache-and-network",
        errorPolicy: "all",
        notifyOnNetworkStatusChange: true,
      }
    );

    const paginatorInfo = data?.locations?.paginatorInfo;

    // Update allLocations when data changes (only for initial load)
    useEffect(() => {
      if (
        data?.locations?.data &&
        currentPage === 1 &&
        allLocations.length === 0
      ) {
        setAllLocations(data.locations.data as Location[]);
      }
    }, [data, currentPage, allLocations.length]);

    const locations = allLocations;

    // Load more locations
    const loadMore = useCallback(async () => {
      if (!paginatorInfo?.hasMorePages || isLoadingMore || loading) return;

      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      try {
        const result = await fetchMore({
          variables: {
            first: 10,
            page: nextPage,
            orderBy: [{ column: "updated_at", order: SortOrder.Desc }],
          },
        });

        if (result.data?.locations?.data) {
          setAllLocations((prev) => [
            ...prev,
            ...(result.data.locations.data as Location[]),
          ]);
          setCurrentPage(nextPage);
        }
      } catch (error) {
        console.error("Error loading more locations:", error);
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

    // Scroll handler for infinite scroll
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

        // Load more when 80% scrolled
        if (scrollPercentage > 0.8) {
          loadMore();
        }
      },
      [loadMore]
    );

    // Reset when refetch is called (for refresh after mutations)
    const handleRefetch = useCallback(async () => {
      setCurrentPage(1);
      setAllLocations([]);
      await refetch({
        first: 10,
        page: 1,
        orderBy: [{ column: "updated_at", order: SortOrder.Desc }],
      });
    }, [refetch]);

    // Expose refresh function to parent component
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
            <p className="text-khp-danger mb-4">Error loading locations</p>
            <Button onClick={() => refetch()} variant="khp-default">
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (loading && allLocations.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-khp-primary" />
          <span className="ml-2 text-khp-text-secondary">
            Loading locations...
          </span>
        </div>
      );
    }

    if (locations.length === 0 && !loading) {
      return (
        <div className="text-center py-12 px-6">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-khp-primary/10 rounded-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-khp-primary" />
            </div>
            <h3 className="text-lg font-semibold text-khp-text-primary mb-2">
              No locations yet
            </h3>
            <p className="text-khp-text-secondary mb-6">
              Create your first location to start organizing your storage
            </p>
            {onAdd && (
              <Button onClick={onAdd} variant="khp-default" className="px-6">
                <Plus className="h-4 w-4 mr-2" />
                Create Location
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="h-[28rem] overflow-y-auto" onScroll={handleScroll}>
        <div className="p-4 pt-0 space-y-2">
          {locations.map((location) => {
            const isSelected = selectedLocation?.id === location.id;
            return (
              <div
                key={location.id}
                className={`h-16 py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors rounded-md border ${
                  isSelected
                    ? "border-khp-primary bg-khp-primary/10"
                    : "border-khp-border bg-white hover:border-khp-primary/30"
                }`}
                onClick={() => onEdit?.(location)}
              >
                <div className="flex items-center justify-between w-full h-full">
                  <div className="flex items-center flex-1 min-w-0">
                    <span className="font-medium text-khp-text-primary truncate mr-3">
                      {location.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex justify-end">
                      {location.locationType && (
                        <Badge
                          variant={
                            location.locationType.is_default
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs font-medium"
                        >
                          {location.locationType.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(location);
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
                            onDelete(location);
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

          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-khp-primary mr-2" />
              <span className="text-sm text-khp-text-secondary">
                Loading more locations...
              </span>
            </div>
          )}

          {/* End of list indicator */}
          {paginatorInfo &&
            !paginatorInfo.hasMorePages &&
            locations.length > 0 && (
              <div className="text-center py-4">
                <span className="text-sm text-khp-text-secondary">
                  All locations loaded
                </span>
              </div>
            )}
        </div>
      </div>
    );
  }
);

LocationsList.displayName = "LocationsList";
