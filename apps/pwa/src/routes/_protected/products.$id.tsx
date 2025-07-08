import { createFileRoute } from "@tanstack/react-router";
import ProductPage from "../../pages/Product";

export const Route = createFileRoute("/_protected/products/$id")({
  component: ProductPage,
});
