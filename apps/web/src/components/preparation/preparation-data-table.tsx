"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table";
import Link from "next/link";

import {
  GetPreparationsDocument,
  type GetPreparationsQuery,
} from "@/graphql/generated/graphql";

type Preparation = NonNullable<
  GetPreparationsQuery["preparations"]["data"]
>[number];

interface PreparationDataTableProps<TValue> {
  columns: ColumnDef<Preparation, TValue>[];
}

export function PreparationDataTable<TValue>({
  columns,
}: PreparationDataTableProps<TValue>) {
  const router = useRouter();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  });
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    GetPreparationsDocument,
    {
      variables: { page: 1, search: search || undefined },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const preparations: Preparation[] = useMemo(
    () => data?.preparations?.data ?? [],
    [data?.preparations?.data]
  );

  const pageInfo = data?.preparations?.paginatorInfo;
  const hasMorePages = pageInfo?.hasMorePages ?? false;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
            variables: { page: nextPage, search: search || undefined },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;
              return {
                ...fetchMoreResult,
                preparations: {
                  ...fetchMoreResult.preparations,
                  data: [
                    ...prev.preparations.data,
                    ...fetchMoreResult.preparations.data,
                  ],
                },
              };
            },
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMorePages, currentPage, search, loading, fetchMore]);

  const table = useReactTable({
    data: preparations,
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

  const nameFilterValue =
    (table.getColumn("name")?.getFilterValue() as string) ?? "";

  if (error) {
    throw error;
  }

  return (
    <>
      <div className="w-full flex gap-4 mb-4 justify-between">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="font-bold">
              Filter by name
            </Label>
            <Input
              placeholder="Steak, Salad..."
              variant="khp-default"
              value={nameFilterValue}
              onChange={(event) => {
                const v = event.target.value;
                table.getColumn("name")?.setFilterValue(v);
                setSearch(v);
                refetch({ page: 1, search: v || undefined });
              }}
              className="max-w-sm"
            />
          </div>
        </div>
        <div className="flex items-center justify-end py-4">
          <Button variant="khp-default" asChild>
            <Link href="/preparations/add">Create Preparation</Link>
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-khp-secondary">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  name?: string;
                };
                if (!original.id && !original.name) {
                  return null;
                }
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => router.push(`/preparations/${original.id}`)}
                    tabIndex={0}
                    role="link"
                    aria-label={`Voir détails de la préparation ${original.name || original.id}`}
                    className="hover:cursor-pointer hover:bg-khp-primary/10 border-b border-khp-secondary focus:outline-2 focus:outline-offset-2 focus:outline-khp-primary"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {loading ? "Loading..." : "No results."}
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
      </div>
    </>
  );
}
