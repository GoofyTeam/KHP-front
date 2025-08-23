import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CategoryBadge } from "@workspace/ui/components/category-badge";
import { LocationSelector } from "@/components/LocationSelect";
import { LossForm } from "./loss-form";
import {
  Ingredient,
  GraphQLResponse,
  IngredientResponse,
} from "@/lib/types/ingredient";

interface LossPageProps {
  params: {
    id: string;
  };
}

const GET_INGREDIENT_QUERY = `
  query GetIngredient($id: ID!) {
    ingredient(id: $id) {
      id
      name
      image_url
      unit
      categories {
        name
      }
      quantities {
        quantity
        location {
          id
          name
        }
      }
    }
  }
`;

async function getIngredientServer(id: string): Promise<Ingredient | null> {
  try {
    const cookieStore = await cookies();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      console.error("API_URL not configured");
      return null;
    }

    // Get all cookies and format them for the request
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        query: GET_INGREDIENT_QUERY,
        variables: { id },
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const result: GraphQLResponse<IngredientResponse> = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return null;
    }

    return result.data.ingredient;
  } catch (error) {
    console.error("Failed to fetch ingredient:", error);
    return null;
  }
}

export default async function LossPage({ params }: LossPageProps) {
  const { id } = await params;

  // Fetch real ingredient data
  const ingredient = await getIngredientServer(id);

  if (!ingredient) {
    notFound();
  }

  // Calculate total stock
  const totalStock = ingredient.quantities.reduce(
    (sum, q) => sum + q.quantity,
    0
  );

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full lg:w-3/4 max-w-md">
          <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
            {ingredient.name}
          </h1>
          <CategoryBadge categories={ingredient.categories} />
        </div>

        <div className="w-full lg:w-3/4 max-w-md">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary">
            <img
              src={ingredient.image_url}
              alt={ingredient.name}
              className="w-full h-full object-cover "
            />
          </div>
        </div>
      </div>

      {/* Colonne 2 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-6">
          {/* Loss Form with validation */}
          <LossForm ingredient={ingredient} totalStock={totalStock} />
        </div>
      </div>
    </div>
  );
}
