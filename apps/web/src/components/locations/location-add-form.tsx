"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { createLocationAction } from "@/app/(mainapp)/settings/location/actions";
import { LocationTypeSelector } from "./location-type-selector";
import { GetLocationsDocument } from "@/graphql/generated/graphql";

type LocationFormValues = {
  name: string;
  location_type_id: string;
};

interface LocationAddFormProps {
  onLocationAdded?: () => void;
}

export function LocationAddForm({ onLocationAdded }: LocationAddFormProps) {
  const [saved, setSaved] = useState(false);
  const apolloClient = useApolloClient();

  const form = useForm<LocationFormValues>({
    defaultValues: {
      name: "",
      location_type_id: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values: LocationFormValues) => {
    try {
      setSaved(false);
      form.clearErrors();

      if (!values.location_type_id) {
        form.setError("location_type_id", {
          message: "Please select a location type.",
        });
        return;
      }

      const payload = {
        name: values.name,
        location_type_id: parseInt(values.location_type_id),
      };

      const result = await createLocationAction(payload);

      if (result.success) {
        setSaved(true);
        form.reset();

        // Refetch la query GraphQL pour mettre à jour le cache Apollo
        await apolloClient.refetchQueries({
          include: [GetLocationsDocument],
        });

        onLocationAdded?.();
        setTimeout(() => setSaved(false), 3000);
      } else {
        form.setError("root", {
          message: result.error || "Unable to create location",
        });
      }
    } catch (error) {
      console.error("Error creating location:", error);
      form.setError("root", {
        message: "Unable to create location. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-5">
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
            disabled={form.formState.isSubmitting}
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
          rules={{ required: "Please select a location type" }}
          render={({ field }) => (
            <LocationTypeSelector
              value={field.value}
              onValueChange={field.onChange}
              disabled={form.formState.isSubmitting}
            />
          )}
        />
        {form.formState.errors.location_type_id && (
          <p className="text-red-500 text-sm mt-1 font-medium">
            {form.formState.errors.location_type_id.message}
          </p>
        )}

        <div className="pt-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-semibold">
                Location created successfully
              </span>
            </div>
          ) : form.formState.errors.root ? (
            <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              {form.formState.errors.root.message}
            </div>
          ) : (
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              variant="khp-default"
              className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {form.formState.isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2Icon className="animate-spin h-4 w-4" />
                  Creating location...
                </div>
              ) : (
                "Create Location"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
