"use client";

import * as React from "react";
import { useQuery } from "@apollo/client";
import { Package, Search } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

import { GetIngredientsDocument } from "@workspace/graphql";

export type IngredientSearchResult = {
  id: string;
  name: string;
  image_url?: string | null;
  unit?: string | null;
  quantities?: Array<{
    location: {
      id: string;
      name: string;
    };
    quantity: number;
  }>;
};

type IngredientSearchProps = {
  onSelect: (ingredient: IngredientSearchResult) => void;
  placeholder?: string;
  className?: string;
};

export const IngredientSearch: React.FC<IngredientSearchProps> = ({
  onSelect,
  placeholder = "Search ingredients...",
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { data: searchData, loading: searchLoading } = useQuery(
    GetIngredientsDocument,
    {
      variables: {
        page: 1,
        search: searchQuery || undefined,
      },
      skip: !searchQuery,
      fetchPolicy: "cache-and-network",
    }
  );

  const searchResults = React.useMemo(() => {
    if (!searchData?.ingredients?.data) return [];
    return searchData.ingredients.data;
  }, [searchData]);

  const handleSelectIngredient = React.useCallback(
    (ingredient: IngredientSearchResult) => {
      onSelect(ingredient);
      setSearchQuery("");
      setIsSearchOpen(false);
    },
    [onSelect]
  );

  const handleInputChange = React.useCallback((value: string) => {
    setSearchQuery(value);
    setIsSearchOpen(value.length > 0);
  }, []);

  const handleInputFocus = React.useCallback(() => {
    if (searchQuery.length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchQuery]);

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          variant="khp-default"
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="pl-10 h-12"
        />
      </div>

      {isSearchOpen && searchQuery && (
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger className="sr-only" />
          <PopoverContent
            className="p-0 w-[min(720px,90vw)]"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                {searchLoading && <CommandEmpty>Recherche...</CommandEmpty>}
                {!searchLoading && searchResults.length === 0 && (
                  <CommandEmpty>Aucun résultat</CommandEmpty>
                )}
                {searchResults.length > 0 && (
                  <CommandGroup heading="Results">
                    {searchResults.map((ingredient) => (
                      <CommandItem
                        key={ingredient.id}
                        value={ingredient.name}
                        onSelect={() => handleSelectIngredient(ingredient)}
                        className="cursor-pointer gap-3"
                      >
                        <div className="relative size-8 rounded-md overflow-hidden shrink-0 ring-1 ring-muted">
                          {ingredient.image_url ? (
                            <img
                              src={ingredient.image_url}
                              alt={ingredient.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="flex-1">{ingredient.name}</span>
                        <span className="text-xs rounded px-2 py-0.5 bg-muted">
                          Ingredient
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
