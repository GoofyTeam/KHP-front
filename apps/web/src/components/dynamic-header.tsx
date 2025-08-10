"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useIngredient } from "./ingredient-context";

export function DynamicHeader() {
  const pathname = usePathname();
  const { ingredientName } = useIngredient();

  const getPageInfo = () => {
    if (pathname.includes("/ingredient/") && pathname.includes("/move")) {
      return {
        title: `Déplacer - ${ingredientName || "Ingrédient"}`,
        showBackButton: true,
        backUrl: pathname.replace("/move", ""),
      };
    }

    if (pathname.includes("/ingredient/")) {
      return {
        title: ingredientName || "Détails de l'ingrédient",
        showBackButton: false,
        backUrl: null,
      };
    }

    return {
      title: "Gestion des Stocks",
      showBackButton: false,
      backUrl: null,
    };
  };

  const { title, showBackButton, backUrl } = getPageInfo();

  return (
    <>
      {/* Mobile header */}
      <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
        {showBackButton && backUrl && (
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>

      {/* Desktop header */}
      <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          {showBackButton && backUrl && (
            <Link href={backUrl} className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
      </div>
    </>
  );
}
