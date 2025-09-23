"use client";

import { ArrowDown, ArrowLeftRight, ArrowUp } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

import {
  type MovementHistoryEntry,
  type MovementKind,
  type PrimitiveTimestamp,
} from "@workspace/ui/lib/movement-history";
import { cn } from "@workspace/ui/lib/utils";

export interface MovementHistoryProps {
  entries: MovementHistoryEntry[];
  defaultUnit?: string;
  className?: string;
  title?: string;
  showHeader?: boolean;
  contentClassName?: string;
  scrollContainerClassName?: string;
  useScrollArea?: boolean;
  scrollAreaProps?: ComponentProps<typeof ScrollArea>;
  actionSlot?: ReactNode;
  quantityFormatter?: (quantity: number, entry: MovementHistoryEntry) => string;
  timestampFormatter?: (date: Date, entry: MovementHistoryEntry) => string;
  sortDescending?: boolean;
  emptyMessage?: string;
}

type NormalizedMovement = "addition" | "removal" | "movement" | "unknown";

const DEFAULT_TITLE = "Movement History";
const DEFAULT_EMPTY_MESSAGE = "No history available.";

const normalizeType = (type: MovementKind | undefined): NormalizedMovement => {
  if (!type) return "unknown";
  const normalized = String(type).toLowerCase();

  if (["addition", "add", "increase", "in"].includes(normalized)) {
    return "addition";
  }

  if (
    ["removal", "remove", "decrease", "out", "withdrawal"].includes(normalized)
  ) {
    return "removal";
  }

  if (["movement", "move", "transfer"].includes(normalized)) {
    return "movement";
  }

  return "unknown";
};

const defaultQuantityFormatter = (quantity: number) =>
  parseFloat(Math.abs(quantity).toFixed(3)).toString();

const padTwo = (value: number) => value.toString().padStart(2, "0");

const defaultTimestampFormatter = (date: Date) => {
  const day = padTwo(date.getDate());
  const month = padTwo(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = padTwo(date.getHours());
  const minutes = padTwo(date.getMinutes());
  const seconds = padTwo(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const parseTimestamp = (value: PrimitiveTimestamp): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
};

const defaultDescriptions: Record<NormalizedMovement, string> = {
  addition: "Added to stock",
  removal: "Removed from stock",
  movement: "Moved between locations",
  unknown: "Stock movement",
};

export function MovementHistory({
  entries,
  defaultUnit,
  className,
  title = DEFAULT_TITLE,
  showHeader = true,
  contentClassName,
  scrollContainerClassName,
  useScrollArea = false,
  scrollAreaProps,
  actionSlot,
  quantityFormatter = defaultQuantityFormatter,
  timestampFormatter = defaultTimestampFormatter,
  sortDescending = true,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: MovementHistoryProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        {showHeader && (
          <div className="py-3 border-b bg-muted/20">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {title}
            </h3>
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <ArrowUp className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-center text-base font-medium">
            {emptyMessage}
          </p>
        </div>
        {actionSlot ? <div className="px-4 pb-4">{actionSlot}</div> : null}
      </div>
    );
  }

  const sortedEntries = sortDescending
    ? [...entries].sort((a, b) => {
        const dateA = parseTimestamp(a.timestamp)?.getTime() ?? 0;
        const dateB = parseTimestamp(b.timestamp)?.getTime() ?? 0;
        return dateB - dateA;
      })
    : entries;

  const content = (
    <div className={cn("divide-y divide-border/50", contentClassName)}>
      {sortedEntries.map((entry, index) => {
        const normalizedType = normalizeType(entry.type);
        const description =
          entry.description ?? defaultDescriptions[normalizedType];
        const quantityLabel = quantityFormatter(entry.quantity, entry);
        const timestamp = parseTimestamp(entry.timestamp);
        const timestampLabel = timestamp
          ? timestampFormatter(timestamp, entry)
          : "";
        const unitLabel = (entry.unit ?? defaultUnit ?? "").toUpperCase();
        const key = entry.id ?? `movement-${index}`;

        const badgeStyles =
          normalizedType === "addition"
            ? "bg-khp-primary/10 text-khp-primary"
            : normalizedType === "removal"
              ? "bg-khp-error/10 text-khp-error"
              : normalizedType === "movement"
                ? "bg-khp-warning/10 text-khp-warning"
                : "bg-muted text-muted-foreground";

        const IconComponent =
          normalizedType === "removal"
            ? ArrowDown
            : normalizedType === "movement"
              ? ArrowLeftRight
              : ArrowUp;

        return (
          <div
            key={key}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors duration-200 active:bg-muted/50",
              "touch-manipulation min-h-[64px]",
            )}
          >
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                badgeStyles,
              )}
            >
              <IconComponent className="h-5 w-5" strokeWidth={2.5} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold text-foreground">
                  {quantityLabel}
                </span>
                {unitLabel ? (
                  <span className="text-sm font-medium text-muted-foreground uppercase">
                    {unitLabel}
                  </span>
                ) : null}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {description}
                {entry.locationLabel ? (
                  <>
                    {" • "}
                    <span className="font-medium text-khp-primary">
                      {entry.locationLabel}
                    </span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="text-sm font-medium text-foreground">
                {timestampLabel}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {showHeader && (
        <div className="py-3 border-b bg-muted/20">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      {useScrollArea ? (
        <ScrollArea
          {...scrollAreaProps}
          className={cn(scrollContainerClassName, scrollAreaProps?.className)}
        >
          {content}
        </ScrollArea>
      ) : (
        <div className={cn(scrollContainerClassName)}>{content}</div>
      )}
      {actionSlot ? (
        <div className="px-4 py-3 flex justify-end gap-2">{actionSlot}</div>
      ) : null}
    </div>
  );
}

export type {
  MovementHistoryEntry,
  MovementKind,
  PrimitiveTimestamp,
} from "@workspace/ui/lib/movement-history";
