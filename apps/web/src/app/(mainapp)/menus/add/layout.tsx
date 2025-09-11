import type { Metadata } from "next";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";

export const metadata: Metadata = {
  title: "KHP | Menus",
  description: "Menus Management - View and manage your menus",
};

export default function MenusCreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10">
        <div className="px-6 py-4 space-y-3">
          <Breadcrumb>
            <BreadcrumbList className="text-xl font-semibold">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/menus">Menus</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create Menu</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex-1 overflow-auto px-4">{children}</div>
    </div>
  );
}
