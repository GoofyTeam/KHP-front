"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
} from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Separator } from "@workspace/ui/components/separator";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-foreground/10 bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for MultiSelect component
 */
export interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option should have a label, value, and an optional icon.
   */
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the selected option values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects.
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display before showing a count.
   * Optional, defaults to 1.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to override default styles.
   */
  className?: string;

  /**
   * When true, displays a compact text format like "2 filtres sélectionnés" instead of individual badges.
   * Optional, defaults to false.
   */
  compactMode?: boolean;

  /**
   * The type of filter for compact mode display (e.g., "status", "category").
   * Optional, used to customize the compact mode text.
   */
  filterType?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation = 0,
      maxCount = 1,
      modalPopover = false,
      className,
      compactMode = false,
      filterType,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(selectedValues);
      }
    }, [defaultValue, selectedValues]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(false);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={handleTogglePopover}
            className={cn(
              "flex w-auto p-2 rounded-md border min-h-12 h-[48px] items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto touch-manipulation",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {compactMode ? (
                    <Badge
                      className={cn(
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {selectedValues.length === 1
                        ? `1 ${filterType || "filter"}`
                        : `${selectedValues.length} ${filterType || "filters"}`}
                      <XCircle
                        className="ml-2 h-5 w-5 cursor-pointer touch-manipulation p-0.5"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleClear();
                        }}
                      />
                    </Badge>
                  ) : (
                    <>
                      {selectedValues.slice(0, maxCount).map((value) => {
                        const option = options.find((o) => o.value === value);
                        const IconComponent = option?.icon;
                        return (
                          <Badge
                            key={value}
                            className={cn(
                              isAnimating ? "animate-bounce" : "",
                              multiSelectVariants({ variant })
                            )}
                            style={{ animationDuration: `${animation}s` }}
                          >
                            {IconComponent && (
                              <IconComponent className="h-4 w-4 mr-2" />
                            )}
                            {option?.label}
                            <XCircle
                              className="ml-2 !h-6 !w-6 cursor-pointer touch-manipulation p-0.5"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleOption(value);
                              }}
                            />
                          </Badge>
                        );
                      })}
                      {selectedValues.length > maxCount && (
                        <Badge
                          className={cn(
                            "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                            isAnimating ? "animate-bounce" : "",
                            multiSelectVariants({ variant })
                          )}
                          style={{ animationDuration: `${animation}s` }}
                        >
                          {`+ ${selectedValues.length - maxCount} more`}
                          <XCircle
                            className="ml-2 !h-6 !w-6 cursor-pointer touch-manipulation p-0.5"
                            onClick={(event) => {
                              event.stopPropagation();
                              clearExtraOptions();
                            }}
                          />
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="!h-6 !w-6 mx-2 cursor-pointer text-muted-foreground touch-manipulation p-1"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex min-h-6 h-full"
                  />
                  <ChevronDown className="!h-6 !w-6 cursor-pointer text-muted-foreground touch-manipulation p-1" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="!h-6 !w-6 cursor-pointer text-muted-foreground touch-manipulation p-1" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <Command>
            <CommandInput
              placeholder="Search..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer min-h-10 py-3 touch-manipulation"
                >
                  <div
                    className={cn(
                      "mr-3 flex h-5 w-5 items-center justify-center rounded-sm border border-primary touch-manipulation",
                      selectedValues.length === options.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer min-h-10 py-3 touch-manipulation"
                    >
                      <div
                        className={cn(
                          "mr-3 flex h-5 w-5 items-center justify-center rounded-sm border border-primary touch-manipulation",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={handleClear}
                        className="flex-1 justify-center cursor-pointer min-h-10 py-3 touch-manipulation"
                      >
                        Clear
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex min-h-6 h-full"
                      />
                    </>
                  )}
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    className="flex-1 justify-center cursor-pointer max-w-full min-h-10 py-3 touch-manipulation"
                  >
                    Close
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "cursor-pointer my-2 text-foreground bg-background w-3 h-3",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
