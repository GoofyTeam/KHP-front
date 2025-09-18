import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import { GetIngredientDocument } from "@/graphql/generated/graphql";
import { LossDetails } from "@/components/loss/loss-details";
import { LossForm } from "./loss-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LossPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LossPage({ params }: LossPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const { data, error } = await query({
    query: GetIngredientDocument,
    variables: { id },
  });

  if (error) {
    throw new Error(`GraphQL error: ${error.message}`);
  }

  if (!data?.ingredient) {
    notFound();
  }

  const ingredient = data.ingredient;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-8 justify-start items-center w-full lg:w-1/2">
        <LossDetails ingredient={ingredient} />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-6">
          <LossForm ingredient={ingredient} />
        </div>
      </div>
    </div>
  );
}
