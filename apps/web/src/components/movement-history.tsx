import { ArrowDown, ArrowUp } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";

type Movement = {
  quantity_before?: number | null;
  quantity_after?: number | null;
  type: string;
  created_at?: string;
};

interface MovementHistoryProps {
  movements: Movement[];
  unit: string;
  maxHeightClass?: string; // e.g., "h-64" or "max-h-64"
}

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

export function MovementHistory({
  movements,
  unit,
  maxHeightClass = "h-64",
}: MovementHistoryProps) {
  if (!movements || movements.length === 0) {
    return (
      <div className="mt-6">
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
    <div className="mt-6">
      <div className="px-6 py-3 border-b bg-muted/20">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Movement History
        </h3>
      </div>
      <ScrollArea className={maxHeightClass}>
        <div className="divide-y divide-border/50">
          {movements.map((m, idx) => {
            const quantityBefore = m.quantity_before ?? 0;
            const quantityAfter = m.quantity_after ?? 0;
            const delta = Math.abs(quantityAfter - quantityBefore);
            const isAddition = m.type === "addition";

            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors duration-200 active:bg-muted/50",
                  "touch-manipulation min-h-[64px]"
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    isAddition
                      ? "bg-khp-primary/10 text-khp-primary"
                      : "bg-khp-error/10 text-khp-error"
                  )}
                >
                  {isAddition ? (
                    <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <ArrowDown className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {formatQuantity(delta)}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground uppercase">
                      {unit}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {isAddition ? "Added to stock" : "Removed from stock"}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-foreground">
                    {m.created_at
                      ? format(new Date(m.created_at), "dd/MM/yyyy")
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
