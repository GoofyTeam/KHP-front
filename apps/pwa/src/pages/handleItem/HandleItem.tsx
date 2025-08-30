import { useLoaderData } from "@tanstack/react-router";
import HandleAddProduct from "./addProduct/HandleAddProduct";
import HandleUpdateProduct from "./updateProduct/HandleUpdateProduct";
import HandleAddQuantity from "./addQuantity/HandleAddQuantity";
import RegisterLosses from "./registerLosses/RegisterLosses";

function HandleItem() {
  const { type } = useLoaderData({
    from: "/_protected/handle-item",
  });
  return (
    <>
      {type === "add-product" && <HandleAddProduct />}
      {type === "update-product" && <HandleUpdateProduct />}
      {type === "add-quantity" && <HandleAddQuantity />}
      {type === "remove-quantity" && <RegisterLosses />}
    </>
  );
}

export default HandleItem;
