export interface Ingredient {
  id: string;
  name: string;
  image_url?: string;
  unit: string;
  categories: {
    name: string;
  };
  quantities: {
    quantity: number;
    location: {
      name: string;
    };
  }[];
  created_at?: string;
  updated_at?: string;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export interface IngredientResponse {
  ingredient: Ingredient;
}
