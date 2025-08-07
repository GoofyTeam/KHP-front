import "@workspace/ui/globals.css";

import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { ApolloWrapper } from "./ApolloWrapper";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KHP | Your new kitchen management app",
  keywords: [
    "kitchen management",
    "restaurant management",
    "kitchen operations",
    "food service",
    "inventory management",
    "order management",
    "kitchen software",
    "restaurant software",
    "kitchen app",
    "restaurant app",
    "kitchen productivity",
    "restaurant productivity",
    "kitchen efficiency",
  ],
  description:
    "KHP is your new kitchen management app, designed to streamline your kitchen operations and enhance productivity. From inventory management to order processing, KHP has you covered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoSans.variable} ${robotoMono.variable} antialiased`}
      >
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
