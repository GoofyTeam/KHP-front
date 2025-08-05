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

export interface IngredientsData {
  data: Ingredient[];
  paginatorInfo: PaginatorInfo;
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

export interface GraphQLResponse {
  data?: {
    ingredients: IngredientsData;
  };
  errors?: GraphQLError[];
}

export interface GraphQLVariables {
  page: number;
  name?: string;
}

export interface StockSummary {
  totalIngredients: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock"; 