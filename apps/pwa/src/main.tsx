import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";

import { routeTree } from "./routeTree.gen";
import "@workspace/ui/globals.css";

export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </StrictMode>
  );
}
