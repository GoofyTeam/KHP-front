"use client";

import * as React from "react";
import { useApolloClient } from "@apollo/client";
import { Package, Trash } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

import { IngredientSearch, IngredientSearchResult } from "../ingredient-search";
import { httpClient } from "../../lib/httpClient";

type AddQuantityRequest = {
  location_id: number;
  quantity: number;
  unit?: string;
};

const addIngredientQuantity = async (
  ingredientId: string,
  request: AddQuantityRequest
): Promise<{ success: boolean; error?: string }> => {
  const result = await httpClient.postWithResult(
    `/api/ingredients/${ingredientId}/add-quantity`,
    request
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
};

export type RestockTableRow = {
  ingredientId: string;
  locationId: string | null;
  quantity: number;
  unit: string | null | undefined;
};

export type RestockTableHandle = {
  getRows: () => RestockTableRow[];
  clear: () => void;
};

type RestockTableProps = {
  className?: string;
  onSubmit?: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
};

type SelectedIngredient = {
  id: string;
  name: string;
  imageUrl?: string | null;
  unit: string;
  locations: { id: string; name: string; quantityInLocation: number }[];
  quantities: { locationId: string; quantity: number }[];
};

export const RestockTable = React.forwardRef<
  RestockTableHandle,
  RestockTableProps
>(
  (
    { className, onSubmit, submitButtonText = "Restock", isSubmitting = false },
    ref
  ) => {
    const [selectedIngredients, setSelectedIngredients] = React.useState<
      SelectedIngredient[]
    >([]);
    const [isSubmittingLocal, setIsSubmittingLocal] = React.useState(false);
    const apolloClient = useApolloClient();

    const handleSelectIngredient = React.useCallback(
      (ingredient: IngredientSearchResult) => {
        if (selectedIngredients.find((item) => item.id === ingredient.id)) {
          return;
        }

        const locations =
          ingredient.quantities?.map((q: any) => ({
            id: q.location.id,
            name: q.location.name,
            quantityInLocation: q.quantity,
          })) || [];

        const newSelectedIngredient: SelectedIngredient = {
          id: ingredient.id,
          name: ingredient.name,
          imageUrl: ingredient.image_url,
          unit: ingredient.unit || "unit",
          locations,
          quantities: locations.map(
            (location: {
              id: string;
              name: string;
              quantityInLocation: number;
            }) => ({
              locationId: location.id,
              quantity: 0,
            })
          ),
        };

        setSelectedIngredients((prev) => [...prev, newSelectedIngredient]);
      },
      [selectedIngredients]
    );

    const handleRemoveIngredient = React.useCallback((ingredientId: string) => {
      setSelectedIngredients((prev) =>
        prev.filter((item) => item.id !== ingredientId)
      );
    }, []);

    const handleRemoveLocation = React.useCallback(
      (ingredientId: string, locationId: string) => {
        setSelectedIngredients(
          (prev) =>
            prev
              .map((ingredient) => {
                if (ingredient.id !== ingredientId) return ingredient;

                const updatedQuantities = ingredient.quantities.filter(
                  (q) => q.locationId !== locationId
                );

                if (updatedQuantities.length === 0) {
                  return null;
                }

                return {
                  ...ingredient,
                  quantities: updatedQuantities,
                };
              })
              .filter(Boolean) as SelectedIngredient[]
        );
      },
      []
    );

    const handleQuantityChange = React.useCallback(
      (ingredientId: string, locationId: string, quantity: number) => {
        setSelectedIngredients((prev) =>
          prev.map((ingredient) => {
            if (ingredient.id !== ingredientId) return ingredient;

            return {
              ...ingredient,
              quantities: ingredient.quantities.map((q) =>
                q.locationId === locationId ? { ...q, quantity } : q
              ),
            };
          })
        );
      },
      []
    );

    const handleSubmitQuantities = React.useCallback(async () => {
      try {
        setIsSubmittingLocal(true);
        const requests: Array<{
          ingredientId: string;
          request: AddQuantityRequest;
          ingredientName: string;
        }> = [];

        selectedIngredients.forEach((ingredient) => {
          ingredient.quantities.forEach((q) => {
            if (q.quantity > 0) {
              requests.push({
                ingredientId: ingredient.id,
                request: {
                  location_id: parseInt(q.locationId),
                  quantity: q.quantity,
                  unit: ingredient.unit,
                },
                ingredientName: ingredient.name,
              });
            }
          });
        });

        const results = await Promise.allSettled(
          requests.map(({ ingredientId, request }) =>
            addIngredientQuantity(ingredientId, request)
          )
        );

        const failures: string[] = [];
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            failures.push(
              `${requests[index].ingredientName}: ${result.reason}`
            );
          } else if (!result.value.success) {
            failures.push(
              `${requests[index].ingredientName}: ${result.value.error}`
            );
          }
        });

        if (failures.length > 0) {
          console.error("Some requests failed:", failures);
          console.warn(
            `❌ Certaines mises à jour ont échoué:\n${failures.join("\n")}`
          );
        } else {
          setSelectedIngredients([]);

          await apolloClient.resetStore();

          console.log("✅ All quantities updated successfully");
        }

        if (onSubmit) {
          onSubmit();
        }
      } catch (error) {
        console.error("❌ Error submitting quantities:", error);
        console.warn(
          "❌ Une erreur inattendue s'est produite lors de la mise à jour."
        );
      } finally {
        setIsSubmittingLocal(false);
      }
    }, [selectedIngredients, onSubmit, apolloClient]);

    React.useImperativeHandle(ref, () => ({
      getRows: () => {
        const rows: RestockTableRow[] = [];
        selectedIngredients.forEach((ingredient) => {
          ingredient.quantities.forEach((q) => {
            if (q.quantity > 0) {
              rows.push({
                ingredientId: ingredient.id,
                locationId: q.locationId,
                quantity: q.quantity,
                unit: ingredient.unit,
              });
            }
          });
        });
        return rows;
      },
      clear: () => {
        setSelectedIngredients([]);
      },
    }));

    return (
      <div className="w-full space-y-4">
        <div className="flex gap-4 items-center justify-between">
          <IngredientSearch
            onSelect={handleSelectIngredient}
            placeholder="Search ingredients..."
          />

          {selectedIngredients.some((ing) =>
            ing.quantities.some((q) => q.quantity > 0)
          ) && (
            <Button
              onClick={handleSubmitQuantities}
              disabled={
                isSubmittingLocal ||
                !selectedIngredients.some((ing) =>
                  ing.quantities.some((q) => q.quantity > 0)
                )
              }
              variant="khp-default"
              className="h-[48px] px-6 flex-shrink-0"
            >
              {isSubmittingLocal ? "Envoi en cours..." : submitButtonText}
            </Button>
          )}
        </div>

        {selectedIngredients.length > 0 && (
          <div className="relative rounded-lg border-2 border-khp-primary/30 overflow-x-hidden">
            <Table className="w-full table-fixed caption-bottom text-sm text-khp-text-secondary border-collapse">
              <TableHeader className="text-khp-text-primary h-16">
                <TableRow className="border-b border-khp-primary/30 bg-white">
                  <TableHead className="px-2 text-left bg-white w-[30%]">
                    Product name
                  </TableHead>
                  <TableHead className="px-2 text-left bg-white w-[25%]">
                    Location
                  </TableHead>
                  <TableHead className="px-2 text-left bg-white w-[20%]">
                    Current Stock
                  </TableHead>
                  <TableHead className="px-2 text-left bg-white w-[20%]">
                    Quantity to add
                  </TableHead>
                  <TableHead className="px-2 text-left bg-white w-[5%]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedIngredients.map((ingredient) => {
                  return ingredient.quantities.map((qty, qtyIndex) => {
                    const location = ingredient.locations.find(
                      (loc) => loc.id === qty.locationId
                    );

                    return (
                      <TableRow
                        key={`${ingredient.id}-${qty.locationId}`}
                        className="border-b border-khp-text-secondary/30 h-16 hover:bg-khp-primary/10"
                      >
                        <TableCell className="px-2 text-left w-[30%] whitespace-normal">
                          <div className="flex items-center space-x-3 w-full">
                            {ingredient.imageUrl ? (
                              <img
                                src={ingredient.imageUrl}
                                alt={ingredient.name}
                                className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div
                              className="font-medium truncate min-w-0 flex-1"
                              title={ingredient.name}
                            >
                              {ingredient.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 text-left w-[25%] whitespace-normal">
                          <span
                            className="text-sm font-medium truncate"
                            title={location?.name || "Unknown location"}
                          >
                            {location?.name || "Unknown location"}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 text-left w-[20%]">
                          <span className="font-medium">
                            {location?.quantityInLocation.toFixed(1) || "0"}{" "}
                            {ingredient.unit}
                          </span>
                        </TableCell>
                        <TableCell className="px-2 text-left w-[20%]">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={qty.quantity}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleQuantityChange(
                                ingredient.id,
                                qty.locationId,
                                value
                              );
                            }}
                            className="w-full max-w-[120px]"
                            placeholder={`0 ${ingredient.unit}`}
                          />
                        </TableCell>
                        <TableCell className="px-2 text-left w-[5%]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleRemoveLocation(
                                ingredient.id,
                                qty.locationId
                              )
                            }
                          >
                            <Trash className="h-4 w-4 text-khp-primary" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {selectedIngredients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No ingredients selected</p>
            <p className="text-sm">
              Use the search bar above to add ingredients to restock
            </p>
          </div>
        )}
      </div>
    );
  }
);

RestockTable.displayName = "RestockTable";
