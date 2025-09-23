import { useState } from "react";
import { WifiOff, RefreshCcw } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useOfflineStore } from "../stores/offline-store";
import api from "../lib/api";

function formatTimestamp(timestamp: number | null): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function OfflineStatusBanner() {
  const { isOnline, queuedCount, lastSyncedAt } = useOfflineStore();
  const [isSyncing, setIsSyncing] = useState(false);

  if (isOnline && queuedCount === 0) {
    return null;
  }

  const pendingLabel = `${queuedCount} action${queuedCount > 1 ? "s" : ""} en attente`;
  const lastSyncLabel = formatTimestamp(lastSyncedAt);

  const statusMessage = isOnline
    ? queuedCount > 0
      ? `Synchronisation en cours… ${pendingLabel}.`
      : "Synchronisation terminée."
    : queuedCount > 0
      ? `Mode hors connexion. ${pendingLabel}.`
      : "Vous êtes hors connexion. Les actions seront synchronisées dès le retour du réseau.";

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await api.flushOfflineQueue();
    } catch (error) {
      console.error("Manual sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <WifiOff className="h-5 w-5" aria-hidden="true" />
        <div className="flex flex-col text-sm">
          <span>{statusMessage}</span>
          {lastSyncLabel && isOnline && queuedCount === 0 && (
            <span className="text-xs opacity-80">
              Dernière synchronisation à {lastSyncLabel}.
            </span>
          )}
        </div>
      </div>
      {queuedCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-950 hover:bg-amber-600"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Synchronisation" : "Relancer"}
        </Button>
      )}
    </div>
  );
}

