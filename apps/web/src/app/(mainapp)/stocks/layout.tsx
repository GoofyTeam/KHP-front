import type { Metadata } from "next";

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
      <header className="border-b border-khp-secondary bg-background sticky top-0 z-10 mb-4">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-foreground">Stock</h1>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
