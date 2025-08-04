import {
  Link,
  Route,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import InventoryRow from "../components/inventory-row";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScanBarcode } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

function InventoryPage() {
  const { ingredients } = useLoaderData({
    from: "/_protected/inventory",
  });
  const navigate = useNavigate({ from: "/inventory" });
  const { search_terms = "", pageIndex } = useSearch({
    from: "/_protected/inventory",
  });

  const [searchTerm, setSearchTerm] = useState(search_terms || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    navigate({
      search: {
        search_terms: debouncedSearchTerm || undefined,
      },
    });
  }, [debouncedSearchTerm, navigate]);

  console.log("InventoryPage loaded with ingredients:", ingredients);

  return (
    <div>
      {ingredients.data.map((ingredient) => (
        <InventoryRow key={ingredient.id} productDetails={ingredient} />
      ))}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md bg-background p-4 rounded shadow-lg w-11/12 flex items-center justify-start gap-2">
        <Input
          type="text"
          placeholder="Search for ingredients..."
          variant="khp-default"
          className=""
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Button variant="khp-default" asChild>
          <Link to="/scan">
            <ScanBarcode size={32} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default InventoryPage;
