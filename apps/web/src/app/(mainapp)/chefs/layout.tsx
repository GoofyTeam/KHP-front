import type { Metadata } from "next";
import { AutoBreadcrumb } from "@/components/auto-breadcrumb";
import { RenderDateWithMinutesAndSeconds } from "@workspace/ui/components/render-date";

export const metadata: Metadata = {
  title: "KHP | Chefs",
  description: "Chefs Screen - Manage and prepare orders efficiently",
};

export default async function WaitersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10">
        <div className="px-6 py-4 space-y-3 flex justify-between items-center">
          <AutoBreadcrumb listClassName="text-xl font-semibold" />

          <div className="text-sm font-medium text-gray-600">
            <p className="text-right text-xl font-medium text-gray-600">
              <RenderDateWithMinutesAndSeconds locale="fr-FR" />
            </p>
          </div>
        </div>
      </header>
      <div className="flex-1 h-full overflow-auto px-4">{children}</div>
    </div>
  );
}
