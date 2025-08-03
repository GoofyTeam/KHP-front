"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  searchLoading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  columnFilters = [],
  onColumnFiltersChange,
  searchLoading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const tableRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const rows = table.getRowModel().rows;

  // Infinite scroll logic with debounce
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Clear previous timeout
      clearTimeout(timeoutId);

      // Debounce the scroll handler
      timeoutId = setTimeout(() => {
        if (
          !tableRef.current ||
          !onLoadMore ||
          !hasMore ||
          loadingMore ||
          searchLoading
        )
          return;

        const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
        const threshold = 500; // Increased threshold to prevent too frequent calls

        if (scrollTop + clientHeight >= scrollHeight - threshold) {
          console.log("Triggering loadMore...");
          onLoadMore();
        }
      }, 100); // 100ms debounce
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll);
      return () => {
        tableElement.removeEventListener("scroll", handleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [onLoadMore, hasMore, loadingMore, searchLoading]);

  return (
    <div className="w-full space-y-4">
      <div
        ref={tableRef}
        className="relative overflow-auto rounded-md border border-khp-primary max-h-[80vh]"
      >
        {searchLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-khp-primary"></div>
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          </div>
        )}
        <table className="w-full caption-bottom text-sm">
          <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 z-20 border-b border-khp-primary ">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="transition-colors hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background/95 backdrop-blur"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {rows?.length ? (
              <>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {loadingMore && (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr
                        key={`loading-${i}`}
                        className="border-b transition-colors"
                      >
                        {columns.map((_, colIndex) => (
                          <td key={colIndex} className="p-4 align-middle">
                            <Skeleton className="h-12 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}
              </>
            ) : (
              <tr className="border-b transition-colors">
                <td
                  colSpan={columns.length}
                  className="h-24 text-center p-4 align-middle"
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows?.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-muted-foreground">
            Showing {rows.length} results
            {!hasMore && " (all loaded)"}
          </div>
        </div>
      )}
    </div>
  );
}
