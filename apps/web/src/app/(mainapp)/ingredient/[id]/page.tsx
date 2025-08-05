import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getIngredient } from "../../../../graphql/getIngredient";
import type { Ingredient, IngredientQuantity } from "../../../../types/stocks";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";

interface IngredientPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchIngredient(id: string): Promise<Ingredient> {
  try {
    // Get server-side headers for authentication
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

    const response = await getIngredient(id, cookieHeader);
    return response.ingredient;
  } catch (error) {
    console.error("Error fetching ingredient:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        // This should be handled by middleware, but just in case
        throw error;
      }
      if (error.message === "Ingredient not found") {
        notFound();
      }
    }

    throw error;
  }
}

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  // Calculate total stock
  const totalStock = ingredient.quantities.reduce(
    (sum: number, q: IngredientQuantity) => sum + q.quantity,
    0
  );

  return (
    <div className="flex flex-col md:flex-row gap-24">
      {/* Left Column */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pl-24">
        <div className="w-full max-w-lg space-y-6">
          {ingredient.quantities.length > 1 ? (
            <select className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 ">
              {ingredient.quantities.map(
                (q: IngredientQuantity, index: number) => (
                  <option key={index} value={q.location.id}>
                    {q.location.name}
                  </option>
                )
              )}
            </select>
          ) : (
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {ingredient.quantities[0]?.location.name || "Aucun emplacement"}
            </div>
          )}
          <div className="w-full flex justify-center items-center">
            {ingredient.image_url ? (
              <Image
                src={ingredient.image_url}
                alt={ingredient.name}
                width={300}
                height={300}
                className="object-contain w-80 h-80"
                unoptimized={process.env.NODE_ENV === "development"}
              />
            ) : (
              <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">HEINZ</div>
                  <div className="text-lg">BAKED</div>
                  <div className="text-lg">BEANS</div>
                  <div className="text-sm mt-2">in Delicious Tomato Sauce</div>
                </div>
              </div>
            )}
          </div>
          <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
            Move quantity
          </button>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-1/2 space-y-6">
        {/* Product Info */}
        <div className="bg-white rounded-lg p-6 md:pr-24">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {ingredient.name.toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mb-6">
            <Link
              href={`/category/${ingredient.categories[0]?.id || ""}`}
              className=" underline underline-offset-2 cursor-pointer"
            >
              {ingredient.categories[0]?.name}
            </Link>
          </div>

          <p className="text-gray-600 leading-relaxed">
            {ingredient.name} apporte des haricots fondants en sauce tomate
            sucrée-acidulée, idéale pour enrichir en un clin d&apos;œil purées,
            gratins ou mijotés.
          </p>
        </div>

        <div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {/* Stock Total Card */}
              <CarouselItem className="basis-[33%]">
                <div className="w-full aspect-square flex flex-col justify-center items-center bg-khp-primary rounded-xl p-6 text-white">
                  <div className="text-5xl md:text-6xl font-bold mb-4">
                    {totalStock}
                    <span className="text-2xl font-normal ml-2">
                      {ingredient.unit}
                    </span>
                  </div>
                  <div className="text-lg opacity-90">Stock total</div>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-[33%]">
                <div className="w-full aspect-square flex flex-col justify-center items-center bg-khp-primary rounded-xl p-6 text-white">
                  <div className="text-5xl md:text-6xl font-bold mb-4">
                    {totalStock}
                    <span className="text-2xl font-normal ml-2">
                      {ingredient.unit}
                    </span>
                  </div>
                  <div className="text-lg opacity-90">Stock total</div>
                </div>
              </CarouselItem>
              <CarouselItem className="basis-[33%]">
                <div className="w-full aspect-square flex flex-col justify-center items-center bg-khp-primary rounded-xl p-6 text-white">
                  <div className="text-5xl md:text-6xl font-bold mb-4">
                    {totalStock}
                    <span className="text-2xl font-normal ml-2">
                      {ingredient.unit}
                    </span>
                  </div>
                  <div className="text-lg opacity-90">Stock total</div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
