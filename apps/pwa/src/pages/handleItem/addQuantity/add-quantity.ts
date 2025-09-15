import z from "zod";
import api from "../../../lib/api";
import { postOrQueue } from "../../../lib/offline-actions";
import { handleAddQuantitySchema } from "./handleAddQuantitySchema";
import { router } from "../../../main";

export const addQuantitySubmit = async (
  values: z.infer<typeof handleAddQuantitySchema>
) => {
  const path = `/api/ingredients/${values.product_id}/add-quantity`;
  const payload = {
    location_id: values.location_id,
    quantity: parseInt(values.quantity, 10),
    type: values.type,
  };

  await postOrQueue(path, payload, {
    productId: values.product_id,
    deltas: [
      { locationId: values.location_id, delta: parseInt(values.quantity, 10) },
    ],
  });

  router.navigate({
    to: "/products/$id",
    params: { id: values.product_id },
    replace: true,
  });
};
