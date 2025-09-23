"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { GetIngredientsDocument } from "@/graphql/generated/graphql";
import { useStocksStore } from "@/stores/stocks-store";
import { useIngredientsColumns } from "./ingredients-columns";
import type { GetIngredientsQuery } from "@/graphql/generated/graphql";

export function IngredientsTable() {
  const router = useRouter();
  const { filters, isRegisterLostMode } = useStocksStore();
  const columns = useIngredientsColumns(isRegisterLostMode);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore } = useQuery(GetIngredientsDocument, {
    variables: {
      page: 1,
      search: filters.search || undefined,
      categoryIds: filters.categoryIds?.length
        ? filters.categoryIds
        : undefined,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const ingredients: GetIngredientsQuery["ingredients"]["data"] = useMemo(
    () => data?.ingredients?.data ?? [],
    [data?.ingredients?.data],
  );

  const pageInfo = data?.ingredients?.paginatorInfo;
  const hasMorePages = pageInfo?.hasMorePages ?? false;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.categoryIds]);

  // Infinite scroll logic

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMorePages || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);

          fetchMore({
            variables: {
              page: nextPage,
              search: filters.search || undefined,
              categoryIds: filters.categoryIds?.length
                ? filters.categoryIds
                : undefined,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;

              return {
                ...fetchMoreResult,
                ingredients: {
                  ...fetchMoreResult.ingredients,
                  data: [
                    ...prev.ingredients.data,
                    ...fetchMoreResult.ingredients.data,
                  ],
                },
              };
            },
          });
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    hasMorePages,
    currentPage,
    filters.search,
    filters.categoryIds,
    loading,
    fetchMore,
  ]);

  const table = useReactTable({
    data: ingredients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
  });

  const handleRowClick = (id: string) => {
    router.push(isRegisterLostMode ? `/loss/${id}` : `/ingredient/${id}`);
  };

  if (error) {
    throw new Error(error.message || "Failed to load ingredients");
  }

  return (
    <div className="w-full space-y-4">
      {loading && filters.search && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-khp-primary" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        </div>
      )}

      <div className="relative rounded-lg border-2 border-khp-primary/30 h-[calc(80vh-56px)] overflow-auto">
        <Table className="w-full caption-bottom text-sm text-khp-text-secondary border-collapse">
          <TableHeader className="text-khp-text-primary h-16">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-khp-primary/30 bg-white"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-2 text-left bg-white"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading && !ingredients.length ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow
                  key={i}
                  className="border-b border-khp-text-secondary/30 h-16"
                >
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-2 text-left">
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : ingredients.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-khp-text-secondary/30 h-16 cursor-pointer hover:bg-khp-primary/10"
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b border-khp-text-secondary/30">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground px-2"
                >
                  No ingredient found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {hasMorePages && (
          <div
            ref={sentinelRef}
            className="h-8 flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-khp-primary" />
          </div>
        )}
        {!hasMorePages && ingredients.length > 0 && (
          <div className="border-b-1 border-khp-text-secondary/30" />
        )}
      </div>
    </div>
  );
}
