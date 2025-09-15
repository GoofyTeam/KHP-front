// Minimal IndexedDB helper focused on a single object store
// Avoids adding dependencies; uses promises for common ops

export type IDBRecord<T> = T & { id: string };

export function openDB(dbName: string, storeName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbPut<T>(
  db: IDBDatabase,
  storeName: string,
  value: IDBRecord<T>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(storeName);
    store.put(value);
  });
}

export async function idbGetAll<T>(
  db: IDBDatabase,
  storeName: string
): Promise<Array<IDBRecord<T>>> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as Array<IDBRecord<T>>);
    request.onerror = () => reject(request.error);
  });
}

export async function idbDelete(
  db: IDBDatabase,
  storeName: string,
  id: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(storeName);
    store.delete(id);
  });
}

