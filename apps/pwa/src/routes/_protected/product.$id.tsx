import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/product/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-khp-text-primary mb-4">
        Produit {id}
      </h2>
      <p className="text-gray-600">Détails du produit avec l'ID : {id}</p>
    </div>
  );
}
