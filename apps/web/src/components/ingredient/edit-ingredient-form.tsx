"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { Form } from "@workspace/ui/components/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { IngredientFields } from "./ingredient-fields";
import { ImageUploader } from "./image-uploader";
import {
  updateIngredientAction,
  deleteIngredientAction,
} from "@/app/(mainapp)/ingredient/actions";
import type { GetIngredientQuery } from "@/graphql/generated/graphql";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface EditIngredientFormProps {
  ingredient: IngredientData;
}

const editIngredientSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  unit: z.string().min(1, "Unit is required").max(50, "Unit is too long"),
  category: z.string().optional().or(z.literal("")),
  image_url: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Please enter a valid URL"),
  base_quantity: z.number().min(0, "Base quantity must be positive").optional(),
  base_unit: z.string().optional(),
  allergens: z.array(z.string()).optional(),
  image_file: z.instanceof(File).optional(),
});

type EditIngredientFormData = z.infer<typeof editIngredientSchema>;

export function EditIngredientForm({ ingredient }: EditIngredientFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<EditIngredientFormData>({
    resolver: zodResolver(editIngredientSchema),
    defaultValues: {
      name: ingredient.name,
      unit: ingredient.unit.toString(),
      category: ingredient.category?.id || "",
      image_url: ingredient.image_url || "",
      base_quantity: ingredient.base_quantity || undefined,
      base_unit: ingredient.base_unit?.toString() || "",
      allergens: ingredient.allergens || [],
      image_file: undefined,
    },
  });

  // Valeurs calculées depuis React Hook Form
  const imageFile = form.watch("image_file");
  const imageUrl = form.watch("image_url");
  const imagePreview = imageFile
    ? URL.createObjectURL(imageFile)
    : imageUrl || null;

  // États de formulaire depuis React Hook Form
  const isSubmitting = form.formState.isSubmitting;
  const apiError = form.formState.errors.root?.message;

  const handleImageCapture = (file: File) => {
    form.setValue("image_file", file);
    form.setValue("image_url", "");
  };

  const handleUrlChange = (url: string) => {
    if (url.trim()) {
      form.setValue("image_url", url);
      form.setValue("image_file", undefined);
    } else {
      form.setValue("image_url", "");
      form.setValue("image_file", undefined);
    }
  };

  const handleClearImage = () => {
    form.setValue("image_url", "");
    form.setValue("image_file", undefined);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteIngredientAction(ingredient.id);
      if (result.success) {
        router.push("/stocks");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (data: EditIngredientFormData) => {
    // Nettoyer les erreurs précédentes
    form.clearErrors("root");

    try {
      const updateData: {
        ingredientId: string;
        name: string;
        unit: string;
        category_id?: number | null;
        image?: File;
        image_url?: string;
        base_quantity?: number;
        base_unit?: string;
        allergens?: string[];
      } = {
        ingredientId: ingredient.id,
        name: data.name,
        unit: data.unit,
        category_id:
          data.category && data.category.trim() !== ""
            ? parseInt(data.category)
            : null,
      };

      if (data.image_file) {
        updateData.image = data.image_file;
      } else if (
        data.image_url &&
        data.image_url.trim() !== "" &&
        data.image_url.trim() !== ingredient.image_url
      ) {
        updateData.image_url = data.image_url.trim();
      }

      if (data.base_quantity !== undefined && data.base_quantity > 0) {
        updateData.base_quantity = data.base_quantity;
      }

      if (data.base_unit && data.base_unit.trim() !== "") {
        updateData.base_unit = data.base_unit.trim();
      }

      if (data.allergens && data.allergens.length > 0) {
        updateData.allergens = data.allergens;
      }

      const result = await updateIngredientAction(updateData);

      if (!result.success) {
        form.setError("root", {
          message: result.error || "Failed to update ingredient",
        });
        return;
      }

      setSuccess(true);
      router.push(`/ingredient/${ingredient.id}`);
    } catch {
      form.setError("root", {
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-khp-text-primary mb-3">
          Ingredient Updated!
        </h3>
        <p className="text-lg text-khp-text-secondary mb-4">
          The ingredient has been updated successfully.
        </p>
        <p className="text-base text-khp-text-secondary">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
              disabled={isDeleting}
              title="Delete ingredient"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Delete Ingredient
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Are you sure you want to delete &quot;{ingredient.name}
                &quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-12 text-base font-medium rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="h-12 text-base font-medium rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IngredientFields form={form} />

            <div className="space-y-4">
              <ImageUploader
                form={form}
                imagePreview={imagePreview}
                onImageCapture={handleImageCapture}
                onUrlChange={handleUrlChange}
                onClearImage={handleClearImage}
                ingredientName={ingredient.name}
              />

              {apiError && (
                <div className="w-full p-5 bg-khp-error/10 border-2 border-khp-error/30 rounded-xl">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-khp-error mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-base font-medium text-khp-error">
                        {apiError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              variant="khp-default"
              size="xl-full"
              className="w-full max-w-md h-14 text-lg font-semibold rounded-xl bg-khp-primary hover:bg-khp-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update Ingredient"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
