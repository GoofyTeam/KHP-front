import z from "zod";
import api from "../../../lib/api";
import { handleAddQuantitySchema } from "./handleAddQuantitySchema";
import { router } from "../../../main";

export const addQuantitySubmit = async (
  values: z.infer<typeof handleAddQuantitySchema>,
) => {
  try {
    await api.post(`/api/ingredients/${values.product_id}/add-quantity`, {
      location_id: values.location_id,
      quantity: parseInt(values.quantity, 10),
      type: values.type,
    });

    console.log("Quantity added successfully, navigating to product page...");
    router.navigate({
      to: "/products/$id",
      params: { id: values.product_id },
      replace: true,
    });
  } catch (error) {
    console.error("Error in addQuantitySubmit:", error);

    // If it's a CSRF error, the operation might have succeeded despite the error
    if (
      error instanceof Error &&
      error.message.includes("CSRF token expired")
    ) {
      console.log(
        "CSRF error detected, but operation might have succeeded. Attempting navigation...",
      );

      // Wait a bit and then navigate anyway
      setTimeout(() => {
        router.navigate({
          to: "/products/$id",
          params: { id: values.product_id },
          replace: true,
        });
      }, 1000);

      return; // Don't re-throw the error
    }

    // Re-throw other errors
    throw error;
  }
};
