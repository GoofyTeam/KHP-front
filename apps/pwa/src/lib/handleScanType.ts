import {
  GetItemByBarcode,
  GetItemByBarcodeQuery,
} from "../graphql/getItemByBarcode.gql";
import {
  GetItemByInternalId,
  GetItemByInternalIdQuery,
} from "../graphql/getItemByInternalId.gql";
import { handleItemSearch } from "../routes/_protected/handle-item";
import { graphqlRequest } from "./graph-client";

type WantedDataType = {
  product_image: string;
  product_name: string;
  product_category: string[];
  product_units: string;
  product_base_quantity?: string;
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
  mode: handleItemSearch["mode"],
  productId: string | undefined
) => {
  let wantedData: WantedDataType = {
    product_image: "",
    product_name: "",
    product_category: [],
    product_units: "",
  };

  if (mode === "barcode") {
    const result = await graphqlRequest<GetItemByBarcodeQuery>(
      GetItemByBarcode,
      { barcode: productId, page: 1 }
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
    };
  } else if (mode === "internalId") {
    const result = await graphqlRequest<GetItemByInternalIdQuery>(
      GetItemByInternalId,
      { id: productId }
    );

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
    };
  } else if (mode === "manual") {
    wantedData = {
      product_image: "",
      product_name: "",
      product_category: [],
      product_units: "",
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
