import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { Button } from "@workspace/ui/components/button";
import { registerLossesSchema } from "./registerLossesSchema";
import { registerLossesSubmit } from "./register-losses";
import { WantedDataType } from "../../../lib/handleScanType";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { extractApiErrorMessage } from "../../../lib/error-utils";

function RegisterLosses() {
  const navigate = useNavigate();
  const { internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type, status } = useLoaderData({
    from: "/_protected/handle-item",
  }) as {
    product: WantedDataType | null;
    type: z.infer<typeof registerLossesSchema>["type"];
    status?: "ok" | "missing-offline";
  };

  if (!product || status === "missing-offline") {
    return (
      <div className="flex min-h-[75svh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Impossible d'enregistrer une perte hors connexion pour ce produit.
          Ouvre-le en ligne au moins une fois pour le synchroniser.
        </p>
        <Button
          variant="khp-default"
          onClick={() =>
            navigate({
              to: "/inventory",
              replace: true,
            })
          }
        >
          Retour à l'inventaire
        </Button>
      </div>
    );
  }

  const typedType = type as z.infer<typeof registerLossesSchema>["type"];

  const form = useForm<
    z.infer<typeof registerLossesSchema>,
    undefined,
    z.infer<typeof registerLossesSchema>
  >({
    resolver: zodResolver(registerLossesSchema),
    defaultValues: {
      type: typedType,
      product_id: product.product_internal_id || internalId || "",
      location_id: "",
      quantity: "",
      lossableType: "ingredient",
      reason: "",
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  const getTotalQuantity = (product: WantedDataType) => {
    if (!product.quantities) return 0;
    return product.quantities.reduce(
      (total, qty) => total + (qty.quantity || 0),
      0
    );
  };

  if (!product.quantities || getTotalQuantity(product) <= 0) {
    // Rediriger vers la page produit si aucune quantité n'est disponible
    const productId = product.product_internal_id || internalId;
    if (productId) {
      navigate({
        to: "/products/$id",
        params: { id: productId },
        replace: true,
      });
    } else {
      navigate({
        to: "/inventory",
        replace: true,
      });
    }
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75svh] my-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async (values: z.infer<typeof registerLossesSchema>) => {
            setServerError(null);
            try {
              await registerLossesSubmit(values);
            } catch (err) {
              setServerError(extractApiErrorMessage(err));
            }
          })}
          className="space-y-4 flex flex-col items-center px-4 w-full max-w-md"
        >
          <img
            src={
              product?.product_image ||
              "https://via.placeholder.com/150?text=No+Image"
            }
            alt={product.product_name}
            className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
          />

          <div className="w-full">
            <h2 className="text-2xl font-semibold text-center">
              {product.product_name || "Unnamed Product"}
            </h2>
            <p className="text-center text-gray-600">
              Category: {product.product_category.name || "Uncategorized"}
            </p>
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <LocationSelect
                  quantities={product.quantities || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select location"
                  label="Locations"
                  unit={product.product_units || ""}
                  hideEmptyLocations={true}
                  showAllOption={false}
                  allOptionLabel="All locations"
                  displayAllQuantity={true}
                />
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <QuantityInput
                      title="Quantity lost"
                      value={field.value}
                      onChange={field.onChange}
                      unit={product.product_units || ""}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Reason for loss</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {serverError && (
            <div
              role="alert"
              className="w-full max-w-md mx-auto mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <div className="flex flex-col w-full gap-x-2 my-4 gap-y-1">
            <Button
              type="submit"
              className="w-full"
              variant="khp-destructive"
              disabled={
                form.formState.isSubmitting ||
                (!form.formState.dirtyFields.location_id &&
                  !form.formState.dirtyFields.quantity &&
                  !form.formState.dirtyFields.reason)
              }
            >
              Register the loss
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xl"
              className={cn("w-full", "border-khp-primary")}
              onClick={() =>
                navigate({
                  to: "/inventory",
                })
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default RegisterLosses;
