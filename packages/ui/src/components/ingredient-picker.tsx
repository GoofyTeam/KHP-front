"use client";

import * as React from "react";
import { Input } from "@workspace/ui/components/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Trash, Search } from "lucide-react";

export type IngredientSearchResult = {
  id: string;
  name: string;
  imageUrl?: string | null;
  kind: "ingredient" | "preparation";
  unit: string;
  defaultLocationId?: string | null;
  locations?: { id: string; name: string; quantityInLocation: number }[];
};

export type PickedItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
  kind: "ingredient" | "preparation";
  unit: string;
  quantity: number;
  locationId?: string | null;
  locations?: { id: string; name: string; quantityInLocation: number }[];
};

type Props = {
  label?: string;
  placeholder?: string;

  query: string;
  onQueryChange: (q: string) => void;

  results: IngredientSearchResult[];
  loading?: boolean;

  items: PickedItem[];
  onAdd: (picked: PickedItem) => void;
  onRemove: (id: string) => void;
  onChangeQuantity: (id: string, qty: number) => void;
  onChangeLocation: (id: string, locationId: string) => void;
  onChangeUnit: (id: string, unit: string) => void;

  unitsSelections?: { value: string; label: string }[];

  className?: string;
};

export function IngredientPickerUI({
  label = "Ingredients",
  placeholder = "Search ingredient or preparation...",
  query,
  onQueryChange,
  results,
  loading,
  items,
  onAdd,
  onRemove,
  onChangeQuantity,
  onChangeLocation,
  onChangeUnit,
  className,
  unitsSelections,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const cmdInputRef = React.useRef<HTMLInputElement>(null);

  const openAndFocus = (next: boolean) => {
    setOpen(next);
    if (next) {
      requestAnimationFrame(() => {
        cmdInputRef.current?.focus();
        cmdInputRef.current?.select?.();
      });
    }
  };

  const handlePick = (r: IngredientSearchResult) => {
    onAdd({
      id: r.id,
      name: r.name,
      imageUrl: r.imageUrl ?? undefined,
      kind: r.kind,
      unit: r.unit,
      quantity: 1,
      locationId: r.defaultLocationId ?? undefined,
      locations: r.locations ?? [],
    });
    openAndFocus(false);
    (document.activeElement as HTMLElement | null)?.blur?.();
  };

  return (
    <div className={className}>
      <Label className="text-xl font-semibold">{label}</Label>

      <Popover open={open} onOpenChange={openAndFocus} modal>
        {/* Trigger = faux input (button) pour éviter le ping-pong de focus */}
        <PopoverTrigger asChild>
          <Button
            type="button"
            role="combobox"
            variant="khp-default"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => openAndFocus(true)}
            className="w-full justify-start mt-2 text-khp-primary bg-white hover:bg-white/70 ring-1 ring-khp-primary hover:ring-khp-primary/50"
          >
            <Search className="h-4 w-4 opacity-60" />
            <span className={`truncate grow ${!query ? "opacity-50" : ""}`}>
              {query || placeholder}
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[min(720px,90vw)]"
          align="start"
          onOpenAutoFocus={(e) => {
            // Empêche Radix de refocus le trigger; focus le champ interne
            e.preventDefault();
            cmdInputRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            // Évite un re-focus qui ré-ouvre
            e.preventDefault();
          }}
        >
          <Command shouldFilter={false}>
            {/* Seul vrai champ focusable */}
            <CommandInput
              ref={cmdInputRef}
              value={query}
              onValueChange={onQueryChange}
              placeholder={placeholder}
            />
            <CommandList>
              {loading && <CommandEmpty>Recherche…</CommandEmpty>}
              {!loading && results.length === 0 && (
                <CommandEmpty>Aucun résultat</CommandEmpty>
              )}
              {results.length > 0 && (
                <CommandGroup heading="Résultats">
                  {results.map((r) => (
                    <CommandItem
                      key={r.id}
                      value={r.name}
                      onSelect={() => handlePick(r)}
                      className="cursor-pointer gap-3"
                    >
                      <div className="relative size-8 rounded-md overflow-hidden shrink-0 ring-1 ring-muted">
                        {r.imageUrl ? (
                          <img
                            src={r.imageUrl}
                            alt={r.name}
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="flex-1">{r.name}</span>
                      <span className="text-xs rounded px-2 py-0.5 bg-muted">
                        {r.kind === "preparation"
                          ? "Préparation"
                          : "Ingrédient"}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Card className="mt-3 border-2 border-khp-primary/70 bg-background">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-khp-primary/80">
            <p className="text-xl mt-2">No ingredient yet</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 py-3 px-2">
              {items.map((it) => {
                return (
                  <div
                    key={it.id}
                    className="grid grid-cols-4 gap-4 items-center"
                  >
                    <div className="flex items-center gap-3">
                      {it.imageUrl && (
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="object-cover h-12 w-12 rounded-md ring-1 ring-muted"
                        />
                      )}
                      <p className="font-medium truncate">{it.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="string"
                        className="min-w-12 h-9 text-right"
                        variant="khp-default"
                        value={it.quantity}
                        onChange={(e) =>
                          onChangeQuantity(it.id, Number(e.target.value || 0))
                        }
                      />
                      <Select
                        value={it.unit}
                        onValueChange={(v) => onChangeUnit(it.id, v)}
                      >
                        <SelectTrigger className="w-auto h-9">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitsSelections?.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Select
                      value={it.locationId || undefined}
                      onValueChange={(v) => onChangeLocation(it.id, v)}
                      disabled={!it.locations || it.locations.length === 0}
                    >
                      <SelectTrigger className="w-auto h-9">
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {it.locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name} ({loc.quantityInLocation.toFixed(2)}{" "}
                            {it.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(it.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
