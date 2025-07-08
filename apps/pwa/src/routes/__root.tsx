import {
  Outlet,
  createRootRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import {
  useProductRouteInfo,
  type ProductRouteInfo,
} from "../hooks/useProductRouteInfo";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    try {
      await api.get("/api/user");

      if (location.pathname === "/login" || location.pathname === "/") {
        throw redirect({
          to: "/inventory",
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error in root route beforeLoad:", error);

      if (location.pathname !== "/login") {
        throw redirect({
          to: "/login",
          replace: true,
        });
      }
    }
  },
  component: RootComponent,
});

const PAGES_WITHOUT_LAYOUT = ["/scan", "/login"];

const PAGE_DOCUMENT_TITLES: Record<string, string> = {
  "/inventory": "Inventory - KHP",
  "/login": "Connexion - KHP",
  "/scan": "Scanner - KHP",
  "/handle-item": "Traiter l'article - KHP",
};

function getDocumentTitle(
  pathname: string,
  productInfo?: ProductRouteInfo
): string {
  if (PAGE_DOCUMENT_TITLES[pathname]) {
    return PAGE_DOCUMENT_TITLES[pathname];
  }

  if (productInfo?.isProductRoute && productInfo.id) {
    if (productInfo.isHistoryRoute) {
      const title = `Historique - Produit ${productInfo.id} - KHP`;
      console.log("Debug - Product history title:", title);
      return title;
    }

    const title = `Produit ${productInfo.id} - KHP`;
    console.log("Debug - Product title:", title);
    return title;
  }

  console.log("Debug - Using default title: KHP");
  return "KHP";
}

function RootComponent() {
  const location = useLocation();
  const productInfo = useProductRouteInfo();
  const documentTitle = getDocumentTitle(location.pathname, productInfo);

  if (PAGES_WITHOUT_LAYOUT.includes(location.pathname)) {
    return (
      <>
        <Helmet>
          <title>{documentTitle}</title>
        </Helmet>
        <Outlet />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{documentTitle}</title>
      </Helmet>
      <Layout>
        <Outlet />
      </Layout>
    </>
  );
}
