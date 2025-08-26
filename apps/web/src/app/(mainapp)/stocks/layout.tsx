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
  return <>{children}</>;
}
