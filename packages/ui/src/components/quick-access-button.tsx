"use client";

import { FC, ReactElement, cloneElement, isValidElement } from "react";
import {
  Plus,
  Notebook,
  Minus,
  Calendar,
  Check,
  type LucideProps,
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import {
  normalizeQuickAccessColor,
  quickAccessBgClassByColor,
  type QuickAccessNormalizedColor,
} from "@workspace/ui/lib/quick-access-utils";

export {
  normalizeQuickAccessColor,
  quickAccessBgClassByColor,
  getQuickAccessBgClass,
  quickAccessUrlMap,
  getQuickAccessUrl,
  type QuickAccessNormalizedColor,
} from "@workspace/ui/lib/quick-access-utils";

type ColorKey = string;

type SizeType = "sm" | "md" | "lg";

type BaseProps = {
  title: string;
  icon: string;
  color: ColorKey;
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

const sizeMap: Record<
  SizeType,
  { circle: string; icon: string; title: string; subtitle: string }
> = {
  sm: {
    circle: "w-full aspect-square max-w-[7.5rem] md:max-w-[8.5rem]",
    icon: "w-[60%] h-[60%]",
    title: "text-xs md:text-sm mt-2",
    subtitle: "text-[10px]",
  },
  md: {
    circle: "w-full aspect-square max-w-[8.5rem] md:max-w-[9.5rem]",
    icon: "w-[65%] h-[65%]",
    title: "text-sm md:text-base mt-4",
    subtitle: "text-[11px]",
  },
  lg: {
    circle: "w-full aspect-square max-w-[10rem] md:max-w-[11rem]",
    icon: "w-[70%] h-[70%]",
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

  const iconKey = String(icon);
  const normalizedIcon = iconKey.toLowerCase();
  const IconComponent: FC<LucideProps> =
    normalizedIcon === "plus"
      ? Plus
      : normalizedIcon === "note" || normalizedIcon === "notebook"
        ? Notebook
        : normalizedIcon === "minus"
          ? Minus
          : normalizedIcon === "calendar"
            ? Calendar
            : normalizedIcon === "check"
              ? Check
              : Plus;

  const normalizedColor = normalizeQuickAccessColor(color);

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

      <div className="flex-1 flex items-center justify-center w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%]">
        <div
          className={cn(
            "rounded-full flex items-center justify-center text-white",
            quickAccessBgClassByColor[normalizedColor],
            sz.circle
          )}
        >
          <IconComponent className={sz.icon} aria-hidden />
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
