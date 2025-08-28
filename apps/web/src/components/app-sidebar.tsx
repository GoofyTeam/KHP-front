"use client";

import * as React from "react";
import { LucideIcon, Square } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";
import { NavUser } from "./nav-user";
import { httpClient } from "@/lib/httpClient";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon: string;
  activePatterns?: string[];
}

interface SidebarConfig {
  navigation: NavigationItem[];
}

const defaultConfig: SidebarConfig = {
  navigation: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "Home",
      activePatterns: ["/dashboard"],
    },
    {
      title: "Stocks",
      url: "/stocks",
      icon: "Package",
      activePatterns: ["/stocks", "/ingredient"],
    },
  ],
};

const getIcon = (iconName: string): LucideIcon => {
  const iconsMap = Icons as unknown as Record<string, LucideIcon>;
  return iconsMap[iconName] || Icons.HelpCircle;
};

const isRouteActive = (currentPath: string, item: NavigationItem): boolean => {
  if (item.activePatterns && item.activePatterns.length > 0) {
    return item.activePatterns.some((pattern) => {
      if (pattern.endsWith("/*")) {
        const basePattern = pattern.slice(0, -2);
        return currentPath.startsWith(basePattern);
      }
      return currentPath === pattern || currentPath.startsWith(pattern + "/");
    });
  }

  return currentPath === item.url || currentPath.startsWith(item.url + "/");
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config?: SidebarConfig;
  pathname?: string;
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({
  config = defaultConfig,
  pathname = "/dashboard",
  user,
  ...props
}: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();
  const [userData, setUserData] = React.useState<any>(null);

  // Fetch user data on component mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await httpClient.get("/api/user");
        console.log("User data response:", response);
        setUserData(response);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fallback = {
    name: "A",
    email: "",
  };
  const currentUser = userData?.user
    ? {
        name: userData.user.name,
        email: userData.user.email,
      }
    : user || fallback;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="cursor-pointer hover:bg-khp-primary/10"
            >
              <Square className="size-8 text-gray-400" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">KHP</span>
                <span className="truncate text-xs">Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="h-full flex justify-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.navigation.map((item) => {
                const ItemIcon = getIcon(item.icon);
                const isActive = isRouteActive(pathname, item);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="lg"
                      tooltip={item.title}
                      isActive={isActive}
                      asChild
                    >
                      <Link
                        href={item.url}
                        className={`relative transition-all duration-200 ease-in-out active:scale-95 ${
                          !isActive
                            ? "hover:!bg-transparent hover:!text-current before:absolute before:inset-0 before:border before:border-transparent before:rounded-md before:transition-colors before:duration-200 hover:before:border-khp-primary"
                            : ""
                        }`}
                      >
                        <ItemIcon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
