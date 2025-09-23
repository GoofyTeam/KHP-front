"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  hasMorePages?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  hasMorePages = false,
  sentinelRef,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "is_a_la_carte",
      value: "all",
    },
    {
      id: "available",
      value: "all",
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
  });

  const table = useReactTable({
    data,
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
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="available" className="font-bold whitespace-nowrap">
              Available ?
            </Label>
            <Select
              onValueChange={(value) =>
                table.getColumn("available")?.setFilterValue(value)
              }
              value={
                (table.getColumn("available")?.getFilterValue() as string) ||
                "all"
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="is_a_la_carte"
              className="font-bold whitespace-nowrap"
            >
              A la carte ?
            </Label>
            <Select
              onValueChange={(value) =>
                table.getColumn("is_a_la_carte")?.setFilterValue(value)
              }
              value={
                (table
                  .getColumn("is_a_la_carte")
                  ?.getFilterValue() as string) || "all"
              }
            >
              <SelectTrigger className="">
                <SelectValue placeholder='Filter by "A la carte"' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-end py-4">
          <Button variant="khp-default" asChild>
            <Link href="/menus/add">Create new menu</Link>
          </Button>
        </div>
      </div>
      <div className="rounded-md border-2 border-khp-primary/30 h-[calc(80vh-56px)] overflow-auto">
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
                            header.getContext(),
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
                    onClick={() => router.push(`/menus/${original.id}`)}
                    tabIndex={0}
                    role="link"
                    aria-label={`Voir détails du menu ${original.name || original.id}`}
                    className="hover:cursor-pointer hover:bg-khp-primary/10 border-b border-khp-secondary focus:outline-2 focus:outline-offset-2 focus:outline-khp-primary h-16"
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
                  No results.
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
        {!hasMorePages && data.length > 0 && (
          <div className="border-b-1 border-khp-text-secondary/30" />
        )}
      </div>
    </>
  );
}
