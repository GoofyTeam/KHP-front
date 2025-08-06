import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { CategoryBadge } from "@workspace/ui/components/category-badge";
import { LossQuantityInput } from "./loss-quantity-input";
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
      {/* Colonne 1 */}
      <div className="flex flex-col gap-4 justify-center items-center w-full lg:w-1/2">
        {/* Product Title */}
        <div className="space-y-2 w-full lg:w-3/4 max-w-md">
          <h1 className="text-2xl lg:text-4xl font-bold text-khp-text-primary leading-tight">
            {ingredient.name}
          </h1>
          <div className="flex items-center gap-2">
            <CategoryBadge categories={ingredient.categories} />
          </div>
        </div>

        <div className="w-full lg:w-3/4 max-w-md">
          <img
            src={ingredient.image_url}
            alt={ingredient.name}
            className="w-full h-full max-h-128"
          />
        </div>
      </div>

      {/* Colonne 2 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center mb-10 lg:mb-0">
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-6">
          {/* Location Selection */}
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-khp-text-primary">
              Location
            </h3>
            {ingredient.quantities.length > 1 ? (
              <Select>
                <SelectTrigger className="w-full h-12 border-khp-primary bg-white hover:bg-khp-primary/5 focus:bg-khp-primary/5 transition-all">
                  <SelectValue placeholder="Choose location" />
                </SelectTrigger>
                <SelectContent>
                  {ingredient.quantities.map((q, index: number) => (
                    <SelectItem key={index} value={index.toString()}>
                      <span className="font-medium">{q.location.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-white border border-khp-primary rounded-lg">
                <span className="font-medium text-khp-text-primary">
                  {ingredient.quantities[0]?.location.name || "No location"}
                </span>
              </div>
            )}
          </div>

          {/* Current Stock */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-khp-text-primary">
              Current Stock
            </h3>
            <div className="flex items-center justify-between p-4 bg-khp-primary/5 border border-khp-primary/20 rounded-lg">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-khp-primary">
                  {totalStock}
                </span>
                <span className="text-sm text-khp-text-secondary">
                  {ingredient.unit}
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 bg-khp-primary/10 rounded-full border border-khp-primary/30">
                <svg
                  className="w-5 h-5 text-khp-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Loss Quantity Input */}
          <div className="border-t border-khp-border">
            <LossQuantityInput totalStock={totalStock} unit={ingredient.unit} />
          </div>

          {/* Add Loss Button */}
          <div className="mt-8 pt-6 border-t border-khp-border">
            <Button
              variant="destructive"
              size="xl"
              className="w-full py-4 px-6 text-base font-semibold"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Add Loss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
