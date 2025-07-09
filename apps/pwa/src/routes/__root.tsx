import {
  Outlet,
  createRootRoute,
  redirect,
  useLocation,
  useMatch,
} from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import api from "../lib/api";
import { Layout } from "../components/Layout";

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
  productId?: string | null,
  isHistoryRoute?: boolean
): string {
  if (PAGE_DOCUMENT_TITLES[pathname]) {
    return PAGE_DOCUMENT_TITLES[pathname];
  }

  if (productId) {
    if (isHistoryRoute) {
      const title = `Historique - Produit ${productId} - KHP`;
      return title;
    }

    const title = `Produit ${productId} - KHP`;
    return title;
  }

  return "KHP";
}

function RootComponent() {
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

  const documentTitle = getDocumentTitle(
    location.pathname,
    productId,
    isHistoryRoute
  );

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
