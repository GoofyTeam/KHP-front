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
  product_category: NonNullable<GetIngredientQuery["ingredient"]>["category"];
  product_units: string;
  product_base_unit: string;
  product_base_quantity?: string;
  product_already_in_database?: boolean;
  product_internal_id?: string;
  quantities?: NonNullable<GetIngredientQuery["ingredient"]>["quantities"];
};

const handleScanType = async (
  mode: HandleItemSearch["mode"],
  productId: string | undefined
) => {
  let wantedData: WantedDataType = {
    product_image: "",
    product_name: "",
    product_category: {
      id: "",
      name: "",
    },
    product_units: "",
    product_base_unit: "",
  };

  if (mode === "barcode") {
    const resultByBarcode = await graphqlRequest<GetIngredientQuery>(
      GetIngredient,
      { barcode: productId! }
    );
    if (resultByBarcode.ingredient) {
      wantedData = {
        product_image: resultByBarcode.ingredient.image_url ?? "",
        product_name: resultByBarcode.ingredient.name ?? "",
        product_category: resultByBarcode.ingredient.category,
        product_units: resultByBarcode.ingredient.unit ?? "",
        product_already_in_database: true,
        product_internal_id: resultByBarcode.ingredient.id ?? undefined,
        product_base_quantity:
          resultByBarcode.ingredient.base_quantity.toString(),
        quantities: resultByBarcode.ingredient.quantities,
        product_base_unit: resultByBarcode.ingredient.base_unit ?? "",
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
      product_category: {
        id: "",
        name: "",
      },
      product_units: "",
      product_base_quantity,
      product_already_in_database:
        result.search.is_already_in_database ?? false,
      product_internal_id: result.search.ingredient_id ?? undefined,
      product_base_unit: result.search.unit ?? "",
    };
  } else if (mode === "internalId") {
    const result = await graphqlRequest<GetIngredientQuery>(GetIngredient, {
      id: productId,
    });

    if (!result.ingredient) {
      throw new Error("Product not found");
    }

    wantedData = {
      product_image: result.ingredient.image_url ?? "",
      product_name: result.ingredient.name ?? "",
      product_category: result.ingredient.category,
      product_units: result.ingredient.unit ?? "",
      product_already_in_database: true,
      product_internal_id: result.ingredient.id ?? undefined,
      product_base_quantity: result.ingredient.base_quantity.toString(),
      quantities: result.ingredient.quantities,
      product_base_unit: result.ingredient.base_unit ?? "",
    };
  } else if (mode === "manual") {
    wantedData = {
      product_image: "",
      product_name: "",
      product_category: {
        id: "",
        name: "",
      },
      product_units: "",
      product_already_in_database: false,
      product_internal_id: undefined,
      product_base_unit: "",
    };
  }

  /* wantedData.product_category = Array.from(
    new Set(
      wantedData.product_category.map((cat) => cat.trim()).filter(Boolean)
    )
  ); */

  return wantedData;
};

export default handleScanType;
