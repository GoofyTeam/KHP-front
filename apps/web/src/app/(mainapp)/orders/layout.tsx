import type { Metadata } from "next";
import { AutoBreadcrumb } from "@/components/auto-breadcrumb";

export const metadata: Metadata = {
  title: "KHP | Orders",
  description: "Orders Management - View and manage your company's orders",
};

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10">
        <div className="px-6 py-4 space-y-3">
          <AutoBreadcrumb
            listClassName="text-xl font-semibold"
            overrides={{
              "/orders": "Orders",
            }}
          />
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
