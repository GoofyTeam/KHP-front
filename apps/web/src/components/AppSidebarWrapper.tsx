"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SettingsMenuButton } from "./settings-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { useUserStore } from "@/stores/user-store";

const getSidebarDefaultState = (currentPath: string): boolean => {
  const defaultOpenPages = ["/dashboard"];
  const defaultClosedPages = ["/stocks", "/ingredient", "settings"];

  if (
    defaultClosedPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/")
    )
  ) {
    return false;
  }

  if (
    defaultOpenPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/")
    )
  ) {
    return true;
  }

  return true;
};

interface AppSidebarWrapperProps {
  children: React.ReactNode;
}

export function AppSidebarWrapper({ children }: AppSidebarWrapperProps) {
  const pathname = usePathname();
  const defaultOpen = getSidebarDefaultState(pathname);
  const { fetchUser } = useUserStore();

  // Vérifier si on est sur une page de settings
  const isSettingsPage = pathname.startsWith("/settings");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar pathname={pathname} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          {/* Bouton des paramètres uniquement sur les pages settings */}
          {isSettingsPage && (
            <div className="ml-auto">
              <SettingsMenuButton />
            </div>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
