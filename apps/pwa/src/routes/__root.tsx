import {
  Outlet,
  createRootRoute,
  redirect,
  useLocation,
  useMatch,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import api from "../lib/api";
import { Layout } from "../components/Layout";
import NotFoundPage from "../pages/NotFound";

function NotFoundComponent() {
  return (
    <>
      <Helmet>
        <title>Page not found - KHP</title>
      </Helmet>
      <NotFoundPage />
    </>
  );
}

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
  notFoundComponent: NotFoundComponent,
});

const PAGES_WITHOUT_LAYOUT = [
  "/scan/$scanType",
  "/scan/add",
  "/scan/remove",
  "/login",
];

const PAGE_DOCUMENT_TITLES: Record<string, string> = {
  "/inventory": "Inventory - KHP",
  "/login": "Login - KHP",
  "/scan/$scanType": "Scan - KHP",
  "/scan/add": "Scan - KHP",
  "/scan/remove": "Scan - KHP",
  "/handle-item": "Manage Item - KHP",
  "/404": "Page not found - KHP",
};

function getDocumentTitle(
  pathname: string,
  productId?: string | null,
  isHistoryRoute?: boolean,
  isNotFound?: boolean
): string {
  if (isNotFound) {
    return PAGE_DOCUMENT_TITLES["/404"];
  }

  if (PAGE_DOCUMENT_TITLES[pathname]) {
    return PAGE_DOCUMENT_TITLES[pathname];
  }

  if (productId) {
    if (isHistoryRoute) {
      const title = `History - Product ${productId} - KHP`;
      return title;
    }

    const title = `Product ${productId} - KHP`;
    return title;
  }

  return "KHP";
}

function RootComponent() {
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error scrolling to top:", error);
      if (typeof document !== "undefined") {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      }
    }
  }, [location.pathname]);

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
