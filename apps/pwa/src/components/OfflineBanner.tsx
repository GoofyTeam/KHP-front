import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-0 top-16 z-40 flex justify-center px-4">
      <div className="pointer-events-none w-full max-w-3xl">
        <div className="pointer-events-auto rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 shadow">
          Hors connexion — vos actions seront synchronisées à la reconnexion.
        </div>
      </div>
    </div>
  );
}

