"use client";

import { useState, useRef } from "react";
import { useApolloClient } from "@apollo/client";
import {
  CategoriesList,
  type CategoriesListRef,
} from "@/components/categories/categories-list";
import { CategoryAddForm } from "@/components/categories/category-add-form";
import { CategoryEditForm } from "@/components/categories/category-edit-form";
import { DeleteConfirmationModal } from "@/components/categories/delete-confirmation-modal";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Plus, Tags, Trash2 } from "lucide-react";
import type { Category } from "@/graphql/generated/graphql";

export default function CategoriesPage() {
  const apolloClient = useApolloClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const categoriesListRef = useRef<CategoriesListRef>(null);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
  };

  const handleCancelEdit = () => {
    setSelectedCategory(null);
  };

  const handleCategoryUpdated = () => {
    categoriesListRef.current?.refresh();
  };

  const handleCategoryAdded = () => {
    categoriesListRef.current?.refresh();
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
        setDeleteError(null);
        setIsDeleting(false);
      }, 1000);
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleteError("Error deleting category");
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    setDeleteError(null);
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
            onClick={handleAdd}
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
                onClick={handleAdd}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <CategoriesList
              ref={categoriesListRef}
              onEdit={handleEdit}
              onAdd={handleAdd}
              selectedCategory={selectedCategory}
              onDelete={handleDeleteCategory}
              isDeleting={isDeleting}
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
                  disabled={isDeleting}
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
                <CategoryEditForm
                  category={selectedCategory}
                  onCategoryUpdated={handleCategoryUpdated}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <CategoryAddForm onCategoryAdded={handleCategoryAdded} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {categoryToDelete && (
        <DeleteConfirmationModal
          category={categoryToDelete}
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
}
