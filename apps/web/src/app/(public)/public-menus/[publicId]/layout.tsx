import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Card | Explore this restaurant's menu card",
  description: "Explore this restaurant's public menu card.",
  keywords: [
    "restaurant menu",
    "public menu",
    "food menu",
    "dining options",
    "restaurant dishes",
    "menu card",
    "culinary offerings",
    "restaurant specials",
    "menu items",
    "food selection",
  ],
  authors: [{ name: "KHP", url: "https://goofykhp.fr" }],
  creator: "KHP",
  publisher: "KHP",
  openGraph: {
    title: "Card | Explore this restaurant's menu card",
    description: "Explore this restaurant's public menu card.",
    url: "https://goofykhp.fr",
    siteName: "KHP",
    images: [
      {
        url: "https://goofykhp.fr/og-image.png",
        width: 1200,
        height: 630,
        alt: "KHP",
      },
    ],
    locale: "en-US",
    type: "website",
  },
};

export default function PublicMenusLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
