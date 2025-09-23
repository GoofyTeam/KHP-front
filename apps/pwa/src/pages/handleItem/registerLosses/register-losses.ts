import z from "zod";
import api from "../../../lib/api";
import { registerLossesSchema } from "./registerLossesSchema";
import { router } from "../../../main";

export const registerLossesSubmit = async (
  values: z.infer<typeof registerLossesSchema>,
) => {
  await api.post(`/api/losses`, {
    loss_item_id: values.product_id,
    loss_item_type: values.lossableType,
    location_id: values.location_id,
    quantity: values.quantity,
    reason: values.reason,
  });

  router.navigate({
    to: "/products/$id",
    params: { id: values.product_id },
    replace: true,
  });
};
