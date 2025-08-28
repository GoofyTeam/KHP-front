import { createFileRoute, redirect } from "@tanstack/react-router";
import ScanPage from "../../pages/Scan";
import z from "zod";

export const handleTypes = z.enum([
  "add-product",
  "remove-product",
  "update-product",
  "add-quantity",
  "remove-quantity",
  //"update-quantity",
]);

export const Route = createFileRoute("/_protected/scan/$scanType")({
  params: z.object({
    scanType: handleTypes,
  }),
  beforeLoad: ({ params }) => {
    if (
      ![
        "add-product",
        "remove-product",
        "update-product",
        "add-quantity",
        "remove-quantity",
        //"update-quantity",
      ].includes(params.scanType)
    ) {
      throw redirect({ to: "/inventory" });
    }
  },
  component: ScanPage,
});
