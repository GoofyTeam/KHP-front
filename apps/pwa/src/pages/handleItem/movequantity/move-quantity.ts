import z from "zod";
import { moveQuantitySchema } from "./moveQuantitySchema";
import { router } from "../../../main";
import api from "../../../lib/api";

async function moveQuantitySubmit(data: z.infer<typeof moveQuantitySchema>) {
  await api.post(`/api/ingredients/${data.product_id}/move-quantity`, {
    from_location_id: data.source_id,
    to_location_id: data.destination_id,
    quantity: parseInt(data.quantity, 10),
  });

  router.navigate({
    to: "/products/$id",
    params: { id: data.product_id },
    replace: true,
  });
}

export default moveQuantitySubmit;
