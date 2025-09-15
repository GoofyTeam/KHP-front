import z from "zod";
import { moveQuantitySchema } from "./moveQuantitySchema";
import { router } from "../../../main";
import api from "../../../lib/api";
import { postOrQueue } from "../../../lib/offline-actions";

async function moveQuantitySubmit(data: z.infer<typeof moveQuantitySchema>) {
  const path = `/api/ingredients/${data.product_id}/move-quantity`;
  const payload = {
    from_location_id: data.source_id,
    to_location_id: data.destination_id,
    quantity: parseInt(data.quantity, 10),
  };

  await postOrQueue(path, payload, {
    productId: data.product_id,
    deltas: [
      { locationId: data.source_id, delta: -parseInt(data.quantity, 10) },
      { locationId: data.destination_id, delta: parseInt(data.quantity, 10) },
    ],
  });

  router.navigate({
    to: "/products/$id",
    params: { id: data.product_id },
    replace: true,
  });
}

export default moveQuantitySubmit;
