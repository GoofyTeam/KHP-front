import { useOfflineQueue } from "../stores/offline-queue";
import { useProduct } from "../stores/product-store";
import api from "./api";

function isOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export async function postOrQueue(
  path: string,
  body: Record<string, unknown>,
  optimistic?: { productId: string; deltas: Array<{ locationId: string | null; delta: number }> }
): Promise<void> {
  const queue = useOfflineQueue.getState();

  // optimistic UI immediately
  if (optimistic) {
    const { applyLocalDelta } = useProduct.getState();
    for (const d of optimistic.deltas) {
      applyLocalDelta(optimistic.productId, d.locationId, d.delta);
    }
  }

  if (isOnline()) {
    try {
      await api.post(path, body);
      return;
    } catch (e) {
      // fall through to queue on network-ish errors
    }
  }

  await queue.enqueue({ path, body, productId: optimistic?.productId });
}

