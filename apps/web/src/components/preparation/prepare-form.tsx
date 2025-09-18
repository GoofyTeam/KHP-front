"use client";

import { useCallback, useMemo, useEffect } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  GetLocationsDocument,
  GetPreparationByIdQuery,
} from "@/graphql/generated/graphql";
import { Input } from "@workspace/ui/components/input";
import { LoadMoreSelect } from "@workspace/ui/components/load-more-select";
import { NetworkStatus, useQuery } from "@apollo/client";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";
import {
  IngredientPickerField,
  type MenuItemForm,
} from "@/components/meals/IngredientPickerField";
import { preparePreparationAction } from "@/app/(mainapp)/preparations/[id]/prepare/action";

const overrideItemSchema: z.ZodType<MenuItemForm> = z
  .object({
    entity_id: z.string().nonempty("Item ID is required"),
    entity_type: z.enum(["ingredient", "preparation"]),
    quantity: z
      .number({ invalid_type_error: "Quantity must be a number" })
      .min(0, "Quantity must be at least 0"),
    unit: z.string().nonempty("Unit is required"),
    location_id: z.string(),
    storage_unit: z.string().optional(),
    name: z.string().optional(),
    imageUrl: z.string().nullable().optional(),
    locations: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          quantityInLocation: z.number(),
        })
      )
      .optional(),
  })
  .passthrough();

const prepareSchema = z.object({
  id: z.string().nonempty("Preparation ID is required"),
  quantity: z.string().refine((val) => {
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, "Quantity must be a positive number"),
  location_id: z.string().nonempty("Location ID is required"),
  items: z.array(overrideItemSchema),
});

type PrepareFormValues = z.infer<typeof prepareSchema>;

const LOCATIONS_PAGE_SIZE = 20;

function PreparePreparationForm({
  id,
  preparation_data,
}: {
  id: string;
  preparation_data: GetPreparationByIdQuery["preparation"];
}) {
  const router = useRouter();

  const baseItems = useMemo<MenuItemForm[]>(() => {
    const entities = preparation_data?.entities;
    if (!entities) {
      return [];
    }

    return entities.map((entity) => {
      const entityData = entity.entity;
      const isIngredient = entityData.__typename === "Ingredient";

      const availableLocations = entityData.quantities?.map((quantity) => ({
        id: quantity.location.id,
        name: quantity.location.name,
        quantityInLocation: quantity.quantity,
      }));

      return {
        entity_id: entityData.id,
        entity_type: isIngredient ? "ingredient" : "preparation",
        quantity: entity.quantity,
        unit: entity.unit,
        storage_unit: entityData.unit,
        location_id: entity.location?.id ?? "",
        name: entityData.name,
        imageUrl: entityData.image_url ?? null,
        locations: availableLocations,
      } satisfies MenuItemForm;
    });
  }, [preparation_data]);

  const baseItemsMap = useMemo(() => {
    const entries = new Map<string, MenuItemForm>();
    for (const item of baseItems) {
      entries.set(item.entity_id, item);
    }
    return entries;
  }, [baseItems]);

  const { data, loading, fetchMore, networkStatus } = useQuery(
    GetLocationsDocument,
    {
      variables: {
        first: LOCATIONS_PAGE_SIZE,
        page: 1,
      },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    }
  );

  const locationsData = data?.locations?.data;
  const locationsOptions = useMemo(() => {
    if (!locationsData) {
      return [];
    }

    return locationsData.map((location) => ({
      value: location.id,
      label: location.name,
      description: location.locationType?.name,
    }));
  }, [locationsData]);

  const paginatorInfo = data?.locations?.paginatorInfo;
  const hasMoreLocations = paginatorInfo?.hasMorePages ?? false;
  const currentLocationPage = paginatorInfo?.currentPage ?? 1;
  const isFetchingMoreLocations = networkStatus === NetworkStatus.fetchMore;
  const isLocationsLoading = loading || isFetchingMoreLocations;

  const handleLoadMoreLocations = useCallback(() => {
    if (!hasMoreLocations || isFetchingMoreLocations) {
      return;
    }

    const nextPage = currentLocationPage + 1;

    fetchMore({
      variables: {
        first: LOCATIONS_PAGE_SIZE,
        page: nextPage,
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult?.locations) {
          return previous;
        }

        if (!previous?.locations) {
          return fetchMoreResult;
        }

        return {
          ...fetchMoreResult,
          locations: {
            ...fetchMoreResult.locations,
            data: [
              ...(previous.locations?.data ?? []),
              ...(fetchMoreResult.locations.data ?? []),
            ],
          },
        };
      },
    }).catch((error) => {
      console.error("Error loading more locations:", error);
    });
  }, [
    hasMoreLocations,
    isFetchingMoreLocations,
    currentLocationPage,
    fetchMore,
  ]);

  const form = useForm<PrepareFormValues>({
    resolver: zodResolver(prepareSchema),
    defaultValues: {
      id,
      quantity: "1",
      location_id: "",
      items: baseItems,
    },
  });

  useEffect(() => {
    form.reset({
      id,
      quantity: "1",
      location_id: "",
      items: baseItems,
    });
  }, [form, id, baseItems]);

  async function onSubmit(values: PrepareFormValues) {
    form.clearErrors("root");

    const overrides = values.items
      .map((item) => {
        const base = baseItemsMap.get(item.entity_id);

        const hasQuantityChange =
          typeof item.quantity === "number" &&
          (!base || item.quantity !== base.quantity);
        const hasLocationChange =
          Boolean(item.location_id) &&
          (!base || item.location_id !== base.location_id);

        if (!hasQuantityChange && !hasLocationChange) {
          return null;
        }

        const override: {
          id: string;
          type: "ingredient" | "preparation";
          quantity?: number;
          unit?: string;
          location_id?: string;
        } = {
          id: item.entity_id,
          type: item.entity_type,
        };

        if (hasQuantityChange) {
          override.quantity = item.quantity;
          override.unit = item.unit;
        }

        if (hasLocationChange) {
          override.location_id = item.location_id;
        }

        return override;
      })
      .filter(
        (override): override is NonNullable<typeof override> =>
          override !== null
      );

    const quantityNumber = Number(values.quantity);
    const locationNumber = Number(values.location_id);

    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      form.setError("root", {
        type: "validation",
        message: "Invalid quantity provided.",
      });
      return;
    }

    if (!Number.isFinite(locationNumber) || locationNumber <= 0) {
      form.setError("root", {
        type: "validation",
        message: "Please select a valid storage location.",
      });
      return;
    }

    try {
      const overridesPayload = overrides.map((override) => {
        const overrideId = Number(override.id);
        if (!Number.isFinite(overrideId)) {
          throw new Error("Invalid override identifier detected.");
        }

        let overrideLocation: number | undefined;
        if (override.location_id && override.location_id !== "") {
          const parsedLocation = Number(override.location_id);
          if (!Number.isFinite(parsedLocation)) {
            throw new Error("Invalid override location provided.");
          }
          overrideLocation = parsedLocation;
        }

        return {
          id: overrideId,
          type: override.type,
          quantity: override.quantity,
          unit: override.unit,
          location_id: overrideLocation,
        };
      });

      const res = await preparePreparationAction({
        id,
        quantity: quantityNumber,
        location_id: locationNumber,
        overrides: overridesPayload.length > 0 ? overridesPayload : undefined,
      });

      if (res.success) {
        router.push(`/preparations/${id}`);
        return;
      }

      const message = res.error?.trim()
        ? res.error
        : "An error occurred while preparing.";

      form.setError("root", {
        type: "server",
        message,
      });
    } catch (error) {
      const message =
        error instanceof Error && error.message !== ""
          ? error.message
          : "Unexpected error while preparing.";

      form.setError("root", {
        type: "server",
        message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {form.formState.errors.root?.message && (
          <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
            <div className="flex flex-col gap-1">
              {form.formState.errors.root.message
                .split("\n")
                .map((line, idx) => (
                  <p
                    key={idx}
                    className={`text-sm ${idx === 0 ? "font-semibold" : ""} text-khp-error`}
                  >
                    {line}
                  </p>
                ))}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prepared quantity</FormLabel>
              <div className="flex justify-start">
                <FormControl>
                  <Input
                    placeholder="Enter quantity to prepare"
                    variant="khp-default"
                    {...field}
                  />
                </FormControl>
                <p className="self-center font-semibold text-muted-foreground">
                  &nbsp;{preparation_data?.unit || "units"}
                </p>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage location</FormLabel>
              <LoadMoreSelect
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={(open) => {
                  if (!open) field.onBlur();
                }}
                triggerProps={{
                  ref: field.ref,
                  className: "w-full border-khp-primary",
                }}
                renderOption={(option) => (
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                  </div>
                )}
                options={locationsOptions}
                placeholder="Select a location"
                hasMore={hasMoreLocations}
                loading={isLocationsLoading}
                onLoadMore={handleLoadMoreLocations}
                emptyMessage="No locations found"
              />

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-3">
          <IngredientPickerField
            form={form}
            hasErrors={form.formState.errors.items}
            label="Override preparation base elements"
          />
          <Label className="text-sm text-muted-foreground">
            Override component quantities or source locations as needed.
          </Label>
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="khp-default"
            className="min-w-[160px]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Processing..." : "Prepare"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default PreparePreparationForm;
