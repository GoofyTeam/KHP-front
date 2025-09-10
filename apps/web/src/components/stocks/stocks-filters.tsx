"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { Search, MoreVertical } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { MultiSelect } from "@workspace/ui/components/multi-select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

interface Category {
  id: string;
  name: string;
}

import { useStocksStore } from "@/stores/stocks-store";

interface StocksFiltersProps {
  initialCategories: Category[];
}

export default function StocksFilters({
  initialCategories,
}: StocksFiltersProps) {
  const { isRegisterLostMode, setIsRegisterLostMode, setFilters, filters } =
    useStocksStore();

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [categoryFilters, setCategoryFilters] = useState<string[]>(
    filters.categoryIds || []
  );

  const debouncedSearchTerm = useDebounce(searchInput.trim(), 400);
  const debouncedCategories = useDebounce(categoryFilters, 100); // Reduced delay for better reactivity

  const categoryOptions = useMemo(() => {
    console.log(
      `📊 Categories loaded: ${initialCategories.length}`,
      initialCategories
    );
    return initialCategories
      .map((cat) => ({
        label: cat.name,
        value: cat.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)); // Tri alphabétique
  }, [initialCategories]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setCategoryFilters(categories);
  }, []);

  const handleRegisterLost = useCallback(() => {
    setIsRegisterLostMode(true);
  }, [setIsRegisterLostMode]);

  const handleCancelRegisterLost = useCallback(() => {
    setIsRegisterLostMode(false);
  }, [setIsRegisterLostMode]);

  const handleAddToStock = useCallback(() => {
    console.log("Adding to stock...");
  }, []);

  useEffect(() => {
    setFilters({
      search: debouncedSearchTerm,
      categoryIds: debouncedCategories,
    });
  }, [debouncedSearchTerm, debouncedCategories, setFilters]);

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex flex-col-reverse md:flex-row w-full items-center gap-2">
        <div className="flex w-full md:w-auto items-center space-x-2">
          <MultiSelect
            options={categoryOptions}
            onValueChange={handleCategoriesChange}
            value={categoryFilters}
            placeholder="Select categories"
            variant="default"
            className="w-full md:w-auto"
          />
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isRegisterLostMode ? (
                  <DropdownMenuItem
                    onClick={handleCancelRegisterLost}
                    className="text-destructive focus:text-destructive"
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancelRegisterLost}
                      className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Cancel
                    </Button>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleRegisterLost}
                    className="text-destructive focus:text-destructive"
                  >
                    <Button
                      variant="khp-destructive"
                      onClick={handleRegisterLost}
                      className="w-full"
                    >
                      Register loss
                    </Button>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleAddToStock}>
                  <Button
                    variant="khp-default"
                    onClick={handleAddToStock}
                    className="w-full"
                  >
                    Add to stock
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            name="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-full h-[48px]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="hidden md:flex items-center space-x-2">
          {isRegisterLostMode ? (
            <Button
              variant="outline"
              onClick={handleCancelRegisterLost}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="khp-destructive" onClick={handleRegisterLost}>
                Register loss
              </Button>
              <Button variant="khp-default" onClick={handleAddToStock}>
                Add to stock
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
