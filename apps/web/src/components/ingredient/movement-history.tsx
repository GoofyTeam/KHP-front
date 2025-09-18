import { MovementHistory as MovementHistoryList } from "@workspace/ui/components/movement-history";
import { movementHistoryFromStockMovements } from "@workspace/ui/lib/movement-history";

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

export function MovementHistory({
  movements,
  unit,
  maxHeightClass = "h-64",
}: MovementHistoryProps) {
  return (
    <MovementHistoryList
      className="mt-6"
      entries={movementHistoryFromStockMovements(movements ?? [], unit)}
      defaultUnit={unit}
      useScrollArea
      scrollContainerClassName={maxHeightClass}
    />
  );
}
