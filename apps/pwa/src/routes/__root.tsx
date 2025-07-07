import { Outlet, createRootRoute, redirect } from "@tanstack/react-router";
import api from "../lib/api";
import { router } from "../main";
import { Layout } from "../components/Layout";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    try {
      await api.get("/api/user");

      if (location.pathname === "/login" || location.pathname === "/") {
        console.log("Redirecting to /inventory");

        router.navigate({
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

function RootComponent() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
