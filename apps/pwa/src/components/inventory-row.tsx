import { StockStatus } from "@workspace/ui/components/stock-status";
import { GetCompanyProductsQuery } from "../graphql/getCompanyProducts.gql";
import { Link } from "@tanstack/react-router";
import { CookingPot } from "lucide-react";

function InventoryRow({
  productDetails,
}: {
  productDetails: GetCompanyProductsQuery["ingredients"]["data"][number];
}) {
  return (
    <Link
      to="/products/$id"
      params={{ id: productDetails.id }}
      className="flex justify-between items-center border-b border-khp-primary hover:bg-khp-secondary p-4"
    >
      <div className="flex items-center gap-4">
        {productDetails.image_url ? (
          <img
            src={productDetails.image_url}
            alt={
              productDetails.image_url
                ? productDetails.name
                : `Image not available for ${productDetails.name}`
            }
            className="w-16 h-16 rounded-md"
          />
        ) : (
          <CookingPot className="w-16 h-16 text-khp-primary" />
        )}

        <p className="max-w-42 truncate">{productDetails.name}</p>
      </div>
      <div className="flex items-center gap-4">
        <StockStatus />
      </div>
    </Link>
  );
}

export default InventoryRow;
