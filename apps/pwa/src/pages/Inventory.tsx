import { useLoaderData } from "@tanstack/react-router";
import InventoryRow from "../components/inventory-row";

function InventoryPage() {
  const { ingredients } = useLoaderData({
    from: "/_protected/inventory",
  });

  return (
    <>
      {ingredients.map((ingredient) => (
        <InventoryRow key={ingredient.id} productDetails={ingredient} />
      ))}
    </>
  );
}

export default InventoryPage;
