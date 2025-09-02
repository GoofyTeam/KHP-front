"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { createLocationAction } from "@/app/(mainapp)/settings/location/actions";
import { LocationTypeSelector } from "./location-type-selector";

type LocationFormValues = {
  name: string;
  location_type_id?: string;
};

interface LocationAddFormProps {
  onLocationAdded?: () => void;
}

export function LocationAddForm({ onLocationAdded }: LocationAddFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  const form = useForm<LocationFormValues>({
    defaultValues: {
      name: "",
      location_type_id: "",
    },
  });

  const onSubmit = (values: LocationFormValues) => {
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    startTransition(async () => {
      try {
        if (!selectedTypeId) {
          setSaveError("Please select a location type.");
          setIsLoading(false);
          return;
        }

        const payload = {
          name: values.name,
          location_type_id: parseInt(selectedTypeId),
        };
        const result = await createLocationAction(payload);
        if (result.success) {
          setSaved(true);
          form.reset();
          setSelectedTypeId("");
          onLocationAdded?.();
          setTimeout(() => setSaved(false), 3000);
        } else {
          setSaveError(result.error);
        }
      } catch (error) {
        console.error("Error creating location:", error);
        setSaveError("Unable to create location. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <div className="space-y-4">
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

        <LocationTypeSelector
          value={selectedTypeId}
          onValueChange={setSelectedTypeId}
          disabled={isLoading || isPending}
        />

        <div className="pt-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-semibold">
                Location created successfully
              </span>
            </div>
          ) : saveError ? (
            <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
              {saveError}
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isLoading || isPending}
              variant="khp-default"
              className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {isLoading || isPending ? (
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
