"use client";

import { FC, ReactElement, cloneElement, isValidElement } from "react";
import { Plus, Notebook } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type IconType = "plus" | "note";
type ColorType = "green" | "red";
type SizeType = "sm" | "md" | "lg";

type BaseProps = {
  title: string;
  icon: IconType;
  color: ColorType;
  size?: SizeType;
  className?: string;
  subtitle?: string;
  stretch?: boolean;
};

type WithOnClick = BaseProps & {
  onClick: () => void;
  asChild?: false;
  children?: never;
};

type WithAsChild = BaseProps & {
  asChild: true;
  children: ReactElement<{ className?: string }>;
  onClick?: never;
};

type QuickAccessButtonProps = WithOnClick | WithAsChild;

const circleColors: Record<ColorType, string> = {
  green: "bg-khp-primary",
  red: "bg-khp-error",
};

const sizeMap: Record<
  SizeType,
  { circle: string; icon: string; title: string; subtitle: string }
> = {
  sm: {
    circle: "w-20 h-20 md:w-24 md:h-24",
    icon: "w-10 h-10 md:w-12 md:h-12",
    title: "text-xs md:text-sm mt-2",
    subtitle: "text-[10px]",
  },
  md: {
    circle: "w-24 h-24 md:w-28 md:h-28",
    icon: "w-14 h-14 md:w-16 md:h-16",
    title: "text-sm md:text-base mt-4",
    subtitle: "text-[11px]",
  },
  lg: {
    circle: "w-28 h-28 md:w-32 md:h-32",
    icon: "w-16 h-16 md:w-18 md:h-18",
    title: "text-base mt-6",
    subtitle: "text-sm",
  },
};

export const QuickAccessButton: FC<QuickAccessButtonProps> = ({
  title,
  icon,
  color,
  size = "md",
  stretch = false,
  className = "",
  subtitle,
  asChild = false,
  children,
  ...rest
}) => {
  const sz = sizeMap[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-between border border-khp-primary/30 rounded-md transition p-3",
        stretch ? "w-full h-full" : "w-full aspect-square"
      )}
    >
      <span className={cn("text-center font-medium text-gray-800", sz.title)}>
        {title}
      </span>

      <div className="flex-1 flex items-center justify-center">
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white",
            circleColors[color],
            sz.circle
          )}
        >
          {icon === "plus" ? (
            <Plus className={sz.icon} aria-hidden />
          ) : (
            <Notebook className={sz.icon} aria-hidden />
          )}
        </div>
      </div>

      {subtitle && (
        <p className={cn("text-center text-gray-500 mt-2", sz.subtitle)}>
          {subtitle}
        </p>
      )}
    </div>
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(
      children,
      {
        className: cn(
          "inline-flex w-full h-full",
          children.props.className,
          className
        ),
        ...rest,
      },
      content
    );
  }

  return (
    <button {...rest} className={cn("w-full h-full", className)}>
      {content}
    </button>
  );
};
