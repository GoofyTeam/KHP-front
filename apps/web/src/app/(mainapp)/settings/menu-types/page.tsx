"use client";

import { useApolloClient } from "@apollo/client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Plus,
  Trash2,
  AlertTriangle,
  ListOrdered,
  Loader2,
} from "lucide-react";

import {
  MenuTypesList,
  type MenuTypesListRef,
} from "@/components/menu-types/menu-types-list";
import { MenuTypeAddForm } from "@/components/menu-types/menu-type-add-form";
import { MenuTypeEditForm } from "@/components/menu-types/menu-type-edit-form";
import {
  GetMenuTypesDocument,
  type MenuType,
} from "@/graphql/generated/graphql";
import { deleteMenuTypeAction } from "./actions";

type DeleteFormData = {
  menuTypeToDelete: MenuType | null;
};

export default function MenuTypesPage() {
  const apolloClient = useApolloClient();
  const [selectedMenuType, setSelectedMenuType] = useState<MenuType | null>(
    null,
  );
  const menuTypesListRef = useRef<MenuTypesListRef>(null);

  const deleteForm = useForm<DeleteFormData>({
    defaultValues: {
      menuTypeToDelete: null,
    },
  });

  const handleDeleteMenuType = (menuType: MenuType) => {
    deleteForm.setValue("menuTypeToDelete", menuType);
    deleteForm.clearErrors();
  };

  const handleConfirmDelete = deleteForm.handleSubmit(async (data) => {
    if (!data.menuTypeToDelete) return;

    try {
      const result = await deleteMenuTypeAction(data.menuTypeToDelete.id);
      if (result.success) {
        await apolloClient.refetchQueries({
          include: [GetMenuTypesDocument],
        });

        menuTypesListRef.current?.refresh();

        if (selectedMenuType?.id === data.menuTypeToDelete.id) {
          setSelectedMenuType(null);
        }

        deleteForm.reset();
      } else {
        deleteForm.setError("root", {
          message: result.error || "Error deleting menu type",
        });
      }
    } catch (error) {
      console.error("Error deleting menu type:", error);
      deleteForm.setError("root", {
        message: "Error deleting menu type",
      });
    }
  });

  const handleCancelDelete = () => {
    deleteForm.reset();
  };

  const handleMenuTypeAdded = () => {
    menuTypesListRef.current?.refresh();
    setSelectedMenuType(null);
  };

  const handleMenuTypeUpdated = (menuType?: MenuType) => {
    menuTypesListRef.current?.refresh();
    if (menuType) {
      setSelectedMenuType(menuType);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <ListOrdered className="h-7 w-7 text-khp-primary" />
              Menu Types Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Manage your menu types to organize your public menus
            </p>
          </div>
          <Button
            onClick={() => setSelectedMenuType(null)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
            variant="khp-default"
          >
            <Plus className="h-5 w-5" />
            Add Menu Type
          </Button>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                Menu Types
              </CardTitle>
              <Button
                onClick={() => setSelectedMenuType(null)}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MenuTypesList
              ref={menuTypesListRef}
              onEdit={setSelectedMenuType}
              onAdd={() => setSelectedMenuType(null)}
              selectedMenuType={selectedMenuType}
              onDelete={handleDeleteMenuType}
              isDeleting={deleteForm.formState.isSubmitting}
            />
          </CardContent>
        </Card>

        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                {selectedMenuType ? "Edit Menu Type" : "Add New Menu Type"}
              </CardTitle>
              {selectedMenuType && (
                <Button
                  onClick={() => handleDeleteMenuType(selectedMenuType)}
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
              {selectedMenuType ? (
                <MenuTypeEditForm
                  menuType={selectedMenuType}
                  onMenuTypeUpdated={handleMenuTypeUpdated}
                  onCancel={() => setSelectedMenuType(null)}
                />
              ) : (
                <MenuTypeAddForm onMenuTypeAdded={handleMenuTypeAdded} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deleteForm.watch("menuTypeToDelete")}
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
                  Delete Menu Type
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            {deleteForm.watch("menuTypeToDelete") && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                    <ListOrdered className="h-5 w-5 text-khp-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {deleteForm.watch("menuTypeToDelete")!.name}
                    </p>
                    <p className="text-sm text-gray-600">Menu Type</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to delete this menu type? Any menus linked
              to this type may need to be reassigned before deletion.
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
                "Delete Menu Type"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
