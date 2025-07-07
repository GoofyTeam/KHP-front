import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { StockStatus } from "@workspace/ui/components/stock-status";
import {
  HistoryTable,
  type HistoryEntry,
} from "@workspace/ui/components/history-table";
import { Button } from "@workspace/ui/components/button";
import { NotebookPen } from "lucide-react";

export const Route = createFileRoute("/_protected/product/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const historyData: HistoryEntry[] = [
    {
      id: "1",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "2",
      type: "remove",
      quantity: 0.25,
      date: "12/09/2025",
    },
    {
      id: "3",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "4",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "5",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "6",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
  ];

  return (
    <div>
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
          <StockStatus variant="in-stock" showLabel={false} />
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 px-6 py-2">
        <h3 className="text-lg font-semibold">History :</h3>
        <Link
          to="/inventory"
          className="text-sm text-khp-primary underline underline-offset-2 cursor-pointer"
        >
          View all
        </Link>
      </div>
      <HistoryTable data={historyData} showHeader={false} />
      <div className="flex justify-center p-6">
        <Button
          variant="khp-default"
          className="pointer-events-auto "
          size="xl"
          onClick={() => {
            navigate({
              to: "/handle-item",
              search: {
                mode: "manual",
                type: "add",
              },
            });
          }}
        >
          <NotebookPen strokeWidth={2} className="text-white !h-5 !w-5" />{" "}
          <span className="text-xl">Edit product</span>
        </Button>
      </div>
    </div>
  );
}
