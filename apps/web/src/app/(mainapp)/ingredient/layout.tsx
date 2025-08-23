import type { Metadata } from "next";

import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

export const metadata: Metadata = {
  title: "KHP | Stocks",
  description:
    "Gestion des stocks - Visualisez et gérez l'inventaire de votre entreprise",
};

export default function StocksLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6 px-4 md:px-0 pb-4 lg:pb-8">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
