"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient } from "@apollo/client";
import {
  LocationsList,
  type LocationsListRef,
} from "@/components/locations/locations-list";
import { LocationAddForm } from "@/components/locations/location-add-form";
import { LocationEditForm } from "@/components/locations/location-edit-form";
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
import { Plus, MapPin, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type { Location } from "@/graphql/generated/graphql";
import { GetLocationsDocument } from "@/graphql/generated/graphql";
import { deleteLocationAction } from "./actions";

type DeleteFormData = {
  locationToDelete: Location | null;
};

export default function LocationPage() {
  const apolloClient = useApolloClient();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const locationsListRef = useRef<LocationsListRef>(null);

  const deleteForm = useForm<DeleteFormData>({
    defaultValues: {
      locationToDelete: null,
    },
  });

  const handleDeleteLocation = (location: Location) => {
    deleteForm.setValue("locationToDelete", location);
    deleteForm.clearErrors();
  };

  const handleConfirmDelete = deleteForm.handleSubmit(async (data) => {
    if (!data.locationToDelete) return;

    try {
      const result = await deleteLocationAction(data.locationToDelete.id);
      if (result.success) {
        // Refetch la query GraphQL pour mettre à jour le cache Apollo
        await apolloClient.refetchQueries({
          include: [GetLocationsDocument],
        });

        // Refresh la liste pour s'assurer qu'elle se met à jour
        locationsListRef.current?.refresh();

        if (selectedLocation?.id === data.locationToDelete.id) {
          setSelectedLocation(null);
        }

        // Reset le formulaire (ferme le modal et nettoie les données)
        deleteForm.reset();
      } else {
        deleteForm.setError("root", {
          message: result.error || "Error deleting location",
        });
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      deleteForm.setError("root", {
        message: "Error deleting location",
      });
    }
  });

  const handleLocationAdded = () => {
    locationsListRef.current?.refresh();
    setSelectedLocation(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <MapPin className="h-7 w-7 text-khp-primary" />
              Location Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Manage your storage locations and their types
            </p>
          </div>
          <Button
            onClick={() => setSelectedLocation(null)}
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
            variant="khp-default"
          >
            <Plus className="h-5 w-5" />
            Add Location
          </Button>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row gap-4">
        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                Locations
              </CardTitle>
              <Button
                onClick={() => setSelectedLocation(null)}
                variant="outline"
                size="sm"
                className="lg:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <LocationsList
              ref={locationsListRef}
              onEdit={setSelectedLocation}
              onAdd={() => setSelectedLocation(null)}
              selectedLocation={selectedLocation}
              onDelete={handleDeleteLocation}
              isDeleting={deleteForm.formState.isSubmitting}
            />
          </CardContent>
        </Card>

        <Card className="bg-khp-surface border-khp-border shadow-sm flex-1 lg:flex-none lg:w-1/2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-khp-text-primary">
                {selectedLocation ? "Edit Location" : "Add New Location"}
              </CardTitle>
              {selectedLocation && (
                <Button
                  onClick={() => handleDeleteLocation(selectedLocation)}
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
              {selectedLocation ? (
                <LocationEditForm
                  location={selectedLocation}
                  onLocationUpdated={() => locationsListRef.current?.refresh()}
                  onCancel={() => setSelectedLocation(null)}
                />
              ) : (
                <LocationAddForm onLocationAdded={handleLocationAdded} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteForm.watch("locationToDelete")}
        onOpenChange={(open) => !open && deleteForm.reset()}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl text-gray-900">
                  Delete Location
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            {deleteForm.watch("locationToDelete") && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-khp-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate">
                      {deleteForm.watch("locationToDelete")!.name}
                    </p>
                    {deleteForm.watch("locationToDelete")!.locationType && (
                      <p className="text-sm text-gray-600">
                        Type:{" "}
                        {
                          deleteForm.watch("locationToDelete")!.locationType!
                            .name
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to delete this location? Any items stored in
              this location may need to be reassigned to other locations.
            </p>

            {/* Error message */}
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
              onClick={() => deleteForm.reset()}
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
                "Delete Location"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
