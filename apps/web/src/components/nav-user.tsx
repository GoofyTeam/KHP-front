"use client";

import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

export function NavUser() {
  const pathname = usePathname();
  const { user, fetchUser, isLoading } = useUserStore();

  const isSettingsActive = pathname.startsWith("/settings");

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                className={`truncate font-medium ${isLoading && !user ? "opacity-50" : ""}`}
              >
                {user?.name || " "}
              </span>
              <span
                className={`truncate text-xs ${isLoading && !user ? "opacity-50" : ""}`}
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
