"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import {
  MenuCategoriesList,
  type MenuCategoriesListRef,
} from "@/components/menu-categories/menu-categories-list";
import { MenuCategoryAddForm } from "@/components/menu-categories/menu-category-add-form";
import { MenuCategoryEditForm } from "@/components/menu-categories/menu-category-edit-form";
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
import { Plus, Tag, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type { MenuCategory } from "@/graphql/generated/graphql";
import { GetMenuCategoriesDocument } from "@/graphql/generated/graphql";
import { deleteMenuCategoryAction } from "./actions";

type DeleteFormData = {
  categoryToDelete: MenuCategory | null;
};

export default function MenuCategoriesPage() {
  const apolloClient = useApolloClient();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    null,
  );
  const categoriesListRef = useRef<MenuCategoriesListRef>(null);

  const deleteForm = useForm<DeleteFormData>({
    defaultValues: {
      categoryToDelete: null,
    },
  });

  const handleDeleteCategory = (category: MenuCategory) => {
    deleteForm.setValue("categoryToDelete", category);
    deleteForm.clearErrors();
  };

  const handleConfirmDelete = deleteForm.handleSubmit(async (data) => {
    if (!data.categoryToDelete) return;

    try {
      const result = await deleteMenuCategoryAction(data.categoryToDelete.id);
      if (result.success) {
        await apolloClient.refetchQueries({
          include: [GetMenuCategoriesDocument],
        });

        categoriesListRef.current?.refresh();

        if (selectedCategory?.id === data.categoryToDelete.id) {
          setSelectedCategory(null);
        }

        deleteForm.reset();
      } else {
        deleteForm.setError("root", {
          message: result.error || "Error deleting category",
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      deleteForm.setError("root", {
        message: "Error deleting category",
      });
    }
  });

  const handleCancelDelete = () => {
    deleteForm.reset();
  };

  const handleCategoryAdded = () => {
    categoriesListRef.current?.refresh();
    setSelectedCategory(null);
  };

  const handleCategoryUpdated = () => {
    categoriesListRef.current?.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Tag className="h-7 w-7 text-khp-primary" />
              Menu Categories Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Manage your menu categories to organize your restaurant menus
            </p>
          </div>
          <Button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
            variant="khp-default"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </Button>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                Categories
              </CardTitle>
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MenuCategoriesList
              ref={categoriesListRef}
              onEdit={setSelectedCategory}
              onAdd={() => setSelectedCategory(null)}
              selectedCategory={selectedCategory}
              onDelete={handleDeleteCategory}
              isDeleting={deleteForm.formState.isSubmitting}
            />
          </CardContent>
        </Card>

        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </CardTitle>
              {selectedCategory && (
                <Button
                  onClick={() => handleDeleteCategory(selectedCategory)}
                  variant="outline"
                  size="sm"
                  disabled={deleteForm.formState.isSubmitting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[28rem] flex flex-col justify-center">
              {selectedCategory ? (
                <MenuCategoryEditForm
                  category={selectedCategory}
                  onCategoryUpdated={handleCategoryUpdated}
                  onCancel={() => setSelectedCategory(null)}
                />
              ) : (
                <MenuCategoryAddForm onCategoryAdded={handleCategoryAdded} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deleteForm.watch("categoryToDelete")}
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
            {deleteForm.watch("categoryToDelete") && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                    <Tag className="h-5 w-5 text-khp-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {deleteForm.watch("categoryToDelete")!.name}
                    </p>
                    <p className="text-sm text-gray-600">Menu Category</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to delete this category? Any menus in this
              category may need to be reassigned to other categories.
            </p>

            {deleteForm.formState.errors.root?.message && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 leading-relaxed">
                    {deleteForm.formState.errors.root.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelDelete}
              disabled={deleteForm.formState.isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteForm.formState.isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteForm.formState.isSubmitting ? (
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
