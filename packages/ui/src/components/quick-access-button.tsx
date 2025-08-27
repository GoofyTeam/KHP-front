"use client";

import { FC, ReactElement, cloneElement, isValidElement } from "react";
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

const Icons: Record<IconType, (cls?: string) => React.ReactElement> = {
  plus: (cls) => (
    <svg className={cls} viewBox="0 0 73 73" fill="none">
      <path
        d="M36.1125 2.95984L36.1126 70.0398"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M69.6492 36.5032L2.56914 36.5032"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  ),
  note: (cls) => (
    <svg className={cls} viewBox="0 0 41 41" fill="none">
      <path
        d="M22.6759 3.51929L10.4512 3.51929C9.57495 3.51929 8.73457 3.86739 8.11495 4.487C7.49534 5.10662 7.14724 5.947 7.14724 6.82327L7.14724 33.2551C7.14724 34.1314 7.49534 34.9718 8.11495 35.5914C8.73457 36.211 9.57495 36.5591 10.4512 36.5591L30.2751 36.5591C31.1514 36.5591 31.9917 36.211 32.6114 35.5914C33.231 34.9718 33.5791 34.1314 33.5791 33.2551L33.5791 21.0304M3.84326 10.1272L10.4512 10.1272M3.84326 16.7352L10.4512 16.7352M3.84326 23.3432L10.4512 23.3432M3.84326 29.9511L10.4512 29.9511M35.8555 9.5094C36.5136 8.85133 36.8833 7.95878 36.8833 7.02812C36.8833 6.09745 36.5136 5.20491 35.8555 4.54683C35.1974 3.88875 34.3049 3.51904 33.3742 3.51904C32.4436 3.51904 31.551 3.88875 30.8929 4.54683L22.6165 12.8266C22.2237 13.2191 21.9362 13.7044 21.7806 14.2374L20.3979 18.9786C20.3564 19.1208 20.3539 19.2714 20.3907 19.4149C20.4274 19.5583 20.502 19.6892 20.6067 19.794C20.7114 19.8987 20.8424 19.9733 20.9858 20.01C21.1293 20.0468 21.2799 20.0443 21.4221 20.0028L26.1633 18.6201C26.6963 18.4645 27.1815 18.177 27.5741 17.7842L35.8555 9.5094Z"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const sizeMap: Record<
  SizeType,
  { circle: string; icon: string; title: string; subtitle: string }
> = {
  sm: {
    circle: "w-14 h-14 md:w-16 md:h-16",
    icon: "w-8 h-8 md:w-9 md:h-9",
    title: "text-xs md:text-sm",
    subtitle: "text-[10px]",
  },
  md: {
    circle: "w-16 h-16 md:w-20 md:h-20",
    icon: "w-10 h-10 md:w-12 md:h-12",
    title: "text-xs md:text-sm",
    subtitle: "text-[10px]",
  },
  lg: {
    circle: "w-20 h-20 md:w-24 md:h-24",
    icon: "w-12 h-12 md:w-14 md:h-14",
    title: "text-sm",
    subtitle: "text-[11px]",
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
        "flex flex-col items-center justify-between border border-khp-primary/30 rounded-md transition p-2",
        stretch ? "w-full h-full" : "w-full aspect-square"
      )}
    >
      <span className={cn("text-center font-medium text-gray-800", sz.title)}>
        {title}
      </span>
      <div className="flex-1 flex items-center justify-center">
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            circleColors[color],
            sz.circle
          )}
        >
          {Icons[icon](sz.icon)}
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
