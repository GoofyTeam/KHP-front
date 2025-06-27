import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KHP | Settings",
  description: "Your new kitchen management app dashboard",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
