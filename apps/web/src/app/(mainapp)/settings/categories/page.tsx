"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import {
  CategoriesList,
  type CategoriesListRef,
} from "@/components/categories/categories-list";
import { CategoryAddForm } from "@/components/categories/category-add-form";
import { CategoryEditForm } from "@/components/categories/category-edit-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Plus, Tags, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type { Category } from "@workspace/graphql";
import { GetCategoriesDocument } from "@workspace/graphql";
import { deleteCategoryAction } from "./actions";

type PageFormData = {
  selectedCategory: Category | null;
  categoryToDelete: Category | null;
  isDeleting: boolean;
  deleteError: string | null;
};

export default function CategoriesPage() {
  const apolloClient = useApolloClient();
  const categoriesListRef = useRef<CategoriesListRef>(null);

  const form = useForm<PageFormData>({
    defaultValues: {
      selectedCategory: null,
      categoryToDelete: null,
      isDeleting: false,
      deleteError: null,
    },
    mode: "onChange",
  });

  const { watch, setValue } = form;
  const selectedCategory = watch("selectedCategory");
  const categoryToDelete = watch("categoryToDelete");
  const isDeleting = watch("isDeleting");
  const deleteError = watch("deleteError");

  const handleDeleteCategory = (category: Category) => {
    setValue("categoryToDelete", category);
    setValue("deleteError", null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setValue("isDeleting", true);
    setValue("deleteError", null);

    try {
      const result = await deleteCategoryAction(categoryToDelete.id);
      if (result.success) {
        await apolloClient.refetchQueries({
          include: [GetCategoriesDocument],
        });
        categoriesListRef.current?.refresh();

        if (selectedCategory?.id === categoryToDelete.id) {
          setValue("selectedCategory", null);
        }

        setValue("categoryToDelete", null);
      } else {
        setValue("deleteError", result.error || "Error deleting category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setValue("deleteError", "Error deleting category");
    } finally {
      setValue("isDeleting", false);
    }
  };

  const handleCancelDelete = () => {
    setValue("categoryToDelete", null);
    setValue("deleteError", null);
  };

  const handleCategoryAdded = () => {
    categoriesListRef.current?.refresh();
    setValue("selectedCategory", null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Tags className="h-7 w-7 text-khp-primary" />
              Category Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Manage your product and ingredient categories
            </p>
          </div>
          <Button
            onClick={() => setValue("selectedCategory", null)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
            variant="khp-default"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </Button>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2 h-[70vh] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                Categories
              </CardTitle>
              <Button
                onClick={() => setValue("selectedCategory", null)}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <CategoriesList
              ref={categoriesListRef}
              onEdit={(category) => setValue("selectedCategory", category)}
              onAdd={() => setValue("selectedCategory", null)}
              selectedCategory={selectedCategory}
              onDelete={handleDeleteCategory}
              isDeleting={isDeleting}
            />
          </CardContent>
        </Card>

        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2 h-[70vh] flex flex-col gap-2">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </CardTitle>
              {selectedCategory && (
                <Button
                  onClick={() => handleDeleteCategory(selectedCategory)}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {selectedCategory ? (
              <CategoryEditForm
                category={selectedCategory}
                onCategoryUpdated={() => categoriesListRef.current?.refresh()}
                onCancel={() => setValue("selectedCategory", null)}
              />
            ) : (
              <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl text-gray-900">
                  Delete Category
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            {categoryToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                    <Tags className="h-5 w-5 text-khp-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {categoryToDelete.name}
                    </p>
                    <p className="text-sm text-gray-600">Category</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to delete this category? Any products and
              ingredients using this category will be uncategorized.
            </p>

            {/* Error message */}
            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 leading-relaxed">
                    {deleteError}
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete Category"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
