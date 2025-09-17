"use client";

import * as React from "react";
import {
  useFieldArray,
  type FieldArrayPath,
  type FieldArrayWithId,
  type UseFormReturn,
} from "react-hook-form";
import { useLazyQuery } from "@apollo/client";
import { useDebounce } from "@uidotdev/usehooks";

import {
  IngredientPickerUI,
  type IngredientSearchResult,
  type PickedItem,
} from "@workspace/ui/components/ingredient-picker";

import {
  SearchIngredientsDocument,
  type SearchIngredientsQuery,
} from "@/graphql/generated/graphql";

import { getAllMeasurementUnitsOnlyValues } from "@/lib/mesurmentsUnit";

export type PreparationEntityForm = {
  id: string;
  type: "ingredient" | "preparation";
  quantity: number;
  unit: string;
  location_id: string;
  // UI-only metadata kept in form state for display convenience
  name?: string;
  imageUrl?: string | null;
  locations?: PickedItem["locations"];
  storage_unit?: string;
};

export type HasEntitiesForm = { entities: PreparationEntityForm[] };

type Props<TForm extends HasEntitiesForm> = {
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

export function PreparationEntitiesField<TForm extends HasEntitiesForm>({
  form,
  hasErrors,
  label = "Ingredients & Preparations",
}: Props<TForm>) {
  const entitiesName = "entities" as FieldArrayPath<TForm>;

  const { fields, append, remove, update } = useFieldArray<
    TForm,
    FieldArrayPath<TForm>,
    "key"
  >({
    control: form.control,
    name: entitiesName,
    keyName: "key",
  });

  type EntitiesField = FieldArrayWithId<
    { entities: PreparationEntityForm[] },
    "entities",
    "key"
  >;
  const typedFields = fields as unknown as EntitiesField[];
  const appendEntity = append as unknown as (value: PreparationEntityForm) => void;
  const updateEntity = update as unknown as (
    index: number,
    value: PreparationEntityForm
  ) => void;

  const [query, setQuery] = React.useState("");
  const debounced = useDebounce(query, 250);

  const [runSearch, { data, loading }] = useLazyQuery<SearchIngredientsQuery>(
    SearchIngredientsDocument,
    { fetchPolicy: "network-only" }
  );

  React.useEffect(() => {
    if (!debounced.trim()) return;
    runSearch({ variables: { searchTerm: debounced.trim() } });
  }, [debounced, runSearch]);

  const results: IngredientSearchResult[] = (data?.searchInStock ?? []).map(
    (node) => ({
      id: node.id,
      name: node.name,
      imageUrl: node.__typename === "Ingredient" ? node.image_url : null,
      kind: node.__typename === "Ingredient" ? "ingredient" : "preparation",
      unit: node.unit,
      storageUnit: node.unit,
      defaultLocationId: null,
      locations: node.quantities.map((quantity) => ({
        id: quantity.location.id,
        name: quantity.location.name,
        quantityInLocation: quantity.quantity,
      })),
    })
  );

  const uiItems: PickedItem[] = typedFields.map((field) => ({
    id: field.id,
    name: field.name ?? "",
    imageUrl: field.imageUrl ?? null,
    kind: field.type,
    unit: field.unit,
    storageUnit: field.storage_unit || field.unit,
    quantity: field.quantity,
    locationId: field.location_id,
    locations: field.locations ?? [],
  }));

  const onAdd = (item: PickedItem) => {
    const existingIndex = typedFields.findIndex((field) => field.id === item.id);

    if (existingIndex > -1) {
      updateEntity(existingIndex, {
        ...typedFields[existingIndex],
        quantity: typedFields[existingIndex].quantity + 1,
      });
    } else {
      appendEntity({
        id: item.id,
        type: item.kind,
        quantity: item.quantity,
        unit: item.unit,
        storage_unit: item.storageUnit,
        location_id: item.locationId || "",
        name: item.name,
        imageUrl: item.imageUrl ?? null,
        locations: item.locations || [],
      });
    }

    setQuery("");
  };

  const onRemove = (id: string) => {
    const index = typedFields.findIndex((field) => field.id === id);
    if (index > -1) remove(index);
  };

  const onChangeQuantity = (id: string, quantity: number) => {
    const index = typedFields.findIndex((field) => field.id === id);
    if (index > -1)
      updateEntity(index, { ...typedFields[index], quantity });
  };

  const onChangeLocation = (id: string, locationId: string) => {
    const index = typedFields.findIndex((field) => field.id === id);
    if (index > -1)
      updateEntity(index, { ...typedFields[index], location_id: locationId });
  };

  const onChangeUnit = (id: string, unit: string) => {
    const index = typedFields.findIndex((field) => field.id === id);
    if (index > -1) updateEntity(index, { ...typedFields[index], unit });
  };

  const unitsSelections = React.useMemo(
    getAllMeasurementUnitsOnlyValues,
    []
  );

  return (
    <div className="flex flex-col w-full">
      {hasErrors && (
        <div className="w-full text-red-500 text-sm mt-1 text-center font-semibold">
          {(() => {
            const errorObject = Array.isArray(hasErrors) ? undefined : hasErrors;
            const rootMessage =
              (typeof errorObject?.message === "string" &&
                errorObject.message) ||
              (typeof errorObject?.root?.message === "string" &&
                errorObject.root.message);

            if (rootMessage) return rootMessage;

            if (Array.isArray(hasErrors)) {
              const messages: string[] = [];
              for (const entry of hasErrors) {
                const quantityMessage = entry?.quantity?.message as
                  | string
                  | undefined;
                const locationMessage = entry?.location_id?.message as
                  | string
                  | undefined;
                if (quantityMessage) messages.push(quantityMessage);
                if (locationMessage) messages.push(locationMessage);
              }
              if (messages.length > 0) return messages.join(" • ");
            }

            return "Please check the selected items.";
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
