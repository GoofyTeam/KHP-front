"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

// Fonction pour déterminer l'état par défaut de la sidebar
const getSidebarDefaultState = (currentPath: string): boolean => {
  const defaultOpenPages = ["/dashboard"];
  const defaultClosedPages = ["/account"];

  // Vérifier si la page courante est dans la liste des pages fermées par défaut
  if (
    defaultClosedPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/")
    )
  ) {
    return false;
  }

  // Vérifier si la page courante est dans la liste des pages ouvertes par défaut
  if (
    defaultOpenPages.some(
      (page) => currentPath === page || currentPath.startsWith(page + "/")
    )
  ) {
    return true;
  }

  // Par défaut, sidebar ouverte
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
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
