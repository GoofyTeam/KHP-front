import type { Metadata } from "next";
import { AutoBreadcrumb } from "@/components/auto-breadcrumb";

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
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10 mb-4">
        <div className="px-6 py-4 space-y-3">
          <AutoBreadcrumb
            listClassName="text-xl font-semibold"
            lastLabel="Loss"
            isLink={(href) => href !== "/loss"}
            overrides={{ loss: "Losses" }}
          />
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
