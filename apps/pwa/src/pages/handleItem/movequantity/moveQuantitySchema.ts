import { z } from "zod";

export const moveQuantitySchema = z.object({
  product_id: z.string().nonempty("Product ID is required"),
  quantity: z.string().nonempty("Quantity is required"),
  source_id: z.string().nonempty("Source Location ID is required"),
  destination_id: z.string().nonempty("Destination Location ID is required"),
});

export type moveQuantitySchemaType = z.infer<typeof moveQuantitySchema>;
