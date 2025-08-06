import { cn } from "../lib/utils";

interface CategoryBadgeProps {
  categories: { name: string }[] | { name: string } | string | null | undefined;
  className?: string;
}

export function CategoryBadge({ categories, className }: CategoryBadgeProps) {
  const getCategoryText = () => {
    if (!categories) return "No category";

    if (typeof categories === "string") {
      return categories;
    }

    if (Array.isArray(categories)) {
      return categories.map((c) => c.name).join(", ");
    }

    return categories.name || "No category";
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full font-medium bg-khp-info/10 text-khp-info",
        className
      )}
    >
      {getCategoryText()}
    </span>
  );
}
