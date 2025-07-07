import { createFileRoute } from "@tanstack/react-router";
import { usePageTitle } from "../../hooks/usePageTitle";

export const Route = createFileRoute("/_protected/inventory")({
  component: RouteComponent,
});

function RouteComponent() {
  usePageTitle("Inventory");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-khp-text-primary mb-4">
        Gestion des Stocks
      </h2>
    </div>
  );
}
