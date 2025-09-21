"use client";

import { useEffect, useMemo, useState } from "react";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { AlertTriangle, XCircle } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";

import { httpClient } from "@/lib/httpClient";
import type { ExpiryTableItem } from "./types";

type ExpiryTableProps = {
  items: ExpiryTableItem[];
};

const quantityFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatExpirationDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function StatusIcon({ status }: { status: string }) {
  if (status === "expired") {
    return <XCircle className="h-4 w-4 text-khp-error" aria-hidden />;
  }
  return <AlertTriangle className="h-4 w-4 text-khp-warning" aria-hidden />;
}

export function ExpiryTable({ items }: ExpiryTableProps) {
  const [rows, setRows] = useState(items);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set<string>()
  );
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    setRows(items);
  }, [items]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) {
        return prev;
      }

      const next = new Set<string>();
      for (const item of rows) {
        if (prev.has(item.id)) {
          next.add(item.id);
        }
      }

      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const totalCount = rows.length;
  const selectedCount = selectedIds.size;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  const formattedItems = useMemo(
    () =>
      rows.map((item) => ({
        ...item,
        formattedDate: formatExpirationDate(item.expirationDate),
        formattedQuantity: `${quantityFormatter.format(item.quantity)} kg`,
      })),
    [rows]
  );

  const handleToggleAll = (checked: CheckedState) => {
    if (isMarking) return;

    setSelectedIds(() => {
      if (checked === true) {
        return new Set(rows.map((item) => item.id));
      }

      return new Set<string>();
    });
  };

  const handleToggleRow = (id: string, checked: CheckedState) => {
    if (isMarking) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleMarkAsRead = async () => {
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    setIsMarking(true);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => httpClient.patch(`/api/perishables/${id}/read`))
      );

      const succeeded = new Set<string>();
      const failures: { id: string; reason: unknown }[] = [];

      results.forEach((result, index) => {
        const id = ids[index];
        if (result.status === "fulfilled") {
          succeeded.add(id);
        } else {
          failures.push({ id, reason: result.reason });
        }
      });

      if (succeeded.size > 0) {
        setRows((prev) => prev.filter((item) => !succeeded.has(item.id)));
        setSelectedIds(new Set(failures.map((failure) => failure.id)));

        const successCount = succeeded.size;
        toast.success(
          successCount === 1
            ? "1 ingredient marked as read."
            : `${successCount} ingredients marked as read.`
        );
      }

      if (failures.length > 0) {
        const firstError = failures[0]?.reason;
        const message =
          firstError instanceof Error
            ? firstError.message
            : "Failed to mark some ingredients as read.";
        toast.error(message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to mark as read.";
      toast.error(message);
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <>
      <div className="w-full flex justify-end pb-4">
        <Button
          variant="khp-default"
          disabled={selectedCount === 0 || isMarking}
          onClick={handleMarkAsRead}
        >
          {isMarking
            ? "Marking..."
            : selectedCount > 0
              ? `Mark as read (${selectedCount})`
              : "Mark as read"}
        </Button>
      </div>
      <section className="flex h-full flex-col rounded-md border border-khp-primary/30 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-khp-primary/20 px-6 py-4">
          <div>
            <p className="text-sm text-khp-text-secondary">
              {totalCount === 0
                ? "No unread expiry alerts."
                : `${totalCount} unread ingredient${totalCount > 1 ? "s" : ""}`}
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {totalCount === 0 ? (
            <div className="flex h-full items-center justify-center p-8 text-sm text-khp-text-secondary">
              You&apos;re all caught up. No ingredients require your attention.
            </div>
          ) : (
            <Table className="w-full text-sm text-khp-text-secondary">
              <TableHeader className="sticky top-0 z-[1] bg-white">
                <TableRow className="border-b border-khp-primary/20">
                  <TableHead className="w-14 text-center">
                    <Checkbox
                      className="mx-auto"
                      aria-label="Select all"
                      checked={
                        allSelected
                          ? true
                          : isIndeterminate
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={handleToggleAll}
                      disabled={isMarking}
                    />
                  </TableHead>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Expiration date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      className={cn(
                        "border-b border-khp-primary/10 transition-colors hover:bg-khp-primary/5 cursor-pointer",
                        isSelected && "bg-khp-primary/5"
                      )}
                      onClick={() => handleToggleRow(item.id, !isSelected)}
                    >
                      <TableCell className="w-14 text-center">
                        <Checkbox
                          className="mx-auto"
                          aria-label={`Select ${item.name}`}
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleToggleRow(item.id, checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                          disabled={isMarking}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon status={item.status} />
                          <div className="flex flex-col">
                            <span className="font-medium text-khp-text-primary">
                              {item.name}
                            </span>
                            <span className="text-xs text-khp-text-secondary">
                              {item.status === "expired"
                                ? "Expired"
                                : "Expiring soon"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-khp-text-primary">
                        {item.formattedQuantity}
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-khp-text-primary">
                        {item.formattedDate}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </>
  );
}
