import {
  GetIngredient,
  GetIngredientQuery,
} from "../graphql/getIngredient.gql";
import {
  OpenFoodFactsProxy,
  OpenFoodFactsProxyQuery,
} from "../graphql/openFoodFactsProxy.gql";
import { HandleItemSearch } from "../routes/_protected/handle-item";
import { graphqlRequest } from "./graph-client";

export type WantedDataType = {
  product_image: string;
  product_name: string;
  product_category: string[];
  product_units: string;
  product_base_quantity?: string;
  product_already_in_database?: boolean;
  product_internal_id?: string;
  quantities?: NonNullable<GetIngredientQuery["ingredient"]>["quantities"];
};

const toStringArray = (value: unknown): string[] => {
  if (!value) return [];

  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return (value as Array<unknown>)
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }

  return [];
};

const handleScanType = async (
  mode: HandleItemSearch["mode"],
  productId: string | undefined
) => {
  let wantedData: WantedDataType = {
    product_image: "",
    product_name: "",
    product_category: [],
    product_units: "",
  };

  if (mode === "barcode") {
    //First we need to fetch by barcode with classic query, then if nothing found,
    // we call the OpenFoodFacts endpoint
    const resultByBarcode = await graphqlRequest<GetIngredientQuery>(
      GetIngredient,
      { barcode: productId! }
    );
    if (resultByBarcode.ingredient) {
      const categories =
        resultByBarcode.ingredient.categories?.map((cat) => cat?.name ?? "") ??
        [];

      wantedData = {
        product_image: resultByBarcode.ingredient.image_url ?? "",
        product_name: resultByBarcode.ingredient.name ?? "",
        product_category: toStringArray(categories),
        product_units: resultByBarcode.ingredient.unit ?? "",
        product_already_in_database: true,
        product_internal_id: resultByBarcode.ingredient.id ?? undefined,
        product_base_quantity:
          resultByBarcode.ingredient.base_quantity.toString(),
        quantities: resultByBarcode.ingredient.quantities,
      };
      return wantedData;
    }

    const result = await graphqlRequest<OpenFoodFactsProxyQuery>(
      OpenFoodFactsProxy,
      {
        barcode: productId,
        page: 1,
      }
    );
    if (!result.search) {
      throw new Error("Product not found");
    }

    const product_base_quantity =
      result.search.base_quantity != null
        ? String(result.search.base_quantity)
        : undefined;

    wantedData = {
      product_image: result.search.imageUrl ?? "",
      product_name: result.search.product_name ?? "",
      product_category: toStringArray(result.search.categories),
      product_units: result.search.unit ?? "",
      product_base_quantity,
      product_already_in_database:
        result.search.is_already_in_database ?? false,
      product_internal_id: result.search.ingredient_id ?? undefined,
    };
  } else if (mode === "internalId") {
    const result = await graphqlRequest<GetIngredientQuery>(GetIngredient, {
      id: productId,
    });

    if (!result.ingredient) {
      throw new Error("Product not found");
    }

    const categories =
      result.ingredient.categories?.map((cat) => cat?.name ?? "") ?? [];

    wantedData = {
      product_image: result.ingredient.image_url ?? "",
      product_name: result.ingredient.name ?? "",
      product_category: toStringArray(categories),
      product_units: result.ingredient.unit ?? "",
      product_already_in_database: true,
      product_internal_id: result.ingredient.id ?? undefined,
      product_base_quantity: result.ingredient.base_quantity.toString(),
      quantities: result.ingredient.quantities,
    };
  } else if (mode === "manual") {
    wantedData = {
      product_image: "",
      product_name: "",
      product_category: [],
      product_units: "",
      product_already_in_database: false,
      product_internal_id: undefined,
    };
  }

  wantedData.product_category = Array.from(
    new Set(
      wantedData.product_category.map((cat) => cat.trim()).filter(Boolean)
    )
  );

  return wantedData;
};

export default handleScanType;
