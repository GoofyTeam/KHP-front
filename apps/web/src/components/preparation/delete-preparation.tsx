"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Shredder } from "lucide-react";
import { deletePreparation } from "@/app/(mainapp)/preparations/[id]/actions";

function DeletePreparation({ id }: { id?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!id) {
    console.error("No id provided to DeletePreparation");
    return null;
  }

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deletePreparation(id);
      if (res.success) {
        router.push("/preparations");
      } else {
        setError(res.error || "Failed to delete preparation");
        setOpen(true);
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Delete preparation" asChild>
          <p className="hover:cursor-pointer">
            <Shredder
              className="h-6 w-6 text-khp-text-secondary"
              strokeWidth={1.5}
              size={32}
            />
          </p>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this preparation?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            preparation and remove all its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel type="button" disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? "Deleting..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeletePreparation;
