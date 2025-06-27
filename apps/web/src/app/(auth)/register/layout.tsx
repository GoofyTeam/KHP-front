import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KHP | Login",
  description: "Login to your KHP account",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
