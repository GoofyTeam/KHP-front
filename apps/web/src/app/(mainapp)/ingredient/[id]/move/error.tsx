"use client";

import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function MovePageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Move page error:", error);
  }, [error]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      {/* Colonne 1 */}
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        {/* Back button */}
        <div className="w-full lg:w-3/4 max-w-md">
          <Link href="/ingredient">
            <Button
              variant="ghost"
              className="mb-4 text-khp-text-secondary hover:text-khp-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux ingrédients
            </Button>
          </Link>
        </div>

        {/* Error Title */}
        <div className="text-center space-y-4 w-full lg:w-3/4 max-w-md">
          <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
            Erreur
          </h1>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        </div>

        {/* Error Image Placeholder */}
        <div className="w-full lg:w-3/4 max-w-md">
          <div className="aspect-square rounded-xl overflow-hidden bg-red-50 flex items-center justify-center border border-red-200">
            <div className="text-center text-red-400">
              <AlertCircle className="h-16 w-16 mx-auto mb-2" />
              <div className="text-sm">Page non disponible</div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne 2 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center mb-10 lg:mb-0">
        <div className="w-full lg:w-3/4 max-w-md flex flex-col gap-6">
          {/* Error Description */}
          <div>
            <h2 className="text-xl font-semibold text-khp-text-primary mb-4">
              Erreur de chargement
            </h2>
            <p className="text-khp-text-secondary mb-6">
              Une erreur est survenue lors du chargement de la page de
              déplacement. Cela peut être dû à un problème de connexion ou à une
              erreur temporaire.
            </p>
          </div>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">
                Détails de l&apos;erreur (dev only):
              </h3>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={reset}
              className="flex items-center justify-center w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>

            <Link href="/ingredient">
              <Button variant="outline" className="w-full">
                Retour aux ingrédients
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
