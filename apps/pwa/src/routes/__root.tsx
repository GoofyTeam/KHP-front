import {
  Outlet,
  createRootRoute,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
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

function getDocumentTitle(pathname: string): string {
  console.log("Debug - Current pathname:", pathname);
  console.log("Debug - Available titles:", Object.keys(PAGE_DOCUMENT_TITLES));

  if (PAGE_DOCUMENT_TITLES[pathname]) {
    console.log("Debug - Found title:", PAGE_DOCUMENT_TITLES[pathname]);
    return PAGE_DOCUMENT_TITLES[pathname];
  }

  if (pathname.startsWith("/product/")) {
    const id = pathname.split("/")[2];
    const title = `Produit ${id} - KHP`;
    console.log("Debug - Product title:", title);
    return title;
  }

  console.log("Debug - Using default title: KHP");
  return "KHP";
}

function RootComponent() {
  const location = useLocation();
  const documentTitle = getDocumentTitle(location.pathname);

  console.log("Debug - Final document title:", documentTitle);

  // Fallback avec document.title pour s'assurer que le titre se met à jour
  useEffect(() => {
    document.title = documentTitle;
    console.log("Debug - Document title set to:", document.title);
  }, [documentTitle]);

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
