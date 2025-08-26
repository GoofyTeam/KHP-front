"use client";

import React from "react";
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
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { AlertTriangle } from "lucide-react";

import { GetIngredientsDocument } from "@/graphql/generated/graphql";
import { useStocksStore } from "@/stores/stocks-store";
import { useIngredientsColumns } from "./ingredients-columns";

export function IngredientsTable() {
  const router = useRouter();
  const { filters, isRegisterLostMode } = useStocksStore();
  const columns = useIngredientsColumns(isRegisterLostMode);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const { data, loading, error } = useQuery(GetIngredientsDocument, {
    variables: {
      page: 1,
      search: filters.search || undefined,
      categoryIds: filters.categoryIds?.length
        ? filters.categoryIds
        : undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  const ingredients = data?.ingredients?.data || [];

  const table = useReactTable({
    data: ingredients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (id: string) => {
    router.push(isRegisterLostMode ? `/loss/${id}` : `/ingredient/${id}`);
  };

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardContent className="flex flex-col items-center space-y-4 pt-6">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Loading Error</h3>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
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

      <div className="relative overflow-auto rounded-md border border-khp-primary h-[calc(80vh-56px)]">
        <table className="w-full caption-bottom text-sm table-fixed">
          <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 z-20 border-b border-khp-primary">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading && !ingredients.length ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b h-[60px]">
                  {columns.map((_, j) => (
                    <td key={j} className="p-4 align-middle">
                      <Skeleton className="h-8 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : ingredients.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b h-[60px] transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-4 align-middle whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
