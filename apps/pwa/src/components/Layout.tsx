import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useLocation, useMatch, useNavigate } from "@tanstack/react-router";
import { useProduct } from "../stores/product-store";
import { useHandleItemStore } from "../stores/handleitem-store";
import { OfflineStatusBanner } from "./OfflineStatusBanner";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PAGES_WITHOUT_BACK_BUTTON = ["/inventory", "/login"];

const PAGE_TITLES: Record<string, string> = {
  "/inventory": "Inventory",
  "/login": "Login",
  "/scan": "Scan",
  "/404": "Page Not Found",
};

export function Layout({ children, className }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentProduct } = useProduct();
  const handleItemTitle = useHandleItemStore((state) => state.pageTitle);

  const productMatch = useMatch({
    from: "/_protected/products/$id",
    shouldThrow: false,
  });
  const historyMatch = useMatch({
    from: "/_protected/products/$id_/history",
    shouldThrow: false,
  });
  const handleItemMatch = useMatch({
    from: "/_protected/handle-item",
    shouldThrow: false,
  });
  const moveQuantityMatch = useMatch({
    from: "/_protected/move-quantity",
    shouldThrow: false,
  });
  const scanMatch = useMatch({
    from: "/_protected/scan/$scanType",
    shouldThrow: false,
  });

  const productId = productMatch?.params?.id || historyMatch?.params?.id;
  const isHistoryRoute = Boolean(historyMatch);

  const productName = currentProduct?.name || null;

  let title: string;
  if (handleItemMatch) {
    title = handleItemTitle;
  } else if (productId && isHistoryRoute) {
    title = `History of ${productName || "Product"}`;
  } else if (productId) {
    title = productName || "Product Details";
  } else {
    title = PAGE_TITLES[location.pathname] || "";
  }

  const handleGoBack = () => {
    if (historyMatch) {
      const productId = historyMatch.params.id;
      navigate({ to: "/products/$id", params: { id: productId } });
      return;
    }

    if (productMatch) {
      navigate({ to: "/inventory" });
      return;
    }

    if (handleItemMatch) {
      const internalId =
        handleItemMatch.loaderData?.productId ||
        handleItemMatch.search?.internalId;
      if (internalId) {
        navigate({ to: "/products/$id", params: { id: internalId } });
        return;
      }
      navigate({ to: "/inventory" });
      return;
    }

    if (moveQuantityMatch) {
      const internalId = moveQuantityMatch.search?.internalId;
      if (internalId) {
        navigate({ to: "/products/$id", params: { id: internalId } });
        return;
      }
      navigate({ to: "/inventory" });
      return;
    }

    if (scanMatch) {
      navigate({ to: "/inventory" });
      return;
    }
    navigate({ to: "/inventory" });
  };

  const shouldShowBackButton = !PAGES_WITHOUT_BACK_BUTTON.includes(
    location.pathname
  );

  return (
    <div className={cn("min-h-screen bg-khp-background", className)}>
      <header
        className={cn(
          "bg-khp-primary text-khp-text-on-primary shadow-sm h-16 sticky top-0 z-10",
          scanMatch && "hidden"
        )}
      >
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
      <main>
        {!scanMatch && <OfflineStatusBanner />}
        {children}
      </main>
    </div>
  );
}
