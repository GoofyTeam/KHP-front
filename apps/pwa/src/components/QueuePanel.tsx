import { useMemo } from "react";
import { useOfflineQueue } from "../stores/offline-queue";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function QueuePanel({ open, onClose }: Props) {
  const { items, remove, retryOne } = useOfflineQueue();

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.createdAt - b.createdAt),
    [items]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/30"
        role="button"
        aria-label="Close queue panel"
        onClick={onClose}
      />
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-xl border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">File d’attente</h2>
          <button className="text-sm text-slate-600" onClick={onClose}>
            Fermer
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {sorted.length === 0 ? (
            <div className="p-4 text-sm text-slate-600">Aucune opération en attente.</div>
          ) : (
            <ul className="divide-y">
              {sorted.map((op) => (
                <li key={op.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500">
                        {new Date(op.createdAt).toLocaleString()} • tentatives: {op.attempts}
                      </div>
                      <div className="text-sm font-medium break-all">{op.path}</div>
                      <div className="text-xs text-slate-500 truncate">payload: {safeStringify(op.body)}</div>
                      {op.lastError && (
                        <div className="mt-1 text-xs text-red-600">{op.lastError}</div>
                      )}
                    </div>
                    <span
                      className={
                        "shrink-0 rounded px-2 py-0.5 text-xs " +
                        (op.status === "PENDING"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700")
                      }
                    >
                      {op.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="text-xs rounded bg-khp-primary px-2 py-1 text-khp-text-on-primary"
                      onClick={() => void retryOne(op.id)}
                    >
                      Relancer
                    </button>
                    <button
                      className="text-xs rounded border border-slate-300 px-2 py-1 text-slate-700"
                      onClick={() => void remove(op.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

