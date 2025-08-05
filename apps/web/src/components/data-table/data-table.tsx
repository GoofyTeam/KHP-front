"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useDebounce } from "@uidotdev/usehooks";
import { Skeleton } from "@workspace/ui/components/skeleton";

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

function DataTableComponent<TData, TValue>({
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
  const [scrollInfo, setScrollInfo] = React.useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });
  const tableRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const debouncedScrollInfo = useDebounce(scrollInfo, 100);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Pas de getFilteredRowModel() - tout le filtrage se fait côté serveur
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const rows = table.getRowModel().rows;

  React.useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
      setScrollInfo({ scrollTop, scrollHeight, clientHeight });
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener("scroll", handleScroll);
      return () => {
        tableElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  React.useEffect(() => {
    if (
      !tableRef.current ||
      !onLoadMore ||
      !hasMore ||
      loadingMore ||
      searchLoading
    )
      return;

    const { scrollTop, scrollHeight, clientHeight } = debouncedScrollInfo;
    const threshold = 500;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      onLoadMore();
    }
  }, [debouncedScrollInfo, onLoadMore, hasMore, loadingMore, searchLoading]);

  return (
    <div className="w-full space-y-4">
      <div
        ref={tableRef}
        className="relative overflow-auto rounded-md border border-khp-primary max-h-[80vh] lg:max-h-[70vh] min-w-full"
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
        <table className="w-full caption-bottom text-sm min-w-[800px]">
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
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background/95 backdrop-blur whitespace-nowrap"
                      style={{
                        minWidth:
                          header.column.id === "name"
                            ? "200px"
                            : header.column.id === "categories"
                              ? "150px"
                              : header.column.id === "currentStock"
                                ? "120px"
                                : header.column.id === "status"
                                  ? "120px"
                                  : header.column.id === "actions"
                                    ? "100px"
                                    : "100px",
                      }}
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
                {rows.map((row) => {
                  const ingredient = row.original as { id: string };
                  return (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() =>
                        router.push(`/ingredient/${ingredient.id}`)
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-4 align-middle whitespace-nowrap"
                          style={{
                            minWidth:
                              cell.column.id === "name"
                                ? "200px"
                                : cell.column.id === "categories"
                                  ? "150px"
                                  : cell.column.id === "currentStock"
                                    ? "120px"
                                    : cell.column.id === "status"
                                      ? "120px"
                                      : cell.column.id === "actions"
                                        ? "100px"
                                        : "100px",
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {loadingMore && (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <tr
                        key={`loading-${i}`}
                        className="border-b transition-colors"
                      >
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-4 align-middle whitespace-nowrap"
                            style={{
                              minWidth:
                                colIndex === 0
                                  ? "200px"
                                  : colIndex === 1
                                    ? "150px"
                                    : colIndex === 2
                                      ? "120px"
                                      : colIndex === 3
                                        ? "120px"
                                        : colIndex === 4
                                          ? "100px"
                                          : "100px",
                            }}
                          >
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
                  className="h-24 text-center p-4 align-middle whitespace-nowrap"
                  style={{ minWidth: "800px" }}
                >
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Mémorisation simple du DataTable - se base sur les références des props
export const DataTable = React.memo(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => React.ReactElement;
