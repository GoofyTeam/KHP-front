"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { AlertTriangle, MapPin, X } from "lucide-react";
import type { Location } from "@/graphql/generated/graphql";

interface DeleteConfirmationModalProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteConfirmationModal({
  location,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  error = null,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-white shadow-2xl border-0 animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-3 top-3 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          disabled={isDeleting}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">
                Delete Location
              </CardTitle>
              <CardDescription className="text-gray-600">
                This action cannot be undone
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-khp-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-khp-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 truncate">
                  {location.name}
                </p>
                {location.locationType && (
                  <p className="text-sm text-gray-600">
                    Type: {location.locationType.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 mt-4 leading-relaxed">
            Are you sure you want to delete this location? Any items stored in
            this location may need to be reassigned to other locations.
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 pt-0">
          <Button
            variant="outline"
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              "Delete Location"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
