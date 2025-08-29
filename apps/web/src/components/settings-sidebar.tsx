"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

const settingsNavItems = [
  {
    title: "Account",
    description: "Manage your account settings",
    href: "/settings/account",
    icon: User,
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-card border border-border rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <SidebarGroup className="p-0">
        <SidebarGroupContent>
          <SidebarMenu>
            {settingsNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.description}
                    size="lg"
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium leading-none">
                          {item.title}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
}
