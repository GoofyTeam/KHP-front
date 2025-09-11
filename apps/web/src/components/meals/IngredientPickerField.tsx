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

import { getAllMeasurementUnitsOnlyValues } from "@/lib/mesurmentsUnit";

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
};

// Le formulaire parent DOIT avoir items: MenuItemForm[]
export type HasItemsForm = { items: MenuItemForm[] };

type Props<TForm extends HasItemsForm> = {
  form: UseFormReturn<TForm>;
  label?: string;
};

export function IngredientPickerField<TForm extends HasItemsForm>({
  form,
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

  // ------- SEARCH contrôlé --------
  const [query, setQuery] = React.useState("");
  const debounced = useDebounce(query, 250);

  const [runSearch, { data, loading }] = useLazyQuery<SearchIngredientsQuery>(
    SearchIngredientsDocument,
    { fetchPolicy: "network-only" }
  );

  React.useEffect(() => {
    if (!debounced.trim()) return;
    // adapte les variables à ta query (ici: { search, limit })
    runSearch({ variables: { searchTerm: debounced.trim(), limit: 10 } });
  }, [debounced, runSearch]);

  // map API -> résultats UI
  const results: IngredientSearchResult[] = (data?.searchInStock ?? []).map(
    (n) => ({
      id: n.id,
      name: n.name,
      imageUrl: n.__typename === "Ingredient" ? n.image_url : null,
      kind: n.__typename === "Ingredient" ? "ingredient" : "preparation",
      unit: n.unit, // adapte si nécessaire
      defaultLocationId: null, // mappe si dispo
      locations: n.quantities.map((q) => ({
        id: q.location.id,
        name: q.location.name,
        quantityInLocation: q.quantity,
      })),
    })
  );

  // map RHF -> UI items
  const uiItems: PickedItem[] = typedFields.map((f) => ({
    id: f.entity_id,
    name: (f as any).name ?? "",
    imageUrl: (f as any).imageUrl,
    kind: f.entity_type,
    unit: f.unit,
    quantity: f.quantity,
    locationId: f.location_id,
    locations: (f as any).locations ?? [],
  }));

  // ------- handlers ----------
  const onAdd = (p: PickedItem) => {
    const idx = typedFields.findIndex((x) => x.entity_id === p.id);
    if (idx > -1) {
      update(idx, {
        ...typedFields[idx],
        quantity: typedFields[idx].quantity + 1,
      } as any);
    } else {
      append({
        entity_id: p.id,
        entity_type: p.kind,
        quantity: p.quantity,
        unit: p.unit,
        location_id: p.locationId || "",
        // confort d’affichage
        name: p.name,
        imageUrl: p.imageUrl ?? null,
        locations: p.locations || [],
      } as any);
    }
    setQuery(""); // reset input
  };

  const onRemove = (id: string) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1) remove(idx);
  };

  const onChangeQuantity = (id: string, qty: number) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1) update(idx, { ...typedFields[idx], quantity: qty } as any);
  };

  const onChangeLocation = (id: string, locationId: string) => {
    const idx = typedFields.findIndex((x) => x.entity_id === id);
    if (idx > -1)
      update(idx, { ...typedFields[idx], location_id: locationId } as any);
  };

  return (
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
      className="w-full"
      unitsSelections={getAllMeasurementUnitsOnlyValues()}
    />
  );
}
