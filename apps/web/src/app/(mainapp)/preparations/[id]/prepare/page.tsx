import { CategoryBadge } from "@/components/category-badge";
import { GetPreparationByIdDocument } from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { Button } from "@workspace/ui/components/button";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PreparePreparationForm from "@/components/preparation/prepare-form";

export default async function PreparePreparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error, loading } = await query({
    query: GetPreparationByIdDocument,
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  const preparation = data.preparation;
  const hasEnoughStock = (preparation?.preparable_quantity?.quantity ?? 0) > 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasEnoughStock) {
    redirect(`/preparations/${preparation?.id}`);
  }

  if (!preparation) {
    redirect("/preparations");
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full items-center justify-center py-2 ">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full max-w-lg relative">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 max-w-xs lg:max-w-md text-wrap">
              {preparation?.name}
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <CategoryBadge categories={preparation?.categories || []} />
          </div>
        </div>
        <div className="w-full lg:w-3/4 max-w-lg">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
            {preparation?.image_url ? (
              <img
                src={preparation.image_url}
                alt={preparation.name}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <ImagePlaceholder className="w-full h-full rounded-lg" />
            )}
          </div>
        </div>

        <div className="hidden lg:block">
          <Button variant="link" asChild>
            <Link href={`/preparations/${id}`} className="text-khp-primary">
              <ChevronLeft /> Back to details
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col w-full lg:w-1/2 gap-y-4">
        <PreparePreparationForm id={id} preparation_data={preparation} />
      </div>
    </div>
  );
}
