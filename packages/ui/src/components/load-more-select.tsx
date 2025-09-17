"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDownIcon, Loader2 } from "lucide-react";

import {
  Select,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";

export interface LoadMoreSelectOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

type SelectRootProps = Omit<
  React.ComponentProps<typeof Select>,
  "children" | "open" | "defaultOpen" | "onOpenChange"
>;

type SelectTriggerProps = React.ComponentProps<typeof SelectTrigger>;

type SelectContentProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Content>,
  "children"
>;

type LoadMoreSelectProps = SelectRootProps & {
  options: ReadonlyArray<LoadMoreSelectOption>;
  placeholder?: string;
  triggerProps?: SelectTriggerProps;
  contentProps?: SelectContentProps;
  viewportClassName?: string;
  renderOption?: (option: LoadMoreSelectOption) => React.ReactNode;
  emptyMessage?: React.ReactNode;
  hasMore?: boolean;
  loading?: boolean;
  loadingMessage?: React.ReactNode;
  loadMoreMessage?: React.ReactNode;
  onLoadMore?: () => void;
  loadMoreThreshold?: number;
  loadingIndicator?: React.ReactNode;
  loadMoreIndicator?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const DEFAULT_PLACEHOLDER = "Select an option";
const DEFAULT_EMPTY_MESSAGE = "No options available";
const DEFAULT_LOADING_MESSAGE = "Loading...";
const DEFAULT_LOAD_MORE_MESSAGE = "Scroll to load more";
const DEFAULT_THRESHOLD = 48;

export function LoadMoreSelect({
  options,
  placeholder = DEFAULT_PLACEHOLDER,
  triggerProps,
  contentProps,
  viewportClassName,
  renderOption,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  hasMore = false,
  loading = false,
  loadingMessage = DEFAULT_LOADING_MESSAGE,
  loadMoreMessage = DEFAULT_LOAD_MORE_MESSAGE,
  onLoadMore,
  loadMoreThreshold = DEFAULT_THRESHOLD,
  loadingIndicator,
  loadMoreIndicator,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  ...rootProps
}: LoadMoreSelectProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  );
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const hasRequestedRef = React.useRef(false);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const resetRequestFlag = React.useCallback(() => {
    hasRequestedRef.current = false;
  }, []);

  React.useEffect(() => {
    if (!loading) {
      resetRequestFlag();
    }
  }, [loading, resetRequestFlag]);

  const triggerLoadMore = React.useCallback(() => {
    if (!hasMore || loading || hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    onLoadMore?.();
  }, [hasMore, loading, onLoadMore]);

  const checkShouldLoadMore = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const distanceFromBottom =
      viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight);

    if (distanceFromBottom <= loadMoreThreshold) {
      triggerLoadMore();
    }
  }, [loadMoreThreshold, triggerLoadMore]);

  React.useEffect(() => {
    if (!open) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      checkShouldLoadMore();
    };

    viewport.addEventListener("scroll", handleScroll);
    checkShouldLoadMore();

    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [open, options.length, checkShouldLoadMore]);

  React.useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      checkShouldLoadMore();
    });
    return () => window.cancelAnimationFrame(id);
  }, [open, options.length, checkShouldLoadMore]);

  const renderOptionContent = React.useCallback(
    (option: LoadMoreSelectOption) => {
      if (renderOption) return renderOption(option);

      if (option.description) {
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">
              {option.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {option.description}
            </span>
          </div>
        );
      }

      return option.label;
    },
    [renderOption]
  );

  const showLoadMoreHint = hasMore && !loading;

  const {
    className: contentClassName,
    position = "popper",
    sideOffset,
    align,
    alignOffset,
    avoidCollisions,
    collisionPadding,
    sticky,
    hideWhenDetached,
    ...restContentProps
  } = contentProps ?? {};

  return (
    <Select
      {...rootProps}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          data-slot="select-content"
          className={cn(
            "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-hidden rounded-md border shadow-md",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            contentClassName
          )}
          position={position}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          avoidCollisions={avoidCollisions}
          collisionPadding={collisionPadding}
          sticky={sticky}
          hideWhenDetached={hideWhenDetached}
          {...restContentProps}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            ref={viewportRef}
            className={cn(
              "p-1 overflow-y-auto",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
              viewportClassName
            )}
          >
            {options.length === 0 && !loading ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {renderOptionContent(option)}
                </SelectItem>
              ))
            )}
            {(loading || showLoadMoreHint) && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                {loading ? (
                  <>
                    {loadingIndicator ?? (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    <span>{loadingMessage}</span>
                  </>
                ) : (
                  <>
                    {loadMoreIndicator ?? (
                      <ChevronDownIcon className="size-4" />
                    )}
                    <span>{loadMoreMessage}</span>
                  </>
                )}
              </div>
            )}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </Select>
  );
}
