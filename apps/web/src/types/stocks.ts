export interface Location {
  id: string;
  name: string;
  locationType?: {
    name: string;
  } | null;
}

export interface IngredientQuantity {
  quantity: number;
  location: Location;
}

export interface Category {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  image_url?: string | null;
  quantities: IngredientQuantity[];
  categories: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatorInfo {
  count: number;
  currentPage: number;
  firstItem: number | null;
  hasMorePages: boolean;
  lastItem: number | null;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface IngredientsResponse {
  ingredients: {
    data: Ingredient[];
    paginatorInfo: PaginatorInfo;
  };
}

export interface IngredientResponse {
  ingredient: Ingredient;
}

export interface CategoriesResponse {
  categories: {
    data: Category[];
  };
}

export interface GraphQLError {
  message: string;
  extensions?: Record<string, unknown>;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
}

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

export interface StockSummary {
  totalIngredients: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";
