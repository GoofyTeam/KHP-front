import { fetchIngredient } from "@/queries/ingredient-query";
import { LossDetails } from "@/components/loss/loss-details";
import { LossForm } from "./loss-form";
import { notFound } from "next/navigation";

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

  const ingredient = await fetchIngredient(id);

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
