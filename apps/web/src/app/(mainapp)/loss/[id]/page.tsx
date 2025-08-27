import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import {
  GetIngredientDocument,
  GetIngredientQuery,
} from "@/graphql/generated/graphql";
import { LossDetails } from "@/components/loss/loss-details";
import { LossForm } from "./loss-form";

interface LossPageProps {
  params: Promise<{
    id: string;
    j: any;
  }>;
}

async function fetchIngredient(
  id: string
): Promise<NonNullable<GetIngredientQuery["ingredient"]>> {
  const { data, error } = await query({
    query: GetIngredientDocument,
    variables: { id },
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  if (!data?.ingredient) {
    notFound();
  }

  return data.ingredient;
}

export default async function LossPage({ params }: LossPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
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
