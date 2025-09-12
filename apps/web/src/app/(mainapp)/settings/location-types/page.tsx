"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import {
  LocationTypesList,
  type LocationTypesListRef,
} from "@/components/location-types/location-types-list";
import { LocationTypeAddForm } from "@/components/location-types/location-type-add-form";
import { LocationTypeEditForm } from "@/components/location-types/location-type-edit-form";
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
  Layers,
  Trash2,
  AlertTriangle,
  Loader2,
  Shield,
} from "lucide-react";
import type { LocationType } from "@/graphql/generated/graphql";
import { GetLocationTypesDocument } from "@/graphql/generated/graphql";
import { deleteLocationTypeAction } from "./actions";

type DeleteFormData = {
  locationTypeToDelete: LocationType | null;
};

export default function LocationTypesPage() {
  const apolloClient = useApolloClient();
  const [selectedLocationType, setSelectedLocationType] =
    useState<LocationType | null>(null);
  const locationTypesListRef = useRef<LocationTypesListRef>(null);

  const deleteForm = useForm<DeleteFormData>({
    defaultValues: {
      locationTypeToDelete: null,
    },
  });

  const handleDeleteLocationType = (locationType: LocationType) => {
    if (locationType.is_default) {
      return;
    }
    deleteForm.setValue("locationTypeToDelete", locationType);
    deleteForm.clearErrors();
  };

  const handleConfirmDelete = deleteForm.handleSubmit(async (data) => {
    if (!data.locationTypeToDelete) return;

    try {
      const result = await deleteLocationTypeAction(
        data.locationTypeToDelete.id
      );
      if (result.success) {
        await apolloClient.refetchQueries({
          include: [GetLocationTypesDocument],
        });

        locationTypesListRef.current?.refresh();

        if (selectedLocationType?.id === data.locationTypeToDelete.id) {
          setSelectedLocationType(null);
        }

        deleteForm.reset();
      } else {
        deleteForm.setError("root", {
          message: result.error || "Error deleting location type",
        });
      }
    } catch (error) {
      console.error("Error deleting location type:", error);
      deleteForm.setError("root", {
        message: "Error deleting location type",
      });
    }
  });

  const handleCancelDelete = () => {
    deleteForm.reset();
  };

  const handleLocationTypeAdded = () => {
    locationTypesListRef.current?.refresh();
    setSelectedLocationType(null);
  };

  const handleLocationTypeUpdated = () => {
    locationTypesListRef.current?.refresh();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Layers className="h-7 w-7 text-khp-primary" />
              Location Types Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Manage the categories for your storage locations
            </p>
          </div>
          <Button
            onClick={() => setSelectedLocationType(null)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
            variant="khp-default"
          >
            <Plus className="h-5 w-5" />
            Add Location Type
          </Button>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                Location Types
              </CardTitle>
              <Button
                onClick={() => setSelectedLocationType(null)}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LocationTypesList
              ref={locationTypesListRef}
              onEdit={setSelectedLocationType}
              onAdd={() => setSelectedLocationType(null)}
              selectedLocationType={selectedLocationType}
              onDelete={handleDeleteLocationType}
              isDeleting={deleteForm.formState.isSubmitting}
            />
          </CardContent>
        </Card>

        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                {selectedLocationType
                  ? "Edit Location Type"
                  : "Add New Location Type"}
              </CardTitle>
              {selectedLocationType && !selectedLocationType.is_default && (
                <Button
                  onClick={() => handleDeleteLocationType(selectedLocationType)}
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
              {selectedLocationType ? (
                <LocationTypeEditForm
                  locationType={selectedLocationType}
                  onLocationTypeUpdated={handleLocationTypeUpdated}
                  onCancel={() => setSelectedLocationType(null)}
                />
              ) : (
                <LocationTypeAddForm
                  onLocationTypeAdded={handleLocationTypeAdded}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deleteForm.watch("locationTypeToDelete")}
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
                  Delete Location Type
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            {deleteForm.watch("locationTypeToDelete") && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-khp-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {deleteForm.watch("locationTypeToDelete")!.name}
                    </p>
                    {deleteForm.watch("locationTypeToDelete")!.is_default && (
                      <div className="flex items-center gap-1 text-khp-primary mt-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          Default Type
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to delete this location type? Any locations
              using this type will need to be updated to use a different type.
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
                "Delete Location Type"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
