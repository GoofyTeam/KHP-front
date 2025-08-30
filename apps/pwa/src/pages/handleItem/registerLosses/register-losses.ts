import z from "zod";
import api from "../../../lib/api";
import { registerLossesSchema } from "./registerLossesSchema";
import { router } from "../../../main";

export const registerLossesSubmit = async (
  values: z.infer<typeof registerLossesSchema>
) => {
  await api.post(`/api/losses`, {
    trackable_id: values.product_id,
    trackable_type: values.lossableType,
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
