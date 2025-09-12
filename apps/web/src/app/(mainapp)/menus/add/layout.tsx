import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KHP | Menus",
  description: "Menus Management - View and manage your menus",
};

export default function MenusCreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inherit the breadcrumb/header from parent route: /menus/layout.tsx
  // Center the page content vertically within the available space,
  // while allowing scroll if content exceeds viewport height.
  return <div className="min-h-full flex items-center px-4">{children}</div>;
}
