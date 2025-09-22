"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useOrdersStore } from "@/stores/orders-store";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";

import {
  GetOrdersDocument,
  type GetOrdersQuery,
} from "@/graphql/generated/graphql";

type Order = NonNullable<GetOrdersQuery["orders"]["data"]>[number];

interface OrdersDataTableProps<TValue> {
  columns: ColumnDef<Order, TValue>[];
}

export function OrdersDataTable<TValue>({
  columns,
}: OrdersDataTableProps<TValue>) {
  const router = useRouter();
  const { filters } = useOrdersStore();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Prepare GraphQL variables from filters
  const variables = useMemo(() => {
    const vars: any = { first: 20, page: 1 }; // Start with page 1, smaller page size

    // Add status filter if any statuses are selected
    if (filters.statuses.length > 0) {
      vars.statuses = filters.statuses;
    }

    // Add table filter if exactly one table is selected
    // Note: GraphQL only supports single table_id, not multiple
    if (filters.tableIds.length === 1) {
      vars.table_id = filters.tableIds[0];
    }

    return vars;
  }, [filters]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    GetOrdersDocument,
    {
      variables,
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  // Pagination info
  const pageInfo = data?.orders?.paginatorInfo;
  const hasMorePages = pageInfo?.hasMorePages ?? false;

  // Apply client-side room filter (since GraphQL doesn't support room filtering directly)
  const orders: Order[] = useMemo(() => {
    let filteredOrders = data?.orders?.data ?? [];

    // Filter by room (client-side only, since GraphQL doesn't support room filter)
    if (filters.roomIds.length > 0) {
      filteredOrders = filteredOrders.filter((order) =>
        filters.roomIds.includes(order.table.room?.id?.toString() || "")
      );
    }

    // Filter by multiple tables (client-side, when more than one table is selected)
    if (filters.tableIds.length > 1) {
      filteredOrders = filteredOrders.filter((order) =>
        filters.tableIds.includes(order.table.id?.toString() || "")
      );
    }

    return filteredOrders;
  }, [data?.orders?.data, filters.roomIds, filters.tableIds]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    refetch();
  }, [filters, refetch]);

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
            variables: { ...variables, page: nextPage },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              return {
                ...fetchMoreResult,
                orders: {
                  ...fetchMoreResult.orders,
                  data: [...prev.orders.data, ...fetchMoreResult.orders.data],
                },
              };
            },
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, hasMorePages, loading, fetchMore, variables]);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  return (
    <div className="relative rounded-lg border-2 border-khp-primary/30 h-[calc(80vh-56px)] overflow-auto">
      <Table className="w-full caption-bottom text-sm text-khp-text-secondary border-collapse">
        <TableHeader className="text-khp-text-primary h-16">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-khp-primary/30 bg-white"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="px-2 text-left bg-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const original = row.original as {
                id?: string | number;
              };
              if (!original.id) {
                return null;
              }
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => router.push(`/orders/${original.id}`)}
                  tabIndex={0}
                  role="link"
                  aria-label={`Voir détails de la commande ${original.id}`}
                  className="hover:cursor-pointer hover:bg-khp-primary/10 border-b border-khp-text-secondary/30 focus:outline-2 focus:outline-offset-2 focus:outline-khp-primary h-16"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={`skeleton-${index}`}
                className="border-b border-khp-text-secondary/30 h-16"
              >
                {columns.map((_, colIndex) => (
                  <TableCell
                    key={`skeleton-cell-${colIndex}`}
                    className="px-2 text-left"
                  >
                    <Skeleton className="h-8 w-full" />
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
                Aucune commande trouvée.
              </TableCell>
            </TableRow>
          )}
          {/* Infinite scroll sentinel */}
          {hasMorePages && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-16">
                <div
                  ref={sentinelRef}
                  className="flex justify-center items-center h-full"
                >
                  {loading && (
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <span className="text-sm text-muted-foreground">
                        Chargement...
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
