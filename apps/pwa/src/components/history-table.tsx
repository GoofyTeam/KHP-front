import { ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@workspace/ui/lib/utils";

export type HistoryEntry = {
  id: string;
  type: "add" | "remove";
  quantity: number;
  date: string;
};

type EnrichedHistoryEntry = {
  id: string;
  type: "add" | "remove";
  quantity: number;
  date: string;
  location?: {
    id: string;
    name: string;
  };
};

export type StockMovement = {
  id: string;
  type: string;
  quantity: number;
  quantity_before?: number | null;
  quantity_after?: number | null;
  created_at?: string;
  location?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
};

interface HistoryTableProps {
  data: HistoryEntry[] | StockMovement[];
  className?: string;
  showHeader?: boolean;
  limitHeight?: boolean;
  unit?: string;
}

function formatDate(value?: string): string {
  if (!value) return "";
  return format(new Date(value), "dd/MM/yyyy");
}

function isStockMovement(
  data: HistoryEntry[] | StockMovement[]
): data is StockMovement[] {
  if (data.length === 0) return false;
  return "created_at" in data[0] && "quantity_before" in data[0];
}

export function HistoryTable({
  data,
  className,
  showHeader = true,
  limitHeight = true,
  unit = "KG",
}: HistoryTableProps) {
  // Use stock movements directly if available, otherwise use legacy format
  const isStockMovements = isStockMovement(data);
  const historyEntries = isStockMovements ? data : (data as HistoryEntry[]);

  if (historyEntries.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
            <ArrowUp className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-center text-base font-medium">
            No history available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {showHeader && (
        <div className="px-6 py-3 border-b bg-muted/20">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Movement History
          </h3>
        </div>
      )}
      <div
        className={cn(
          "divide-y divide-border/50",
          limitHeight &&
            "max-h-[40vh] [@media(min-height:600px)]:max-h-[45vh] [@media(min-height:700px)]:max-h-[50vh] [@media(min-height:800px)]:max-h-[55vh] overflow-y-auto"
        )}
      >
        {historyEntries.map((entry) => {
          // Handle both StockMovement and HistoryEntry formats
          const entryData: EnrichedHistoryEntry = isStockMovements
            ? {
                id: (entry as StockMovement).id,
                type:
                  (entry as StockMovement).type === "addition"
                    ? "add"
                    : "remove",
                quantity: Math.abs((entry as StockMovement).quantity),
                date: formatDate((entry as StockMovement).created_at),
                location: (entry as StockMovement).location,
              }
            : {
                ...(entry as HistoryEntry),
                location: undefined,
              };

          return (
            <div
              key={entryData.id}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors duration-200 active:bg-muted/50",
                "touch-manipulation min-h-[64px]"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                  entryData.type === "add"
                    ? "bg-khp-primary/10 text-khp-primary"
                    : "bg-khp-error/10 text-khp-error"
                )}
              >
                {entryData.type === "add" ? (
                  <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <ArrowDown className="h-5 w-5" strokeWidth={2.5} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-foreground">
                    {entryData.quantity}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground uppercase">
                    {unit}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {entryData.type === "add"
                    ? "Added to stock"
                    : "Removed from stock"}
                  {entryData.location && (
                    <>
                      {" • "}
                      <span className="font-medium text-khp-primary">
                        {entryData.location.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-medium text-foreground">
                  {entryData.date}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
