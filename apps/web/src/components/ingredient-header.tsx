"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function IngredientHeader() {
  const pathname = usePathname();
  const isMovePage = pathname.includes("/move");

  return (
    <>
      {/* Mobile header */}
      <header className="bg-background sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b p-4 md:hidden">
        {isMovePage && (
          <Link href={pathname.replace("/move", "")}>
            <Button variant="ghost" size="sm" className="p-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <h1 className="text-lg font-semibold">
          {isMovePage ? "Move - Ingredient" : "Ingredient"}
        </h1>
      </header>

      {/* Desktop header */}
      <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          {isMovePage && (
            <Link href={pathname.replace("/move", "")} className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-semibold">
            {isMovePage ? "Move - Ingredient" : "Ingredient"}
          </h1>
        </div>
      </div>
    </>
  );
}
