import { createFileRoute } from "@tanstack/react-router";
import ProductHistoryPage from "../../pages/ProductHistory";

export const Route = createFileRoute("/_protected/products/$id_/history")({
  component: ProductHistoryPage,
});
