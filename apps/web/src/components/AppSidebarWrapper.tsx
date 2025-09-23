"use client";

import { usePathname } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { SettingsMenuButton } from "./settings-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

const getSidebarDefaultState = (currentPath: string): boolean => {
  const defaultOpenPages = ["/dashboard"];
  const defaultClosedPages = [
    "/stocks",
    "/ingredient",
    "/categories",
    "/settings",
    "/menus",
    "/preparations",
    "/waiters",
    "/chefs",
  ];

  if (
    defaultClosedPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/"),
    )
  ) {
    return false;
  }

  if (
    defaultOpenPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/"),
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
  const [sidebarOpen, setSidebarOpen] = useState(defaultOpen);
  const isSettingsPage = pathname.startsWith("/settings");

  // Force l'état de la sidebar selon la page au chargement
  useEffect(() => {
    const pageDefaultState = getSidebarDefaultState(pathname);
    setSidebarOpen(pageDefaultState);
  }, [pathname]);

  const handleOpenChange = useCallback((open: boolean) => {
    setSidebarOpen(open);
  }, []);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={handleOpenChange}>
      <AppSidebar pathname={pathname} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b p-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          {isSettingsPage && <SettingsMenuButton />}
        </header>
        <div className="flex flex-1 flex-col gap-4 ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
