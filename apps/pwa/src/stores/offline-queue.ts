import { create } from "zustand";
import api from "../lib/api";
import { openDB, idbPut, idbGetAll, idbDelete } from "../lib/idb";

export type OfflineMutation = {
  id: string; // uuid
  method: "POST"; // scoped v1
  path: string; // e.g., /api/ingredients/:id/add-quantity
  body: unknown; // JSON payload
  createdAt: number;
  attempts: number;
  status: "PENDING" | "ERROR";
  lastError?: string;
  productId?: string; // for quick UI marking (optional)
};

type SyncState = "IDLE" | "SYNCING" | "ERROR";

type OfflineQueueStore = {
  namespace: string; // e.g., `${origin}` or `${tenantId}:${userId}`
  db?: IDBDatabase;
  items: OfflineMutation[];
  syncState: SyncState;
  setNamespace: (ns: string) => Promise<void>;
  enqueue: (item: Omit<OfflineMutation, "id" | "createdAt" | "attempts" | "status">) => Promise<OfflineMutation>;
  remove: (id: string) => Promise<void>;
  reload: () => Promise<void>;
  syncNow: () => Promise<void>;
  retryOne: (id: string) => Promise<void>;
};

const STORE = "queue";

export const useOfflineQueue = create<OfflineQueueStore>((set, get) => ({
  namespace: location.origin, // default; caller can refine
  db: undefined,
  items: [],
  syncState: "IDLE",

  async setNamespace(ns: string) {
    const db = await openDB(`khp-queue:${ns}`, STORE);
    set({ namespace: ns, db });
    await get().reload();
  },

  async reload() {
    const { db } = get();
    if (!db) return;
    const items = await idbGetAll<OfflineMutation>(db, STORE);
    // ensure FIFO by createdAt
    items.sort((a, b) => a.createdAt - b.createdAt);
    set({ items });
  },

  async enqueue(item) {
    const { db } = get();
    if (!db) await get().setNamespace(get().namespace);
    const now = Date.now();
    const full: OfflineMutation = {
      id: crypto.randomUUID(),
      method: "POST",
      path: item.path,
      body: item.body,
      productId: item.productId,
      createdAt: now,
      attempts: 0,
      status: "PENDING",
    };
    await idbPut(get().db!, STORE, full);
    await get().reload();
    return full;
  },

  async remove(id) {
    const { db } = get();
    if (!db) return;
    await idbDelete(db, STORE, id);
    await get().reload();
  },

  async syncNow() {
    const { db, items } = get();
    if (!db || items.length === 0) return;

    set({ syncState: "SYNCING" });

    for (const it of items) {
      if (it.status !== "PENDING") continue;
      try {
        await api.post(it.path, it.body as Record<string, unknown>);
        await idbDelete(db, STORE, it.id);
        await get().reload();
      } catch (e) {
        const errMsg = (e as Error)?.message || "Unknown error";
        // mark as ERROR for 4xx else leave pending for network
        // We don't have Response here; ImprovedHttpClient throws typed error
        const anyErr = e as any;
        const status = anyErr?.status as number | undefined;
        if (status && status >= 400 && status < 500 && status !== 429) {
          const updated: OfflineMutation = { ...it, status: "ERROR", attempts: it.attempts + 1, lastError: errMsg };
          await idbPut(db, STORE, updated);
          await get().reload();
        } else {
          // network/server; stop and surface error state
          set({ syncState: "ERROR" });
          return;
        }
      }
    }

    set({ syncState: "IDLE" });
  },

  async retryOne(id: string) {
    const { db, items } = get();
    if (!db) return;
    const it = items.find((x) => x.id === id);
    if (!it) return;
    if (it.status !== "PENDING" && it.status !== "ERROR") return;
    try {
      await api.post(it.path, it.body as Record<string, unknown>);
      await idbDelete(db, STORE, it.id);
      await get().reload();
    } catch (e) {
      const errMsg = (e as Error)?.message || "Unknown error";
      const anyErr = e as any;
      const status = anyErr?.status as number | undefined;
      const updated: OfflineMutation = {
        ...it,
        status: status && status >= 400 && status < 500 && status !== 429 ? "ERROR" : "PENDING",
        attempts: it.attempts + 1,
        lastError: errMsg,
      };
      await idbPut(db, STORE, updated);
      await get().reload();
    }
  },
}));

// Global online listener to trigger sync when back online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useOfflineQueue.getState().syncNow().catch(() => {});
  });
}
