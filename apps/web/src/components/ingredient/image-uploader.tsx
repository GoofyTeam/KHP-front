"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Camera, X, Folder } from "lucide-react";
import { FormLabel } from "@workspace/ui/components/form";
import { CameraModal } from "@workspace/ui/components/camera-modal";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageCapture: (file: File) => void;
  onClearImage: () => void;
  ingredientName: string;
}

export function ImageUploader({
  imagePreview,
  onImageCapture,
  onClearImage,
  ingredientName,
}: ImageUploaderProps) {
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageCapture(file);
    }
  };

  return (
    <>
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onImageCapture}
        defaultFilename={`ingredient-${ingredientName}-${Date.now()}.jpg`}
      />

      <div className="space-y-4">
        <FormLabel className="text-lg font-semibold text-khp-text-primary">
          Ingredient Image
        </FormLabel>

        <div className="relative w-72 h-72 mx-auto">
          {imagePreview ? (
            <>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-full w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={onClearImage}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <label htmlFor="image-file-input" className="cursor-pointer">
              <ImagePlaceholder
                className="h-full w-full hover:bg-khp-primary/5 transition-colors"
                iconSize={64}
                text="Click to select image"
              />
              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCameraOpen(true)}
            className="flex-1 h-14 text-lg font-medium border-2 flex items-center gap-3"
          >
            <Camera className="w-6 h-6" />
            {imagePreview ? "Change Photo" : "Take Photo"}
          </Button>

          <label htmlFor="file-input" className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg font-medium border-2 flex items-center gap-3 cursor-pointer"
              asChild
            >
              <span>
                <Folder className="w-6 h-6" />
                {imagePreview ? "Change File" : "Select File"}
              </span>
            </Button>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </>
  );
}
