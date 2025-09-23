// app/(menus)/components/IngredientPickerField.tsx
"use client";

import * as React from "react";
import {
  useFieldArray,
  type UseFormReturn,
  type FieldArrayPath,
  type FieldArrayWithId,
} from "react-hook-form";
import { useLazyQuery } from "@apollo/client";
import { useDebounce } from "@uidotdev/usehooks";

import {
  IngredientPickerUI,
  type PickedItem,
  type IngredientSearchResult,
} from "@workspace/ui/components/ingredient-picker";

import {
  SearchIngredientsDocument,
  type SearchIngredientsQuery,
} from "@/graphql/generated/graphql";

import { getAllMeasurementUnitsOnlyValues } from "@workspace/ui/lib/measurement-units";

// Shape des items gérés par le field-array
export type MenuItemForm = {
  entity_id: string;
  entity_type: "ingredient" | "preparation";
  quantity: number;
  unit: string;
  location_id: string;
  // champs UI optionnels (non envoyés à l’API)
  name?: string;
  imageUrl?: string | null;
  locations?: PickedItem["locations"];
  // unité de stockage fixe de l’entité (UI uniquement)
  storage_unit?: string;
};

// Le formulaire parent DOIT avoir items: MenuItemForm[]
export type HasItemsForm = { items: MenuItemForm[] };

type Props<TForm extends HasItemsForm> = {
  form: UseFormReturn<TForm>;
  hasErrors?:
    | {
        message?: string;
        root?: { message?: string };
      }
    | Array<{
        quantity?: { message?: string };
        location_id?: { message?: string };
      }>;
  label?: string;
};

export function IngredientPickerField<TForm extends HasItemsForm>({
  form,
  hasErrors,
  label = "Ingredients",
}: Props<TForm>) {
  // IMPORTANT : garder le nom LITTÉRAL "items" et le typer en FieldArrayPath<TForm>
  const itemsName = "items" as FieldArrayPath<TForm>;

  const { fields, append, remove, update } = useFieldArray<
    TForm,
    FieldArrayPath<TForm>,
    "key"
  >({
    control: form.control,
    name: itemsName,
    keyName: "key",
  });

  // ----- (petit alias typé des fields) -----
  type ItemsField = FieldArrayWithId<{ items: MenuItemForm[] }, "items", "key">;
  const typedFields = fields as unknown as ItemsField[];
  const appendItem = append as unknown as (value: MenuItemForm) => void;
  const updateItem = update as unknown as (
    index: number,
    value: MenuItemForm,
  ) => void;

  // ------- SEARCH contrôlé --------
  const [query, setQuery] = React.useState("");
  const debounced = useDebounce(query, 250);

  const [runSearch, { data, loading }] = useLazyQuery<SearchIngredientsQuery>(
    SearchIngredientsDocument,
    { fetchPolicy: "network-only" },
  );

  React.useEffect(() => {
    if (!debounced.trim()) return;
    // adapte les variables à ta query (ici: { search, limit })
    runSearch({ variables: { searchTerm: debounced.trim() } });
  }, [debounced, runSearch]);

  // map API -> résultats UI
  const results: IngredientSearchResult[] = (data?.searchInStock ?? []).map(
    (n) => ({
      id: n.id,
      name: n.name,
      imageUrl: n.__typename === "Ingredient" ? n.image_url : null,
      kind: n.__typename === "Ingredient" ? "ingredient" : "preparation",
      unit: n.unit, // unité par défaut côté recette
      storageUnit: n.unit, // unité de stockage de l’ingrédient/préparation
      defaultLocationId: null, // mappe si dispo
      locations: n.quantities.map((q) => ({
        id: q.location.id,
        name: q.location.name,
        quantityInLocation: q.quantity,
      })),
    }),
  );

  // map RHF -> UI items
  const uiItems: PickedItem[] = typedFields.map((f) => ({
    id: f.entity_id,
    name: f.name ?? "",
    imageUrl: f.imageUrl ?? null,
    kind: f.entity_type,
    unit: f.unit,
    storageUnit: f.storage_unit || f.unit,
    quantity: f.quantity,
    locationId: f.location_id,
    locations: f.locations ?? [],
  }));

  // ------- handlers ----------
  const onAdd = (p: PickedItem) => {
    const idx = typedFields.findIndex((x) => x.entity_id === p.id);
    if (idx > -1) {
      updateItem(idx, {
        ...typedFields[idx],
        quantity: typedFields[idx].quantity + 1,
      });
    } else {
      appendItem({
        entity_id: p.id,
        entity_type: p.kind,
        quantity: p.quantity,
        unit: p.unit,
        storage_unit: p.storageUnit,
        location_id: p.locationId || "",
        // confort d’affichage
        name: p.name,
        imageUrl: p.imageUrl ?? null,
        locations: p.locations || [],
      });
    }
    setQuery(""); // reset input
  };

  const onRemove = (id: string) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1) remove(idx);
  };

  const onChangeQuantity = (id: string, qty: number) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1) updateItem(idx, { ...typedFields[idx], quantity: qty });
  };

  const onChangeLocation = (id: string, locationId: string) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1)
      updateItem(idx, { ...typedFields[idx], location_id: locationId });
  };

  const onChangeUnit = (id: string, unit: string) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1) updateItem(idx, { ...typedFields[idx], unit });
  };

  // Memoize static measurement units to avoid recalculation on each render
  const unitsSelections = React.useMemo(getAllMeasurementUnitsOnlyValues, []);

  return (
    <div className="flex flex-col w-full">
      {hasErrors && (
        <div className="w-full text-red-500 text-sm mt-1 text-center font-semibold">
          {(() => {
            // Support both array-level and per-item error shapes from RHF/Zod
            const errObj = Array.isArray(hasErrors) ? undefined : hasErrors;
            const rootMsg =
              (typeof errObj?.message === "string" && errObj.message) ||
              (typeof errObj?.root?.message === "string" &&
                errObj.root.message);

            if (rootMsg) return rootMsg;

            // Aggregate a few per-item messages if present
            if (Array.isArray(hasErrors)) {
              const msgs: string[] = [];
              for (const err of hasErrors) {
                const q = err?.quantity?.message as string | undefined;
                const l = err?.location_id?.message as string | undefined;
                if (q) msgs.push(q);
                if (l) msgs.push(l);
              }
              if (msgs.length > 0) return msgs.join(" • ");
            }

            return "Please check the selected ingredients.";
          })()}
        </div>
      )}
      <IngredientPickerUI
        label={label}
        query={query}
        onQueryChange={setQuery}
        results={results}
        loading={loading}
        items={uiItems}
        onAdd={onAdd}
        onRemove={onRemove}
        onChangeQuantity={onChangeQuantity}
        onChangeLocation={onChangeLocation}
        onChangeUnit={onChangeUnit}
        className="w-full"
        unitsSelections={unitsSelections}
      />
    </div>
  );
}
