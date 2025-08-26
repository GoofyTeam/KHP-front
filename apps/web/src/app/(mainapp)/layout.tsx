import type { Metadata } from "next";
import { AppSidebarWrapper } from "@/components/AppSidebarWrapper";

export const metadata: Metadata = {
  title: "KHP | App",
  description: "Kitchen management platform",
};

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppSidebarWrapper>{children}</AppSidebarWrapper>;
}
