"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@workspace/ui/lib/utils";

const Tabs = TabsPrimitive.Root;

const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        "khp-default": "border border-khp-primary bg-white/40",
      },
      size: {
        md: "h-9",
        lg: "h-10",
        xl: "h-11",
        xxl: "h-12",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      autoHeight: {
        true: "h-auto",
        false: "",
      },
    },
    defaultVariants: {
      variant: "khp-default",
      size: "md",
      fullWidth: false,
    },
  }
);

const tabsTriggerVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
  ].join(" "),
  {
    variants: {
      variant: {
        "khp-default":
          "data-[state=active]:bg-khp-primary/40 hover:bg-khp-primary/60",
      },
      size: {
        md: "px-3 py-1 text-sm mx-2",
        lg: "px-4 py-2 text-base mx-3",
        xl: "px-5 py-3 text-lg mx-4",
        xxl: "px-6 py-4 text-xl mx-5",
      },
      fullWidth: {
        true: "flex-1",
        false: "",
      },
    },
    compoundVariants: [],
    defaultVariants: {
      variant: "khp-default",
      size: "md",
      fullWidth: false,
    },
  }
);

/* ---------------- Components ---------------- */

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, autoHeight, fullWidth, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      tabsListVariants({ variant, size, fullWidth, autoHeight }),
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, fullWidth, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size, fullWidth }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
};
