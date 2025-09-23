"use client";

import { useState } from "react";
import { Button } from "./button";
import { Camera, X, Folder } from "lucide-react";
import { FormLabel } from "./form";
import { CameraModal } from "./camera-modal";
import { ImagePlaceholder } from "./image-placeholder";
import { compressImageFile } from "../lib/compress-img";
import { WANTED_IMAGE_SIZE } from "../lib/const";

interface ImageUploaderProps {
  imagePreview: string | null;
  onImageCapture: (file: File) => void;
  onClearImage: () => void;
  ingredientName: string;
  label?: string;
  onCompressionError?: (error: string) => void;
}

export function ImageUploader({
  imagePreview,
  onImageCapture,
  onClearImage,
  ingredientName,
  label = "Image",
  onCompressionError,
}: ImageUploaderProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  const processImageFile = async (file: File) => {
    setIsCompressing(true);

    try {
      const compressed = await compressImageFile(file, {
        maxSizeBytes: WANTED_IMAGE_SIZE,
        maxWidth: 1600,
        maxHeight: 1600,
        mimeType: "image/jpeg",
      });

      if (compressed.size > WANTED_IMAGE_SIZE) {
        const errorMessage = "Image exceeds 1.5MB after compression.";
        if (onCompressionError) {
          onCompressionError(errorMessage);
        } else {
          console.error(errorMessage);
        }
        return;
      }

      onImageCapture(compressed);
    } catch (error) {
      const errorMessage = "Failed to compress image. Please try again.";
      if (onCompressionError) {
        onCompressionError(errorMessage);
      } else {
        console.error("Image compression failed:", error);
      }
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <>
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={processImageFile}
        defaultFilename={`ingredient-${ingredientName}-${Date.now()}.jpg`}
      />

      <div className="space-y-4">
        <FormLabel className="text-lg font-semibold text-khp-text-primary">
          {label}
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
            disabled={isCompressing}
            className="flex-1 h-14 text-lg font-medium border-2 flex items-center gap-3"
          >
            <Camera className="w-6 h-6" />
            {isCompressing
              ? "Compressing..."
              : imagePreview
                ? "Change Photo"
                : "Take Photo"}
          </Button>

          <label htmlFor="file-input" className="flex-1">
            <Button
              type="button"
              variant="outline"
              disabled={isCompressing}
              className="w-full h-14 text-lg font-medium border-2 flex items-center gap-3 cursor-pointer"
              asChild
            >
              <span>
                <Folder className="w-6 h-6" />
                {isCompressing
                  ? "Compressing..."
                  : imagePreview
                    ? "Change File"
                    : "Select File"}
              </span>
            </Button>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isCompressing}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </>
  );
}
