"use client";

import { useState } from "react";
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
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
import { createLocationTypeAction } from "@/app/(mainapp)/settings/location-types/actions";
import { GetLocationTypesDocument } from "@/graphql/generated/graphql";

type LocationTypeFormValues = {
  name: string;
};

interface LocationTypeAddFormProps {
  onLocationTypeAdded?: () => void;
}

export function LocationTypeAddForm({
  onLocationTypeAdded,
}: LocationTypeAddFormProps) {
  const [saved, setSaved] = useState(false);
  const apolloClient = useApolloClient();

  const form = useForm<LocationTypeFormValues>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values: LocationTypeFormValues) => {
    try {
      setSaved(false);
      form.clearErrors();

      const result = await createLocationTypeAction(values);

      if (result.success) {
        setSaved(true);
        form.reset();

        await apolloClient.refetchQueries({
          include: [GetLocationTypesDocument],
        });

        onLocationTypeAdded?.();
        setTimeout(() => setSaved(false), 3000);
      } else {
        form.setError("root", {
          message: result.error || "Unable to create location type",
        });
      }
    } catch (error) {
      console.error("Error creating location type:", error);
      form.setError("root", {
        message: "Unable to create location type. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
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

          <div className="pt-4">
            {saved ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Location type created successfully
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
                    Creating location type...
                  </div>
                ) : (
                  "Create Location Type"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
