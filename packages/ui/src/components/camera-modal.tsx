"use client";

import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Camera, X, Link as LinkIcon } from "lucide-react";
import { useCamera } from "@workspace/ui/hooks/use-camera";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onUseUrl?: () => void;
  defaultFilename?: string;
}

export function CameraModal({
  open,
  onClose,
  onCapture,
  onUseUrl,
  defaultFilename,
}: CameraModalProps) {
  const { videoRef, start, stop, takePhoto } = useCamera();

  useEffect(() => {
    let mounted = true;
    if (open) {
      start().catch((e) => {
        console.error("Camera start error:", e);
        onClose();
      });
    }
    return () => {
      if (mounted) stop();
      mounted = false;
    };
  }, [open, onClose, start, stop]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[min(95vw,95vh)] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-khp-text-primary">
            Take a Photo
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-4">
          <div className="relative aspect-square w-full max-w-[min(85vw,75vh)] mx-auto">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  const file = await takePhoto(
                    defaultFilename || `ingredient-${Date.now()}.jpg`
                  );
                  onCapture(file);
                  onClose();
                } catch (e) {
                  console.error("Capture error:", e);
                }
              }}
              className="flex-1 h-12 text-base font-medium bg-khp-primary hover:bg-khp-primary/90"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          </div>

          {onUseUrl && (
            <Button
              variant="outline"
              onClick={() => {
                onUseUrl();
                onClose();
              }}
              className="w-full h-12 text-base font-medium"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Use URL Instead
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
