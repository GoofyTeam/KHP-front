import { ArrowDown, ArrowUp } from "lucide-react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

type Movement = {
  quantity_before: number;
  quantity_after: number;
  type: string;
  created_at?: string;
};

interface MovementHistoryProps {
  movements: Movement[];
  unit: string;
  maxHeightClass?: string; // e.g., "h-64" or "max-h-64"
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatQty(qty: number): string {
  if (qty >= 1) return qty.toFixed(1);
  return qty.toFixed(3);
}

export function MovementHistory({
  movements,
  unit,
  maxHeightClass = "h-64",
}: MovementHistoryProps) {
  if (!movements || movements.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="rounded-xl overflow-hidden">
        <div className="px-4 py-3 text-sm font-semibold text-khp-text-primary">
          History
        </div>
        <ScrollArea className={`${maxHeightClass} w-full`}>
          <div className="px-2 divide-y divide-khp-border">
            {movements.map((m, idx) => {
              const delta = Math.abs(m.quantity_after - m.quantity_before);
              const isAddition = m.type === "addition";
              const iconClasses = isAddition
                ? "text-khp-primary bg-khp-primary/10"
                : "text-khp-error bg-khp-error/10";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3"
                >
                  <div className="w-9 flex justify-center">
                    <div
                      className={[
                        "h-7 w-7 rounded-full flex items-center justify-center",
                        iconClasses,
                      ].join(" ")}
                    >
                      {isAddition ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-khp-text-primary text-sm ">
                      {formatQty(delta)} {unit.toUpperCase()}
                    </span>
                  </div>
                  <div className="w-28 text-right">
                    <span className="text-xs text-khp-text-secondary">
                      {formatDate(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
