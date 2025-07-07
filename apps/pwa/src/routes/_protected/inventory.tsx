import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/inventory")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-khp-text-primary mb-4">
        Gestion des Stocks
      </h2>
    </div>
  );
}
