import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KHP | Create preparation",
  description: "Menus Management - Create a new preparation",
};

export default function PreparationCreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-full flex items-center px-4">{children}</div>;
}
