import { z } from "zod";
import { handleTypes } from "../../../routes/_protected/scan.$scanType";

export const handleAddQuantitySchema = z.object({
  type: handleTypes,
  product_id: z.string().nonempty("Product ID is required"),
  location_id: z.string().nonempty("Location ID is required"),
  quantity: z.string().nonempty("Quantity is required"),
});

export type handleAddQuantitySchemaType = z.infer<
  typeof handleAddQuantitySchema
>;
