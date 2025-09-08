import { z } from "zod";
import { handleTypes } from "../../../routes/_protected/scan.$scanType";

export const stockEntrySchema = z.object({
  quantity: z.string().nonempty("Quantity required"),
  location: z.string().nonempty("Location required"),
});

export const handleItemSchema = z
  .object({
    type: handleTypes,
    image: z.instanceof(File).optional(),
    product_name: z.string().nonempty("Product name is required"),
    product_category: z.string().nonempty("Category is required"),
    product_units: z.string().nonempty("Units are required"),
    quantityPerUnit: z.string().nonempty("Quantity per unit is required"),
    product_base_unit: z.string().nonempty("Base unit is required"),
    stockEntries: z.array(stockEntrySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "add-product" || data.type === "add-quantity") {
      if (!data.stockEntries || data.stockEntries.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one stock entry is required",
        });
      }
    }
  });

export type HandleItem = z.infer<typeof handleItemSchema>;
export type StockEntry = NonNullable<HandleItem["stockEntries"]>[number];
