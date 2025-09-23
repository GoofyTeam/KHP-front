"use client";

import React, { useTransition, useEffect, useState, useRef } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { compressImageFile } from "@workspace/ui/lib/compress-img";
import { updateCompanyLogoAction } from "@/app/(mainapp)/settings/company/actions";
import { GetCompanyOptionsDocument } from "@workspace/graphql";

export function CompanyLogoSection() {
  const apolloClient = useApolloClient();
  const { data } = useQuery(GetCompanyOptionsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data?.me?.company?.logo_path) {
      setLogoPreview(data.me.company.logo_path);
    }
  }, [data]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, {
        maxSizeBytes: 2 * 1024 * 1024,
        maxWidth: 1600,
        maxHeight: 1600,
        mimeType: "image/jpeg",
      });

      const preview = URL.createObjectURL(compressed);
      setLogoPreview(preview);
      setSelectedFile(compressed);
    } catch {
      toast.error("Image compression error");
    }
  };

  const handleSaveLogo = () => {
    if (!selectedFile) return;

    startTransition(async () => {
      try {
        const result = await updateCompanyLogoAction({ image: selectedFile });

        if (result.success) {
          toast.success("Logo updated successfully");
          setSelectedFile(null);
          await apolloClient.refetchQueries({
            include: [GetCompanyOptionsDocument],
            updateCache(cache) {
              cache.evict({ fieldName: "me" });
            },
          });
        } else {
          toast.error(result.error || "An error occurred");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleCancelLogo = () => {
    setSelectedFile(null);
    if (data?.me?.company?.logo_path) {
      setLogoPreview(data.me.company.logo_path);
    } else {
      setLogoPreview(null);
    }
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">Company Logo</h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Upload your company logo
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {logoPreview && (
            <div className="relative">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => {
                  setLogoPreview(null);
                  setSelectedFile(null);
                }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex flex-col items-center space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Choose File</span>
            </Button>
            <p className="text-xs text-khp-text/70">
              Accepted formats: JPEG, PNG, WebP, SVG (max 2MB)
            </p>

            {selectedFile && (
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleSaveLogo}
                  disabled={isPending}
                  className="bg-khp-primary hover:bg-khp-primary/90 text-white"
                >
                  {isPending ? "Saving..." : "Save Logo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelLogo}
                  disabled={isPending}
                  className="text-khp-text hover:bg-khp-primary/5"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
