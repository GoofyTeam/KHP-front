import { saveDataCache, getDataCache } from "./offline-db";
import type { OfflineCacheRecord } from "./offline-db";
import type { WantedDataType } from "./handleScanType";

const BY_ID_PREFIX = "ingredient:id:";
const BY_BARCODE_PREFIX = "ingredient:barcode:";
const SNAPSHOT_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

async function saveSnapshot(key: string, data: WantedDataType) {
  await saveDataCache(key, data, SNAPSHOT_TTL);
}

export async function saveIngredientSnapshot(
  data: WantedDataType,
  options?: { barcode?: string }
): Promise<void> {
  const tasks: Array<Promise<void>> = [];

  if (data.product_internal_id) {
    tasks.push(
      saveSnapshot(`${BY_ID_PREFIX}${data.product_internal_id}`, data)
    );
  }

  if (options?.barcode) {
    tasks.push(saveSnapshot(`${BY_BARCODE_PREFIX}${options.barcode}`, data));
  }

  if (tasks.length === 0) return;
  await Promise.allSettled(tasks);
}

async function readSnapshot(
  key: string
): Promise<OfflineCacheRecord<WantedDataType> | null> {
  return (await getDataCache<WantedDataType>(key)) ?? null;
}

export function getIngredientSnapshotById(id: string) {
  return readSnapshot(`${BY_ID_PREFIX}${id}`);
}

export function getIngredientSnapshotByBarcode(barcode: string) {
  return readSnapshot(`${BY_BARCODE_PREFIX}${barcode}`);
}
