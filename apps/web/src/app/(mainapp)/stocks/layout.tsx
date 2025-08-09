import type { Metadata } from "next";

import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

export const metadata: Metadata = {
  title: "KHP | Stocks",
  description: "Stocks Management - View and manage your company's inventory",
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
          <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-lg font-semibold">Stocks</h1>
          </header>

          <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-6">
              <h1 className="text-xl font-semibold">Stocks Management</h1>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6 p-4 md:p-6">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
