"use client";

import * as React from "react";
import { AddStockTable, AddStockTableHandle } from "@/components/AddStockTable";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import {
  createIngredientUploadAction,
  findIngredientByNameAction,
  addQuantitiesToIngredientAction,
} from "./action";
import { useRouter } from "next/navigation";

export default function AddStockPage() {
  const router = useRouter();
  const tableRef = React.useRef<AddStockTableHandle>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSave = async () => {
    if (!tableRef.current) return;

    const ingredients = tableRef.current.getFormDataPayload();

    if (!ingredients.length) {
      toast.error("Nothing to save.");
      return;
    }

    setLoading(true);

    try {
      for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        const fd = new FormData();
        fd.append("name", ing.name);
        fd.append("unit", ing.unit);
        fd.append("base_unit", ing.base_unit);
        fd.append("category_id", String(ing.category_id));
        fd.append("base_quantity", String(ing.base_quantity));
        if (ing.image) {
          fd.append("image", ing.image, ing.image.name);
        }
        ing.quantities.forEach((q, j) => {
          fd.append(`quantities[${j}][location_id]`, String(q.location_id));
          fd.append(`quantities[${j}][quantity]`, String(q.quantity));
        });

        const res = await createIngredientUploadAction(fd);
        if (!res.success) {
          if (
            res.error &&
            /unique/i.test(res.error) &&
            /name/i.test(res.error)
          ) {
            const found = await findIngredientByNameAction(ing.name);
            const id = found.success ? found.data?.id : undefined;
            if (id) {
              const addRes = await addQuantitiesToIngredientAction(
                id,
                ing.quantities,
              );
              if (!addRes.success)
                throw new Error(addRes.error || "Failed to add quantities");
              continue;
            }
          }
          throw new Error(res.error || "Unknown error");
        }
      }

      tableRef.current.clear();
      toast.success("Stock successfully saved!");
      router.push("/stocks");
    } catch (e: unknown) {
      console.error("[stocks/add] error ->", e);
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold">Add Stock</h1>
        <Button onClick={handleSave} variant="khp-default" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      <AddStockTable ref={tableRef} />
    </div>
  );
}
