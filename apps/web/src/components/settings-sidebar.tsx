"use client";

import {
  User,
  Settings,
  MapPin,
  Tag,
  Tags,
  Layers,
  Building,
  Zap,
  SquareMenu,
  ListOrdered,
  LogOut,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreakpoint } from "@workspace/ui/hooks/use-breakpoint";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Button } from "@workspace/ui/components/button";
import { useApolloClient } from "@apollo/client";
import { performCompleteLogout } from "@/lib/logout-utils";

const settingsNavItems = [
  {
    title: "Account",
    description: "Manage your account settings",
    href: "/settings/account",
    icon: User,
    value: "account",
  },
  {
    title: "Company",
    description: "Manage your company settings",
    href: "/settings/company",
    icon: Building,
  },
  {
    title: "Location Types",
    description: "Manage your location types settings",
    href: "/settings/location-types",
    icon: Layers,
  },
  {
    title: "Location",
    description: "Manage your location settings",
    href: "/settings/location",
    icon: MapPin,
  },
  {
    title: "Categories",
    description: "Manage your categories",
    href: "/settings/categories",
    icon: Tag,
  },
  {
    title: "Menu Categories",
    description: "Manage your menu categories",
    href: "/settings/menu-categories",
    icon: Tags,
  },
  {
    title: "Menu Types",
    description: "Manage your menu types",
    href: "/settings/menu-types",
    icon: ListOrdered,
  },
  {
    title: "Quick Access",
    description: "Configure your quick access buttons",
    href: "/settings/quick-access",
    icon: Zap,
  },
  {
    title: "Public Menus",
    description: "Manage your public menus settings",
    href: "/settings/public-menus",
    icon: SquareMenu,
  },
  {
    title: "Tables",
    description: "Manage your table settings",
    href: "/settings/tables",
    icon: Building,
  },
];

const NavigationMenu = ({ onItemClick }: { onItemClick?: () => void }) => {
  const pathname = usePathname();

  return (
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
                  onClick={onItemClick}
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
  );
};

// Composant pour le bouton des paramètres mobile (utilisé dans AppSidebarWrapper)
export function SettingsMenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Open settings menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings Menu
          </SheetTitle>
          <SheetDescription>
            Navigate between different settings sections
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 p-4 px-2 flex-1 overflow-auto">
          <NavigationMenu onItemClick={() => setIsMenuOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
export function SettingsSidebar() {
  const isMobile = !useBreakpoint("md");
  const apolloClient = useApolloClient();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    await performCompleteLogout(apolloClient);
    window.location.href = "/login";
  };

  if (isMobile) {
    return null;
  }

  return (
    <div className="w-64 h-full bg-card border border-border rounded-lg p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <div className="flex-1 overflow-auto">
        <NavigationMenu />
      </div>
      <div className="mt-6 space-y-2 ">
        <Button
          type="button"
          onClick={handleLogout}
          variant="khp-destructive"
          className="w-full"
          disabled={logoutLoading}
        >
          <div className="flex items-center justify-center gap-2">
            {logoutLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {logoutLoading ? "Logging out..." : "Logout"}
          </div>
        </Button>
      </div>
    </div>
  );
}
