"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CheckCircleIcon, Loader2Icon } from "lucide-react";
// TODO: Import create action when created
// import { createCategoryAction } from "@/app/(mainapp)/categories/actions";
import { GetCategoriesDocument } from "@/graphql/generated/graphql";

type CategoryFormValues = {
  name: string;
};

interface CategoryAddFormProps {
  onCategoryAdded?: () => void;
}

export function CategoryAddForm({ onCategoryAdded }: CategoryAddFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const apolloClient = useApolloClient();

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: CategoryFormValues) => {
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    startTransition(async () => {
      try {
        // TODO: Implement server action
        // const result = await createCategoryAction(values);
        // if (result.success) {
        //   setSaved(true);
        //   form.reset();

        //   // Refetch la query GraphQL pour mettre à jour le cache Apollo
        //   await apolloClient.refetchQueries({
        //     include: [GetCategoriesDocument],
        //   });

        //   onCategoryAdded?.();
        //   setTimeout(() => setSaved(false), 3000);
        // } else {
        //   setSaveError(result.error);
        // }

        // Temporary simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaved(true);
        form.reset();
        onCategoryAdded?.();
        setTimeout(() => setSaved(false), 3000);
      } catch (error) {
        console.error("Error creating category:", error);
        setSaveError("Unable to create category. Please try again.");
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
            Category Name
          </Label>
          <Input
            id="name"
            type="text"
            disabled={isLoading || isPending}
            className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
            placeholder="Enter category name"
            {...form.register("name", {
              required: "Category name is required",
              minLength: {
                value: 2,
                message: "Category name must be at least 2 characters",
              },
            })}
          />
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1 font-medium">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="pt-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-semibold">
                Category created successfully
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
                  Creating category...
                </div>
              ) : (
                "Create Category"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
