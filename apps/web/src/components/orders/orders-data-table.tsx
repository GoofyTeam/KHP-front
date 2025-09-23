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
  OrderStatusEnum,
} from "@workspace/graphql";

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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Prepare GraphQL variables from filters
  const variables = useMemo(() => {
    const vars: {
      first: number;
      page: number;
      statuses?: OrderStatusEnum[];
      table_id?: string;
      start_date?: string;
      end_date?: string;
    } = { first: 20, page: 1 };

    if (filters.statuses.length > 0) {
      vars.statuses = filters.statuses as OrderStatusEnum[];
    }

    if (filters.tableIds.length === 1) {
      vars.table_id = filters.tableIds[0];
    }

    if (filters.startDate) {
      const year = filters.startDate.getFullYear();
      const month = String(filters.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(filters.startDate.getDate()).padStart(2, "0");
      vars.start_date = `${year}-${month}-${day} 00:00:00`;
    }

    if (filters.endDate) {
      const year = filters.endDate.getFullYear();
      const month = String(filters.endDate.getMonth() + 1).padStart(2, "0");
      const day = String(filters.endDate.getDate()).padStart(2, "0");
      vars.end_date = `${year}-${month}-${day} 23:59:59`;
    } else if (filters.startDate && !filters.endDate) {
      const year = filters.startDate.getFullYear();
      const month = String(filters.startDate.getMonth() + 1).padStart(2, "0");
      const day = String(filters.startDate.getDate()).padStart(2, "0");
      vars.end_date = `${year}-${month}-${day} 23:59:59`;
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

  const orders: Order[] = useMemo(() => {
    let filteredOrders = data?.orders?.data ?? [];

    if (filters.roomIds.length > 0) {
      filteredOrders = filteredOrders.filter((order) =>
        filters.roomIds.includes(order.table.room?.id?.toString() || "")
      );
    }

    if (filters.tableIds.length > 1) {
      filteredOrders = filteredOrders.filter((order) =>
        filters.tableIds.includes(order.table.id?.toString() || "")
      );
    }

    return filteredOrders;
  }, [data?.orders?.data, filters.roomIds, filters.tableIds]);

  useEffect(() => {
    setCurrentPage(1);
    refetch();
  }, [filters, refetch]);

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
                  aria-label={`View order details ${original.id}`}
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
                No orders found.
              </TableCell>
            </TableRow>
          )}
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
                        Loading...
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
