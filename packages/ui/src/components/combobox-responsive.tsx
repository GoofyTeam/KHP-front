"use client";

import * as React from "react";
import { useMediaQuery } from "@uidotdev/usehooks";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { Button } from "@workspace/ui/components/button";

export type ItemComboboxResponsive = {
  value: string;
  label: string;
  entityImage: string;
  entityId: string;
  entityType: string;
  entityUnit: string;
};

export function ComboBoxResponsive({
  items,
  inputValue,
  onInputChange,
  onSelect,
  inputRef,
}: {
  items: ItemComboboxResponsive[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSelect: (item: ItemComboboxResponsive) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const triggerLabel = "Search for ingredients";

  const list = (
    <StatusList
      items={items}
      setOpen={setOpen}
      inputValue={inputValue}
      onInputChange={onInputChange}
      onSelect={onSelect}
      inputRef={inputRef}
    />
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {triggerLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-100 p-0" align="center">
          {list}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {triggerLabel}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">{list}</div>
      </DrawerContent>
    </Drawer>
  );
}

function StatusList({
  items,
  setOpen,
  inputValue,
  onInputChange,
  onSelect,
  inputRef,
}: {
  items: ItemComboboxResponsive[];
  setOpen: (open: boolean) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSelect: (item: ItemComboboxResponsive) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <Command>
      <CommandInput
        ref={inputRef}
        value={inputValue}
        onValueChange={onInputChange}
        placeholder="Search ..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {items.map((status) => (
            <CommandItem
              key={status.value}
              value={`${status.label} ${status.entityUnit}`.toLowerCase()}
              onSelect={() => {
                onSelect(status);
                setOpen(false);
              }}
              className="gap-x-2"
            >
              {status.entityImage && (
                <img
                  src={status.entityImage}
                  alt={`Picture of ${status.label}`}
                  className="h-12 w-12 rounded-md"
                />
              )}
              <span>{status.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
