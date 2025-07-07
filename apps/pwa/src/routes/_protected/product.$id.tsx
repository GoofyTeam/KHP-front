import { createFileRoute } from "@tanstack/react-router";
import { StockStatus } from "@workspace/ui/components/stock-status";

export const Route = createFileRoute("/_protected/product/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6 flex flex-col gap-4 ">
      <div className="flex flex-col justify-center items-center">
        <img
          src="https://images.openfoodfacts.org/images/products/761/303/666/8910/front_fr.164.400.jpg"
          alt="Produit"
          className="aspect-square object-contain max-w-1/2 w-full"
        />
      </div>
      <div className="flex flex-col gap-1 ">
        <h2 className="text-2xl font-semibold">Nom du produit</h2>
        <p>Categorie : Aliments en conserve</p>
      </div>
      <div className="flex justify-between gap-1 items-center">
        <p>Quantity : 17 KG</p>
        <StockStatus variant="out-of-stock" />
      </div>
    </div>
  );
}
