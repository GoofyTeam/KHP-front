"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApolloClient } from "@apollo/client";
import { z } from "zod";
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
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateMenuCategoryAction } from "@/app/(mainapp)/settings/menu-categories/actions";
import type { MenuCategory } from "@/graphql/generated/graphql";
import { GetMenuCategoriesDocument } from "@/graphql/generated/graphql";

const menuCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name must be less than 50 characters")
    .trim(),
});

type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>;

interface MenuCategoryEditFormProps {
  category: MenuCategory;
  onCategoryUpdated?: () => void;
  onCancel?: () => void;
}

export function MenuCategoryEditForm({
  category,
  onCategoryUpdated,
  onCancel,
}: MenuCategoryEditFormProps) {
  const [saved, setSaved] = useState(false);
  const apolloClient = useApolloClient();

  const form = useForm<MenuCategoryFormValues>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: {
      name: category.name,
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      name: category.name,
    });
  }, [category, form]);

  const onSubmit = form.handleSubmit(async (values: MenuCategoryFormValues) => {
    try {
      setSaved(false);
      form.clearErrors();

      const result = await updateMenuCategoryAction(category.id, values);

      if (result?.success) {
        setSaved(true);

        await apolloClient.refetchQueries({
          include: [GetMenuCategoriesDocument],
        });

        onCategoryUpdated?.();
        setTimeout(() => setSaved(false), 3000);
      } else {
        form.setError("root", {
          message: result?.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      form.setError("root", {
        message: "Unable to update category. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
      <div className="p-4 bg-khp-background-secondary rounded-lg">
        <p className="text-khp-text-secondary text-sm mb-1">
          Editing:{" "}
          <span className="font-medium text-khp-text-primary">
            {category.name}
          </span>
        </p>
        <p className="text-khp-text-secondary text-xs">ID: {category.id}</p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-khp-text-primary">
                  Category Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter category name"
                    disabled={form.formState.isSubmitting}
                    className="h-12 text-base"
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
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Category updated successfully
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
                  disabled={
                    form.formState.isSubmitting || !form.formState.isValid
                  }
                  variant="khp-default"
                  className="w-full h-12 text-base font-semibold"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating category...
                    </>
                  ) : (
                    "Update Category"
                  )}
                </Button>

                {onCancel && (
                  <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="w-full h-10 text-sm font-medium"
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
