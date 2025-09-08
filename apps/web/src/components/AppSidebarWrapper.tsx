"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { useQuery, gql } from "@apollo/client";
import { AppSidebar } from "./app-sidebar";
import { SettingsMenuButton } from "./settings-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

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

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      company {
        id
        name
      }
    }
  }
`;

interface AppSidebarWrapperProps {
  children: React.ReactNode;
}

export function AppSidebarWrapper({ children }: AppSidebarWrapperProps) {
  const pathname = usePathname();
  const defaultOpen = getSidebarDefaultState(pathname);

  const isSettingsPage = pathname.startsWith("/settings");

  const { data } = useQuery(GET_ME, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });

  const currentUser = data?.me
    ? {
        name: data.me.name,
        email: data.me.email,
      }
    : undefined;

  // Console log uniquement le nom de l'utilisateur connecté
  React.useEffect(() => {
    if (data?.me) {
      console.log("User logged:", data.me.name);
    }
  }, [data?.me]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar pathname={pathname} user={currentUser} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
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
