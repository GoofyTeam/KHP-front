import { z } from "zod";
import { handleItemSchema, StockEntry } from "./handleItemSchema";
import api from "../../../lib/api";
import { WantedDataType } from "../../../lib/handleScanType";
import { router } from "../../../main";

const addProductFormData = async (
  values: z.infer<typeof handleItemSchema>,
  barcode: string | null | undefined,
  internalId: string | null | undefined
) => {
  const formData = new FormData();
  formData.append("name", values.product_name);
  formData.append("unit", values.product_units);
  formData.append("category_id", values.product_category);
  formData.append("base_quantity", values.quantityPerUnit);

  if (values.image) {
    formData.append("image", values.image);
  }

  if (values.stockEntries) {
    values.stockEntries.forEach((entry: StockEntry, index: number) => {
      formData.append(`quantities[${index}][quantity]`, entry.quantity);
      formData.append(`quantities[${index}][location_id]`, entry.location);
    });
  }
  if (barcode) {
    formData.append("barcode", barcode);
  }
  if (internalId) {
    formData.append("internal_id", internalId);
  }

  await api.post("/api/ingredients", formData);
};

const addProductJsonData = async (
  values: z.infer<typeof handleItemSchema>,
  barcode: string | null | undefined,
  internalId: string | null | undefined,
  product: WantedDataType
) => {
  await api.post("/api/ingredients", {
    image_url: product?.product_image || undefined,
    name: values.product_name,
    unit: values.product_units,
    base_quantity: parseInt(values.quantityPerUnit),
    category_id: values.product_category,
    ...(values.stockEntries && {
      quantities: values.stockEntries.map((entry: StockEntry) => ({
        quantity: parseInt(entry.quantity),
        location_id: entry.location,
      })),
    }),
    ...((barcode && { barcode }) || {}),
    ...((internalId && { internal_id: internalId }) || {}),
  });
};

export const addProductSubmit = async (
  values: z.infer<typeof handleItemSchema>,
  barcode: string | null | undefined,
  internalId: string | null | undefined,
  product: WantedDataType
) => {
  if (values.image) {
    await addProductFormData(values, barcode, internalId);
  } else {
    await addProductJsonData(values, barcode, internalId, product);
  }

  router.navigate({
    to: "/inventory",
  });
};
