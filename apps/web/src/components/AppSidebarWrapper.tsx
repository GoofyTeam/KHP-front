"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

const getSidebarDefaultState = (currentPath: string): boolean => {
  const defaultOpenPages = ["/dashboard"];
  const defaultClosedPages = ["/stocks", "/ingredient", "settings", "/loss"];

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

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar pathname={pathname} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 ">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
