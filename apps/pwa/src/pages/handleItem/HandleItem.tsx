import { useLoaderData } from "@tanstack/react-router";
import HandleAddProduct from "./addProduct/HandleAddProduct";
import HandleUpdateProduct from "./updateProduct/HandleUpdateProduct";
import HandleAddQuantity from "./addQuantity/HandleAddQuantity";

function HandleItem() {
  const { type } = useLoaderData({
    from: "/_protected/handle-item",
  });
  return (
    <>
      {type === "add-product" && <HandleAddProduct />}
      {type === "update-product" && <HandleUpdateProduct />}
      {type === "add-quantity" && <HandleAddQuantity />}
    </>
  );
}

export default HandleItem;
