import z from "zod";
import api from "../../../lib/api";
import { handleAddQuantitySchema } from "./handleAddQuantitySchema";
import { router } from "../../../main";

export const addQuantitySubmit = async (
  values: z.infer<typeof handleAddQuantitySchema>
) => {
  await api.post(`/api/ingredients/${values.product_id}/add-quantity`, {
    location_id: values.location_id,
    quantity: parseInt(values.quantity, 10),
    type: values.type,
  });

  router.navigate({
    to: "/products/$id",
    params: { id: values.product_id },
    replace: true,
  });
};
