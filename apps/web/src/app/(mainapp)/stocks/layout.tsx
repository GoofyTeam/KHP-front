import type { Metadata } from "next";
import StocksBreadcrumbs from "./Breadcrumbs";

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
    <div className="flex flex-col h-full">
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10">
        <div className="px-6 py-4 space-y-3">
          <StocksBreadcrumbs />
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
