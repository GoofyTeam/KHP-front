interface Category {
  id: string;
  name: string;
}

interface CategoryBadgeProps {
  categories: Category[];
}

export function CategoryBadge({ categories }: CategoryBadgeProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  const category = categories.find(Boolean) as Category | undefined;
  if (!category) return null;

  return (
    <span className="inline-block px-4 py-2 bg-khp-background-secondary text-khp-text-secondary rounded-full text-sm font-medium">
      {category.name}
    </span>
  );
}
