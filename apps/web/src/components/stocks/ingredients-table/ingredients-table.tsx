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

interface IngredientsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  searchLoading?: boolean;
  initialLoading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  isRegisterLostMode?: boolean;
  onLoadMore?: () => void;
}

function IngredientsTableComponent<TData, TValue>({
  columns,
  data,
  columnFilters = [],
  onColumnFiltersChange,
  searchLoading = false,
  initialLoading = false,
  loadingMore = false,
  hasMore = false,
  isRegisterLostMode = false,
  onLoadMore,
}: IngredientsTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [scrollInfo, setScrollInfo] = React.useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });
  const tableRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const lastScrollTime = React.useRef(0);
  const isScrolling = React.useRef(false);

  const debouncedScrollInfo = useDebounce(scrollInfo, 100); // Optimisé pour de meilleures performances

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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

      const now = Date.now();

      // Throttle scroll events pour améliorer les performances
      if (now - lastScrollTime.current < 16) {
        // ~60fps
        return;
      }

      lastScrollTime.current = now;
      isScrolling.current = true;

      const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
      setScrollInfo({ scrollTop, scrollHeight, clientHeight });

      // Reset scrolling flag après un délai
      setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    const tableElement = tableRef.current;
    if (tableElement) {
      // Utiliser passive: true pour de meilleures performances
      tableElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        tableElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  // Ref pour éviter les appels multiples rapides
  const lastLoadMoreCallRef = React.useRef<number>(0);
  const isLoadingMoreRef = React.useRef(false);

  React.useEffect(() => {
    if (
      !tableRef.current ||
      !onLoadMore ||
      !hasMore ||
      loadingMore ||
      searchLoading ||
      isScrolling.current ||
      isLoadingMoreRef.current
    )
      return;

    const { scrollTop, scrollHeight, clientHeight } = debouncedScrollInfo;
    const threshold = 200;
    const now = Date.now();

    if (
      scrollTop + clientHeight >= scrollHeight - threshold &&
      now - lastLoadMoreCallRef.current > 800
    ) {
      lastLoadMoreCallRef.current = now;
      isLoadingMoreRef.current = true;

      onLoadMore();

      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }
  }, [debouncedScrollInfo, onLoadMore, hasMore, loadingMore, searchLoading]);

  return (
    <div className="w-full space-y-4">
      <div
        ref={tableRef}
        className="relative overflow-auto rounded-md border border-khp-primary h-[calc(80vh-56px)]  min-w-full"
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
        <table className="w-full caption-bottom text-sm table-fixed">
          <thead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 z-20 border-b border-khp-primary">
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
          <tbody>
            {rows?.length ? (
              <>
                {rows.map((row) => {
                  const ingredient = row.original as { id: string };
                  return (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                      style={{
                        height: "60px",
                        maxHeight: "60px",
                        minHeight: "60px",
                      }}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() =>
                        router.push(
                          isRegisterLostMode
                            ? `/loss/${ingredient.id}`
                            : `/ingredient/${ingredient.id}`
                        )
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-4 align-middle whitespace-nowrap"
                          style={{
                            height: "60px",
                            maxHeight: "60px",
                            minHeight: "60px",
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
                        style={{
                          height: "60px",
                          maxHeight: "60px",
                          minHeight: "60px",
                        }}
                      >
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-4 align-middle whitespace-nowrap"
                            style={{
                              height: "60px",
                              maxHeight: "60px",
                              minHeight: "60px",
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
            ) : initialLoading ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    key={`initial-loading-${i}`}
                    className="border-b transition-colors"
                    style={{
                      height: "60px",
                      maxHeight: "60px",
                      minHeight: "60px",
                    }}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className="p-4 align-middle whitespace-nowrap"
                        style={{
                          height: "60px",
                          maxHeight: "60px",
                          minHeight: "60px",
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
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-0 relative">
                  <div className="flex items-center justify-center text-muted-foreground text-lg font-medium h-full w-full">
                    Nothing found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const IngredientsTable = React.memo(IngredientsTableComponent) as <
  TData,
  TValue,
>(
  props: IngredientsTableProps<TData, TValue>
) => React.ReactElement;
