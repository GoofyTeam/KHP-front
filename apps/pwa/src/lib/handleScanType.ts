import {
  GetIngredientDocument,
  type GetIngredientQuery,
  OpenFoodFactsProxyDocument,
  type OpenFoodFactsProxyQuery,
} from "@workspace/graphql";
import { HandleItemSearch } from "../routes/_protected/handle-item";
import { graphqlRequest } from "./graph-client";
import { graphqlRequestWithOffline } from "./offline-graphql";
import {
  saveIngredientSnapshot,
  getIngredientSnapshotById,
  getIngredientSnapshotByBarcode,
} from "./ingredient-cache";

export type WantedDataType = {
  product_image: string;
  product_name: string;
  product_category: NonNullable<GetIngredientQuery["ingredient"]>["category"];
  product_units: string;
  product_base_unit: string;
  product_base_quantity?: string;
  product_already_in_database?: boolean;
  product_internal_id?: string;
  quantities?: NonNullable<GetIngredientQuery["ingredient"]>["quantities"];
};

export interface HandleScanResult {
  data: WantedDataType;
  source: "network" | "cache" | "derived";
  timestamp: number;
}

const EMPTY_RESULT: WantedDataType = {
  product_image: "",
  product_name: "",
  product_category: {
    id: "",
    name: "",
  },
  product_units: "",
  product_base_unit: "",
};

export function mapIngredientToWantedData(
  ingredient: NonNullable<GetIngredientQuery["ingredient"]>
): WantedDataType {
  return {
    product_image: ingredient.image_url ?? "",
    product_name: ingredient.name ?? "",
    product_category: ingredient.category,
    product_units: ingredient.unit ?? "",
    product_already_in_database: true,
    product_internal_id: ingredient.id ?? undefined,
    product_base_quantity:
      ingredient.base_quantity != null
        ? ingredient.base_quantity.toString()
        : undefined,
    quantities: ingredient.quantities,
    product_base_unit: ingredient.base_unit ?? "",
  };
}

const handleScanType = async (
  mode: HandleItemSearch["mode"],
  productId: string | undefined
): Promise<HandleScanResult> => {
  if (mode === "barcode" && !productId) {
    throw new Error("Barcode is required for barcode scan mode");
  }

  if (mode === "internalId" && !productId) {
    throw new Error("Internal ID is required for internalId scan mode");
  }

  if (mode === "barcode") {
    try {
      const ingredientResult = await graphqlRequestWithOffline<GetIngredientQuery>(
        GetIngredientDocument,
        { barcode: productId!, includeStockMovements: false }
      );

      if (ingredientResult.data.ingredient) {
        const ingredient = ingredientResult.data.ingredient;
        const normalized = mapIngredientToWantedData(ingredient);
        await saveIngredientSnapshot(normalized, { barcode: productId! });

        return {
          data: normalized,
          source: ingredientResult.source,
          timestamp: ingredientResult.timestamp,
        } satisfies HandleScanResult;
      }
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        const snapshot = await getIngredientSnapshotByBarcode(productId!);
        if (snapshot?.value) {
          return {
            data: snapshot.value,
            source: "cache",
            timestamp: snapshot.timestamp,
          } satisfies HandleScanResult;
        }
      }
      throw error;
    }

    const openFoodResult = await graphqlRequest<OpenFoodFactsProxyQuery>(
      OpenFoodFactsProxyDocument,
      {
        barcode: productId,
        page: 1,
      }
    );

    if (!openFoodResult.search) {
      throw new Error("Product not found");
    }

    const product_base_quantity =
      openFoodResult.search.base_quantity != null
        ? String(openFoodResult.search.base_quantity)
        : undefined;

    const derivedData: WantedDataType = {
      ...EMPTY_RESULT,
      product_image: openFoodResult.search.imageUrl ?? "",
      product_name: openFoodResult.search.product_name ?? "",
      product_base_quantity,
      product_already_in_database:
        openFoodResult.search.is_already_in_database ?? false,
      product_internal_id: openFoodResult.search.ingredient_id ?? undefined,
      product_base_unit: openFoodResult.search.unit ?? "",
    };

    await saveIngredientSnapshot(derivedData, { barcode: productId! });

    return {
      data: derivedData,
      source: "derived",
      timestamp: Date.now(),
    } satisfies HandleScanResult;
  }

  if (mode === "internalId") {
    const ingredientId = productId!;
    try {
      const ingredientResult = await graphqlRequestWithOffline<GetIngredientQuery>(
        GetIngredientDocument,
        { id: ingredientId, includeStockMovements: false }
      );

      if (!ingredientResult.data.ingredient) {
        throw new Error("Product not found");
      }

      const ingredient = ingredientResult.data.ingredient;
      const normalized = mapIngredientToWantedData(ingredient);
      await saveIngredientSnapshot(normalized);

      return {
        data: normalized,
        source: ingredientResult.source,
        timestamp: ingredientResult.timestamp,
      } satisfies HandleScanResult;
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        const snapshot = await getIngredientSnapshotById(ingredientId);
        if (snapshot?.value) {
          return {
            data: snapshot.value,
            source: "cache",
            timestamp: snapshot.timestamp,
          } satisfies HandleScanResult;
        }
      }

      throw error;
    }
  }

  return {
    data: {
      ...EMPTY_RESULT,
      product_already_in_database: false,
      product_internal_id: undefined,
    },
    source: "derived",
    timestamp: Date.now(),
  } satisfies HandleScanResult;
};

export default handleScanType;
