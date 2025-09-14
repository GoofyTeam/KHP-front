"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Camera, Link as LinkIcon, X, Folder } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { CameraModal } from "@workspace/ui/components/camera-modal";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";

type EditIngredientFormData = {
  name: string;
  unit: string;
  category?: string;
  image_url?: string;
  base_quantity?: number;
  base_unit?: string;
  allergens?: string[];
  image_file?: any;
};

interface ImageSectionProps {
  form: UseFormReturn<EditIngredientFormData>;
  imagePreview: string | null;
  onImageCapture: (file: File) => void;
  onUrlChange: (url: string) => void;
  onClearImage: () => void;
  ingredientName: string;
}

export function ImageSection({
  form,
  imagePreview,
  onImageCapture,
  onUrlChange,
  onClearImage,
  ingredientName,
}: ImageSectionProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!!imagePreview);

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
        onUseUrl={() => {
          setShowUrlInput(true);
          setCameraOpen(false);
        }}
        defaultFilename={`ingredient-${ingredientName}-${Date.now()}.jpg`}
      />

      <div className="space-y-4">
        <FormLabel className="text-lg font-semibold text-khp-text-primary">
          Ingredient Image
        </FormLabel>

        <div className="relative w-56 h-56 mx-auto">
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

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCameraOpen(true)}
            className="h-14 text-lg font-medium border-2 flex items-center gap-3"
          >
            <Camera className="w-6 h-6" />
            {imagePreview ? "Change Photo" : "Take Photo"}
          </Button>

          {!showUrlInput ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowUrlInput(true)}
              className="h-12 text-base font-medium text-khp-text-secondary"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Or use URL
            </Button>
          ) : (
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        placeholder="https://example.com/image.jpg"
                        className="h-12 text-base flex-1 border-2"
                        onChange={(e) => {
                          field.onChange(e);
                          onUrlChange(e.target.value);
                        }}
                      />
                      <label htmlFor="url-file-input">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 px-4 border-2 cursor-pointer"
                          asChild
                        >
                          <span>
                            <Folder className="w-4 h-4" />
                          </span>
                        </Button>
                        <input
                          id="url-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-4 border-2"
                        onClick={() => {
                          field.onChange("");
                          onUrlChange("");
                          setShowUrlInput(false);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>
    </>
  );
}
