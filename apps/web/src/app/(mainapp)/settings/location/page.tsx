"use client";

import { useState, useRef } from "react";
import { useApolloClient } from "@apollo/client";
import {
  LocationsList,
  type LocationsListRef,
} from "@/components/locations/locations-list";
import { LocationAddForm } from "@/components/locations/location-add-form";
import { LocationEditForm } from "@/components/locations/location-edit-form";
import { DeleteConfirmationModal } from "@/components/locations/delete-confirmation-modal";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Plus, MapPin, Trash2 } from "lucide-react";
import type { Location } from "@/graphql/generated/graphql";
import { GetLocationsDocument } from "@/graphql/generated/graphql";
import { deleteLocationAction } from "./actions";

export default function LocationPage() {
  const apolloClient = useApolloClient();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const locationsListRef = useRef<LocationsListRef>(null);

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleAdd = () => {
    setSelectedLocation(null);
  };

  const handleCancelEdit = () => {
    setSelectedLocation(null);
  };

  const handleLocationUpdated = () => {
    locationsListRef.current?.refresh();
  };

  const handleLocationAdded = () => {
    locationsListRef.current?.refresh();
    setSelectedLocation(null);
  };

  const handleDeleteLocation = (location: Location) => {
    setLocationToDelete(location);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteLocationAction(locationToDelete.id);
      if (result.success) {
        // Refetch la query GraphQL pour mettre à jour le cache Apollo
        await apolloClient.refetchQueries({
          include: [GetLocationsDocument],
        });

        // Refresh la liste
        locationsListRef.current?.refresh();

        if (selectedLocation?.id === locationToDelete.id) {
          setSelectedLocation(null);
        }
        setIsDeleteModalOpen(false);
        setLocationToDelete(null);
        setDeleteError(null);
      } else {
        setDeleteError(result.error || "Error deleting location");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
      setDeleteError("Error deleting location");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setLocationToDelete(null);
    setDeleteError(null);
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
            onClick={handleAdd}
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
            <LocationsList
              ref={locationsListRef}
              onEdit={handleEdit}
              onAdd={handleAdd}
              selectedLocation={selectedLocation}
              onDelete={handleDeleteLocation}
              isDeleting={isDeleting}
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
              {selectedLocation ? (
                <LocationEditForm
                  location={selectedLocation}
                  onLocationUpdated={handleLocationUpdated}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <LocationAddForm onLocationAdded={handleLocationAdded} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {locationToDelete && (
        <DeleteConfirmationModal
          location={locationToDelete}
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
