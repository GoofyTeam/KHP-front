"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { updateLocationAction } from "@/app/(mainapp)/settings/location/actions";
import { LocationTypeSelector } from "./location-type-selector";
import type { Location } from "@/graphql/generated/graphql";
import { GetLocationsDocument } from "@/graphql/generated/graphql";

type LocationFormValues = {
  name: string;
  location_type_id: string;
};

interface LocationEditFormProps {
  location: Location;
  onLocationUpdated?: () => void;
  onCancel?: () => void;
}

export function
  LocationEditForm({
    location,
    
  onLocationUpdated,
  onCancel,
}: LocationEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const apolloClient = useApolloClient();

  const form = useForm<LocationFormValues>({
    defaultValues: {
      name: location.name,
      location_type_id: location.locationType?.id || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: location.name,
      location_type_id: location.locationType?.id || "",
    });
  }, [location, form]);

  const onSubmit = (values: LocationFormValues) => {
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    startTransition(async () => {
      try {
        const payload = {
          name: values.name,
          ...(values.location_type_id && {
            location_type_id: parseInt(values.location_type_id),
          }),
        };
        const result = await updateLocationAction(location.id, payload);
        if (result?.success) {
          setSaved(true);

          // Refetch la query GraphQL pour mettre à jour le cache Apollo
          await apolloClient.refetchQueries({
            include: [GetLocationsDocument],
          });

          onLocationUpdated?.();
          setTimeout(() => setSaved(false), 3000);
        } else {
          setSaveError(result?.error || "Unknown error occurred");
        }
      } catch (error) {
        console.error("Error updating location:", error);
        setSaveError("Unable to update location. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-khp-background-secondary rounded-lg">
        <p className="text-khp-text-secondary text-sm mb-1">
          Editing:{" "}
          <span className="font-medium text-khp-text-primary">
            {location.name}
          </span>
        </p>
        <p className="text-khp-text-secondary text-xs">ID: {location.id}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-semibold text-khp-text-primary"
          >
            Location Name
          </Label>
          <Input
            id="name"
            type="text"
            disabled={isLoading || isPending}
            className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
            placeholder="Enter location name"
            {...form.register("name", {
              required: "Location name is required",
              minLength: {
                value: 2,
                message: "Location name must be at least 2 characters",
              },
            })}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1 font-medium">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <Controller
          name="location_type_id"
          control={form.control}
          render={({ field }) => (
            <LocationTypeSelector
              value={field.value}
              onValueChange={field.onChange}
              disabled={isLoading || isPending}
            />
          )}
        />
        {form.formState.errors.location_type_id && (
          <p className="text-red-500 text-sm mt-1 font-medium">
            {form.formState.errors.location_type_id.message}
          </p>
        )}

        <div className="pt-6">
          {saved ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-semibold">
                Location updated successfully
              </span>
            </div>
          ) : saveError ? (
            <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              {saveError}
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading || isPending}
                variant="khp-default"
                className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isLoading || isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="animate-spin h-4 w-4" />
                    Updating location...
                  </div>
                ) : (
                  "Update Location"
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="w-full h-10 text-sm font-medium rounded-lg border-khp-border hover:bg-khp-background-secondary"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
