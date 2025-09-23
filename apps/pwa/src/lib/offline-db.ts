const DB_NAME = "khp-offline";
const DB_VERSION = 1;
const DATA_STORE = "data-cache";
const QUEUE_STORE = "request-queue";

export interface OfflineCacheRecord<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export interface OfflineRequestRecord {
  id: string;
  method: string;
  path: string;
  baseUrl: string;
  body?: unknown;
  headers?: Record<string, string>;
  queuedAt: number;
  attempts: number;
  lastError?: string;
  requiresCsrf?: boolean;
}

let dbPromise: Promise<IDBDatabase | null> | null = null;

const memoryDataStore = new Map<string, OfflineCacheRecord<unknown>>();
const memoryQueueStore = new Map<string, OfflineRequestRecord>();

function isIndexedDBSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (!isIndexedDBSupported()) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getDatabase(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = openDatabase().catch((error) => {
      console.error("Failed to open offline database", error);
      return null;
    });
  }

  return dbPromise;
}

async function runTransaction(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    try {
      operation(store);
    } catch (error) {
      reject(error);
      return;
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveDataCache<T>(
  key: string,
  value: T,
  ttl?: number
): Promise<OfflineCacheRecord<T>> {
  const record: OfflineCacheRecord<T> = {
    value,
    timestamp: Date.now(),
    ttl,
  };

  const db = await getDatabase();

  if (!db) {
    memoryDataStore.set(key, record);
    return record;
  }

  await runTransaction(db, DATA_STORE, "readwrite", (store) => {
    store.put(record, key);
  });

  return record;
}

export async function deleteDataCache(key: string): Promise<void> {
  const db = await getDatabase();

  if (!db) {
    memoryDataStore.delete(key);
    return;
  }

  await runTransaction(db, DATA_STORE, "readwrite", (store) => {
    store.delete(key);
  });
}

export async function getDataCache<T>(
  key: string
): Promise<OfflineCacheRecord<T> | null> {
  const db = await getDatabase();

  if (!db) {
    const record = memoryDataStore.get(key) as
      | OfflineCacheRecord<T>
      | undefined;
    if (!record) {
      return null;
    }

    if (record.ttl && Date.now() - record.timestamp > record.ttl) {
      memoryDataStore.delete(key);
      return null;
    }

    return record;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, "readonly");
    const store = tx.objectStore(DATA_STORE);
    const request = store.get(key);

    request.onsuccess = async () => {
      const record = request.result as OfflineCacheRecord<T> | undefined;
      if (!record) {
        resolve(null);
        return;
      }

      if (record.ttl && Date.now() - record.timestamp > record.ttl) {
        try {
          await deleteDataCache(key);
        } catch (error) {
          console.warn("Failed to purge expired cache entry", error);
        }
        resolve(null);
        return;
      }

      resolve(record);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAllDataCacheKeys(): Promise<string[]> {
  const db = await getDatabase();

  if (!db) {
    return Array.from(memoryDataStore.keys());
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DATA_STORE, "readonly");
    const store = tx.objectStore(DATA_STORE);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      resolve((request.result as IDBValidKey[]).map(String));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function enqueueRequest(
  record: OfflineRequestRecord
): Promise<void> {
  const db = await getDatabase();

  if (!db) {
    memoryQueueStore.set(record.id, record);
    return;
  }

  await runTransaction(db, QUEUE_STORE, "readwrite", (store) => {
    store.put(record, record.id);
  });
}

export async function getQueuedRequests(): Promise<OfflineRequestRecord[]> {
  const db = await getDatabase();

  if (!db) {
    return Array.from(memoryQueueStore.values());
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as OfflineRequestRecord[]) ?? []);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function removeQueuedRequest(id: string): Promise<void> {
  const db = await getDatabase();

  if (!db) {
    memoryQueueStore.delete(id);
    return;
  }

  await runTransaction(db, QUEUE_STORE, "readwrite", (store) => {
    store.delete(id);
  });
}

export async function updateQueuedRequest(
  record: OfflineRequestRecord
): Promise<void> {
  await enqueueRequest(record);
}
