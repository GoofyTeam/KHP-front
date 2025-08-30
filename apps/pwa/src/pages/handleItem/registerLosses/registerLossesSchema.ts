import { z } from "zod";
import { handleTypes } from "../../../routes/_protected/scan.$scanType";

export const registerLossesSchema = z.object({
  type: handleTypes,
  product_id: z.string().nonempty("Product ID is required"),
  location_id: z.string().nonempty("Location ID is required"),
  quantity: z.string().nonempty("Quantity is required"),
  lossableType: z.enum(["ingredient", "preparation"]),
  reason: z
    .string()
    .nonempty("Reason is required")
    .max(255, "Reason is too long"),
});

export type handleAddQuantitySchemaType = z.infer<typeof registerLossesSchema>;
