"use client";

import { User, Settings, MapPin } from "lucide-react";
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

const settingsNavItems = [
  {
    title: "Account",
    description: "Manage your account settings",
    href: "/settings/account",
    icon: User,
    value: "account",
  },
  {
    title: "Location",
    description: "Manage your location settings",
    href: "/settings/location",
    icon: MapPin,
  },
];

// Composant de navigation réutilisable
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
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings Menu
          </SheetTitle>
          <SheetDescription>
            Navigate between different settings sections
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <NavigationMenu onItemClick={() => setIsMenuOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Composant principal pour la sidebar des paramètres
export function SettingsSidebar() {
  const isMobile = !useBreakpoint("md");

  // Sur mobile, on n'affiche rien car le bouton est maintenant dans l'AppSidebarWrapper
  if (isMobile) {
    return null;
  }

  return (
    <div className="w-64 h-full bg-card border border-border rounded-lg p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>
      <NavigationMenu />
    </div>
  );
}
