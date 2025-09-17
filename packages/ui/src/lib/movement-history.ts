export type PrimitiveTimestamp = string | number | Date | undefined | null;

export type MovementKind =
  | "addition"
  | "removal"
  | "withdrawal"
  | "movement"
  | "move"
  | "transfer"
  | "add"
  | "remove"
  | (string & {});

export interface MovementHistoryEntry {
  id?: string;
  quantity: number;
  type: MovementKind;
  timestamp?: PrimitiveTimestamp;
  unit?: string;
  locationLabel?: string;
  description?: string;
}

export type StockMovementLike = {
  id?: string | number | null;
  type?: MovementKind | null;
  quantity?: number | null;
  quantity_before?: number | null;
  quantity_after?: number | null;
  created_at?: PrimitiveTimestamp;
  location?: { name?: string | null } | null;
};

const MOVEMENT_TYPE_SET = new Set(["movement", "move", "transfer"]);

const getMovementQuantity = (movement: StockMovementLike) => {
  if (typeof movement.quantity === "number") {
    return movement.quantity;
  }

  if (
    typeof movement.quantity_after === "number" &&
    typeof movement.quantity_before === "number"
  ) {
    return movement.quantity_after - movement.quantity_before;
  }

  return 0;
};

const normalizeId = (id: StockMovementLike["id"], fallback: string) => {
  if (id === null || id === undefined) return fallback;
  return typeof id === "string" ? id : String(id);
};

const getQuantityDelta = (movement: StockMovementLike) => {
  if (
    typeof movement.quantity_after === "number" &&
    typeof movement.quantity_before === "number"
  ) {
    return movement.quantity_after - movement.quantity_before;
  }

  const quantity = getMovementQuantity(movement);
  // Without before/after we cannot infer direction; assume positive (target)
  return quantity;
};

export const movementHistoryFromStockMovements = <T extends StockMovementLike>(
  movements: T[],
  unit?: string
): MovementHistoryEntry[] => {
  if (!movements || movements.length === 0) {
    return [];
  }

  const entries: MovementHistoryEntry[] = [];
  const movementBuckets = new Map<
    string,
    {
      items: Array<{ movement: T; quantity: number; delta: number }>;
      firstIndex: number;
    }
  >();

  const buildId = (movement: StockMovementLike, fallbackIndex: number) =>
    normalizeId(movement.id, `movement-${fallbackIndex}`);

  movements.forEach((movement, index) => {
    const quantity = Math.abs(getMovementQuantity(movement));
    const type = (movement.type ?? "unknown").toLowerCase();

    if (MOVEMENT_TYPE_SET.has(type)) {
      const keyBase = movement.created_at ? String(movement.created_at) : `index-${index}`;
      const key = `${keyBase}-${quantity.toFixed(6)}`;
      const bucket = movementBuckets.get(key) ?? { items: [], firstIndex: index };
      bucket.items.push({ movement, quantity, delta: getQuantityDelta(movement) });
      movementBuckets.set(key, bucket);
      return;
    }

    entries.push({
      id: buildId(movement, index),
      type: movement.type ?? "unknown",
      quantity,
      timestamp: movement.created_at ?? undefined,
      unit,
      locationLabel: movement.location?.name ?? undefined,
    });
  });

  if (movementBuckets.size === 0) {
    return entries;
  }

  const sortedBuckets = Array.from(movementBuckets.entries()).sort(
    (a, b) => a[1].firstIndex - b[1].firstIndex
  );

  sortedBuckets.forEach(([key, bucket]) => {
    if (bucket.items.length === 0) return;

    const primary = bucket.items[0];
    const timestamp = primary.movement.created_at ?? undefined;

    const sourceNames = new Set<string>();
    const targetNames = new Set<string>();

    bucket.items.forEach(({ movement, delta }) => {
      const locationName = movement.location?.name;
      if (!locationName) return;
      if (delta < 0) {
        sourceNames.add(locationName);
      } else {
        targetNames.add(locationName);
      }
    });

    const sourceLabel = Array.from(sourceNames).join(", ");
    const targetLabel = Array.from(targetNames).join(", ");

    const locationLabel = sourceLabel && targetLabel
      ? `${sourceLabel} → ${targetLabel}`
      : sourceLabel || targetLabel || undefined;

    const aggregatedId = bucket.items
      .map(({ movement }) => movement.id)
      .filter((value): value is string | number => value !== null && value !== undefined)
      .map(String)
      .join("_") || `movement-${key}`;

    entries.push({
      id: aggregatedId,
      type: "movement",
      quantity: primary.quantity,
      timestamp,
      unit,
      locationLabel,
    });
  });

  return entries;
};
