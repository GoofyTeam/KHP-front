import { z } from "zod";
import { handleTypes } from "../../../routes/_protected/scan.$scanType";

export const handleUpdateProductSchema = z.object({
  type: handleTypes,
  image: z.instanceof(File).optional(),
  product_name: z.string().optional(),
  product_category: z.string().optional(),
  product_units: z.string().optional(),
  quantityPerUnit: z.string().optional(),
  product_base_unit: z.string().optional(),
});

export type HandleUpdateProductSchemaType = z.infer<
  typeof handleUpdateProductSchema
>;
