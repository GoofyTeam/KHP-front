import { useOfflineQueue } from "../stores/offline-queue";

export default function SyncIndicator() {
  const { items, syncState, syncNow } = useOfflineQueue();
  const pending = items.filter((i) => i.status === "PENDING").length;
  const errored = items.filter((i) => i.status === "ERROR").length;

  const label = syncState === "SYNCING" ? "Syncing" : syncState === "ERROR" ? "Erreur" : "Idle";

  return (
    <div className="fixed right-3 bottom-3 z-40 flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow">
      <span className="text-xs text-slate-700">{label}</span>
      <span className="text-xs text-slate-500">{pending} en attente</span>
      {errored > 0 && (
        <span className="text-xs text-red-600">{errored} en erreur</span>
      )}
      <button
        className="text-xs rounded bg-khp-primary px-2 py-1 text-khp-text-on-primary"
        onClick={() => void syncNow()}
      >
        Sync maintenant
      </button>
    </div>
  );
}

