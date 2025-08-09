import Link from "next/link";

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

  const category = categories[0];

  return (
    <Link
      href={`/category/${category.id}`}
      className="inline-block px-4 py-2 bg-khp-background-secondary text-khp-text-secondary rounded-full text-sm font-medium hover:bg-khp-primary hover:text-white transition-colors duration-200"
    >
      {category.name}
    </Link>
  );
}
