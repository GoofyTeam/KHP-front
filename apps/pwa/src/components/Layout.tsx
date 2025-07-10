import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter, useLocation, useMatch } from "@tanstack/react-router";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PAGES_WITHOUT_BACK_BUTTON = ["/inventory", "/login"];

const PAGE_TITLES: Record<string, string> = {
  "/inventory": "Inventory",
  "/login": "Login",
  "/scan": "Scan",
  "/handle-item": "Handle Item",
};

function getPageTitle(
  pathname: string,
  productId?: string | null,
  isHistoryRoute?: boolean
): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  if (productId) {
    if (isHistoryRoute) {
      return `Historique - Produit ${productId}`;
    }

    return `Produit ${productId}`;
  }

  return "";
}

export function Layout({ children, className }: LayoutProps) {
  const router = useRouter();
  const location = useLocation();

  // Accéder directement aux paramètres de route via useMatch
  const productMatch = useMatch({
    from: "/_protected/products/$id",
    shouldThrow: false,
  });

  const historyMatch = useMatch({
    from: "/_protected/products/$id_/history",
    shouldThrow: false,
  });

  const productId = productMatch?.params?.id || historyMatch?.params?.id;
  const isHistoryRoute = Boolean(historyMatch);

  const title = getPageTitle(location.pathname, productId, isHistoryRoute);

  const handleGoBack = () => {
    router.history.back();
  };

  const shouldShowBackButton = !PAGES_WITHOUT_BACK_BUTTON.includes(
    location.pathname
  );

  return (
    <div className={cn("min-h-screen bg-khp-background", className)}>
      <header className="bg-khp-primary text-khp-text-on-primary shadow-sm h-16 sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center gap-2 w-full">
            {shouldShowBackButton && (
              <Button
                onClick={handleGoBack}
                variant="link"
                size="lg"
                className="text-khp-text-on-primary !p-0"
                aria-label="Go back"
              >
                <ArrowLeft className="!h-8 !w-8 md:!h-10 md:!w-10" />
              </Button>
            )}
            {title && (
              <h1 className="text-2xl font-semibold text-khp-text-on-primary">
                {title}
              </h1>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
