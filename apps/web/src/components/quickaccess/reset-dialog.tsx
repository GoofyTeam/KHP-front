"use client";

import { useState } from "react";
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
import { RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { resetQuickAccessAction } from "@/app/(mainapp)/settings/quick-access/actions";

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
}

export default function ResetDialog({
  open,
  onOpenChange,
  onReset,
}: ResetDialogProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setResetError(null);

    try {
      const result = await resetQuickAccessAction();
      if (result.success) {
        onReset();
        onOpenChange(false);
      } else {
        setResetError(result.error || "Erreur lors de la réinitialisation");
      }
    } catch (error) {
      setResetError("Erreur lors de la réinitialisation");
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setResetError(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <RotateCcw className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl text-gray-900">
                Réinitialiser l'accès rapide
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                Cela restaurera les paramètres par défaut
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Êtes-vous sûr de vouloir réinitialiser tous les boutons d'accès
            rapide à leurs valeurs par défaut ? Cette action écrasera votre
            configuration actuelle.
          </p>

          {resetError && (
            <div className="p-4 bg-khp-error/10 border border-khp-error/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-khp-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-khp-error font-medium leading-relaxed">
                  {resetError}
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isResetting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            disabled={isResetting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isResetting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Réinitialisation...
              </div>
            ) : (
              "Réinitialiser"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
