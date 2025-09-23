"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { CheckCircleIcon, Loader2Icon, Shield } from "lucide-react";
import { updateLocationTypeAction } from "@/app/(mainapp)/settings/location-types/actions";
import type { LocationType } from "@workspace/graphql";
import { GetLocationTypesDocument } from "@workspace/graphql";

type LocationTypeFormValues = {
  name: string;
};

interface LocationTypeEditFormProps {
  locationType: LocationType;
  onLocationTypeUpdated?: () => void;
  onCancel?: () => void;
}

export function LocationTypeEditForm({
  locationType,
  onLocationTypeUpdated,
  onCancel,
}: LocationTypeEditFormProps) {
  const [saved, setSaved] = useState(false);
  const apolloClient = useApolloClient();

  const form = useForm<LocationTypeFormValues>({
    defaultValues: {
      name: locationType.name,
    },
  });

  useEffect(() => {
    form.reset({
      name: locationType.name,
    });
  }, [locationType, form]);

  const onSubmit = form.handleSubmit(async (values: LocationTypeFormValues) => {
    try {
      setSaved(false);
      form.clearErrors();

      const result = await updateLocationTypeAction(locationType.id, values);

      if (result?.success) {
        setSaved(true);

        await apolloClient.refetchQueries({
          include: [GetLocationTypesDocument],
        });

        onLocationTypeUpdated?.();
        setTimeout(() => setSaved(false), 3000);
      } else {
        form.setError("root", {
          message: result?.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error updating location type:", error);
      form.setError("root", {
        message: "Unable to update location type. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-khp-background-secondary rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-khp-text-secondary text-sm">
            Editing:{" "}
            <span className="font-medium text-khp-text-primary">
              {locationType.name}
            </span>
          </p>
          {locationType.is_default && (
            <div className="flex items-center gap-1 text-khp-primary">
              <Shield className="h-3 w-3" />
              <span className="text-xs font-medium">Default</span>
            </div>
          )}
        </div>
        <p className="text-khp-text-secondary text-xs">ID: {locationType.id}</p>
        {locationType.is_default && (
          <p className="text-khp-text-secondary text-xs mt-1">
            ⚠️ This is a default location type and cannot be deleted
          </p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            rules={{
              required: "Location type name is required",
              minLength: {
                value: 2,
                message: "Location type name must be at least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "Location type name must be less than 50 characters",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-khp-text-primary">
                  Location Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    disabled={form.formState.isSubmitting}
                    className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
                    placeholder="e.g. Freezer, Refrigerator, Storage Room"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-6">
            {saved ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Location type updated successfully
                </span>
              </div>
            ) : form.formState.errors.root ? (
              <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                {form.formState.errors.root.message}
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  variant="khp-default"
                  className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="animate-spin h-4 w-4" />
                      Updating location type...
                    </div>
                  ) : (
                    "Update Location Type"
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
      </Form>
    </div>
  );
}
