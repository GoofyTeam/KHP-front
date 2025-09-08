"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Loader2Icon, LogOut } from "lucide-react";
import { httpClient } from "@/lib/httpClient";

export function LogoutSection() {
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isPending] = useTransition();

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await httpClient.post("/api/logout");
      router.push("/login");
    } catch (error) {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/10 overflow-hidden">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/10">
        <h3 className="text-lg font-semibold text-khp-text-primary flex items-center gap-3">
          <div className="w-8 h-8 bg-khp-error/20 rounded-full flex items-center justify-center">
            <LogOut className="w-4 h-4 text-khp-error" />
          </div>
          Logout
        </h3>
        <p className="text-sm text-khp-text-secondary mt-1">
          Disconnect from your account and end your session
        </p>
      </div>

      <div className="p-6 space-y-4">
        <Button
          onClick={handleLogout}
          disabled={logoutLoading}
          variant="khp-destructive"
          size="xl-full"
        >
          {logoutLoading || isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2Icon className="animate-spin h-4 w-4" />
              Logging out...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
