import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KHP | Loss Details",
  description:
    "Gestion des pertes - Visualisez et gérez les détails des pertes",
};

interface LossLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default async function LossLayout({
  children,
  params,
}: LossLayoutProps) {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10 mb-4">
        <div className="px-6 py-4 space-y-3">
          <Breadcrumb>
            <BreadcrumbList className="text-xl font-semibold">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/stocks">Stocks</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/ingredient/${id}`}>Ingredient</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>loss</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
