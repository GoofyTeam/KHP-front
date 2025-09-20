import { PublicMenuCard } from "@/components/restaurant-card/public-menu-card";
import { fetchRestaurantCard } from "@/queries/restaurant-card-query";

export const revalidate = 0;

interface PublicMenuCardPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function PublicMenuCardPage({
  params,
}: PublicMenuCardPageProps) {
  const { publicId } = await params;
  const decodedPublicId = decodeURIComponent(publicId);
  const result = await fetchRestaurantCard(decodedPublicId);

  if (result.status === "success") {
    return <PublicMenuCard company={result.company} />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-100 px-4 py-16 text-center text-slate-700">
      <div className="max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white px-6 py-12 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          {result.status === "not-found"
            ? "Menu card not found"
            : result.status === "invalid-slug"
              ? "Invalid public address"
              : "Something went wrong"}
        </h1>
        <p className="text-sm leading-relaxed text-slate-600">
          {result.message ||
            "We couldn't load this menu card yet. Please try again in a moment."}
        </p>
      </div>
    </div>
  );
}
