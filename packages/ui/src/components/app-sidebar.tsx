"use client";

import * as React from "react";
import { LucideIcon, Square } from "lucide-react";
import * as Icons from "lucide-react";

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
  icon: string; // Nom de l'icône Lucide React
  isActive?: boolean;
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
      isActive: true,
    },
    {
      title: "Stocks",
      url: "/stocks",
      icon: "Package",
      isActive: false,
    },
  ],
};

const getIcon = (iconName: string): LucideIcon => {
  const iconsMap = Icons as unknown as Record<string, LucideIcon>;
  return iconsMap[iconName] || Icons.HelpCircle;
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config?: SidebarConfig;
}

export function AppSidebar({
  config = defaultConfig,
  ...props
}: AppSidebarProps) {
  const { toggleSidebar } = useSidebar();
  const [activeItem, setActiveItem] = React.useState<NavigationItem | null>(
    config.navigation.find((item) => item.isActive) ||
      config.navigation[0] ||
      null
  );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="cursor-pointer hover:bg-sidebar-accent"
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
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="lg"
                      tooltip={item.title}
                      onClick={() => setActiveItem(item)}
                      isActive={activeItem?.title === item.title}
                      asChild
                    >
                      <a href={item.url}>
                        <ItemIcon className="size-5" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* TODO: Ajouter le button hors ligne/en ligne */}
      </SidebarFooter>
    </Sidebar>
  );
}
