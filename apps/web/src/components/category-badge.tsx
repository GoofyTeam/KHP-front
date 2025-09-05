interface Category {
  id: string;
  name: string;
}

interface CategoryBadgeProps {
  categories?: Category[] | Category | null;
}

export function CategoryBadge({ categories }: CategoryBadgeProps) {
  if (!categories) return null;

  const category: Category | undefined = Array.isArray(categories)
    ? categories.find(Boolean)
    : categories;

  if (!category) return null;

  return (
    <span className="inline-block px-4 py-2 bg-khp-background-secondary text-khp-text-secondary rounded-full text-sm font-medium">
      {category.name}
    </span>
  );
}
