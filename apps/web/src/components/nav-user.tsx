"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUserWithGraphQL } from "@/stores/user-store";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { cn } from "@workspace/ui/lib/utils";

export function NavUser() {
  const pathname = usePathname();
  const { user, fetchUser, isLoading, error } = useUserWithGraphQL();

  const isSettingsActive = pathname.startsWith("/settings");

  useEffect(() => {
    if (!user) {
      fetchUser().catch((err) => {
        console.error("Failed to fetch user:", err);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Afficher un état de chargement ou d'erreur si nécessaire
  if (error && !user) {
    console.warn("Failed to fetch user:", error);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          asChild
          isActive={isSettingsActive}
          className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Link href="/settings/account">
            <Settings className="size-5" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span
                className={cn(
                  "truncate font-medium",
                  isLoading && !user ? "opacity-50" : ""
                )}
              >
                {user?.name || " "}
              </span>
              <span
                className={cn(
                  "truncate text-xs",
                  isLoading && !user ? "opacity-50" : ""
                )}
              >
                {user?.email || "Loading..."}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
