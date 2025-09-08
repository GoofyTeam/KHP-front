import { z } from "zod";
import api from "../../../lib/api";
import { router } from "../../../main";
import { handleUpdateProductSchema } from "./handleUpdateProductSchema";

export const updateProductSubmit = async (
  values: z.infer<typeof handleUpdateProductSchema>,
  internalId: string | null | undefined
) => {
  if (!internalId) {
    throw new Error("Internal ID is required to update product");
  }

  if (
    !values.product_name &&
    !values.product_units &&
    !values.image &&
    !values.product_category &&
    !values.quantityPerUnit &&
    !values.product_base_unit
  ) {
    return;
  }

  const formData = new FormData();
  formData.append("_method", "PUT");

  if (values.product_name) {
    formData.append("name", values.product_name);
  }
  if (values.product_units) {
    formData.append("unit", values.product_units);
  }
  if (values.image) {
    formData.append("image", values.image);
  }
  if (values.product_category) {
    formData.append("categories[]", values.product_category);
  }

  if (values.quantityPerUnit) {
    formData.append("quantity_per_unit", values.quantityPerUnit);
  }

  if (values.product_base_unit) {
    formData.append("base_unit", values.product_base_unit);
  }

  await api.post(`/api/ingredients/${internalId}`, formData);

  router.navigate({
    to: "/products/$id",
    params: { id: internalId! },
    replace: true,
  });
};
