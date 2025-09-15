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
  formData.append("base_unit", values.product_base_unit);

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
    base_unit: values.product_base_unit,
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
  try {
    if (values.image) {
      await addProductFormData(values, barcode, internalId);
    } else {
      await addProductJsonData(values, barcode, internalId, product);
    }

    console.log("Product submitted successfully, navigating to inventory...");
    router.navigate({
      to: "/inventory",
    });
  } catch (error) {
    console.error("Error in addProductSubmit:", error);

    // If it's a CSRF error, the operation might have succeeded despite the error
    // Check if the error message indicates CSRF retry
    if (
      error instanceof Error &&
      error.message.includes("CSRF token expired")
    ) {
      console.log(
        "CSRF error detected, but operation might have succeeded. Attempting navigation..."
      );

      // Wait a bit and then navigate anyway
      setTimeout(() => {
        router.navigate({
          to: "/inventory",
        });
      }, 1000);

      return; // Don't re-throw the error
    }

    // Re-throw other errors
    throw error;
  }
};
