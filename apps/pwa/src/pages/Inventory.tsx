import {
  Link,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import InventoryRow from "../components/inventory-row";
import { Input } from "@workspace/ui/components/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { ScanBarcode } from "lucide-react";
import type { GetCompanyProductsQuery } from "@workspace/graphql";

function InventoryPage() {
  const { data, pageInfo, source, cacheTimestamp, status } = useLoaderData({
    from: "/_protected/inventory",
  });
  const { search_terms = "", pageIndex } = useSearch({
    from: "/_protected/inventory",
  });
  const navigate = useNavigate({ from: "/inventory" });

  const [searchTerm, setSearchTerm] = useState(search_terms);
  const [debouncedTerm, setDebouncedTerm] = useState(search_terms);
  const [allItems, setAllItems] =
    useState<GetCompanyProductsQuery["ingredients"]["data"]>(data);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    navigate({
      search: {
        search_terms: debouncedTerm || undefined,
        pageIndex: 1,
      },
    });
  }, [debouncedTerm, navigate]);

  useEffect(() => {
    if (pageIndex === 1) {
      setAllItems(data);
    } else {
      setAllItems((prev: GetCompanyProductsQuery["ingredients"]["data"]) => [
        ...prev,
        ...data,
      ]);
    }
  }, [data, pageIndex]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !pageInfo.hasMorePages || status === "missing-offline") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          navigate({
            search: {
              search_terms: debouncedTerm || undefined,
              pageIndex: pageIndex + 1,
            },
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageInfo.hasMorePages, pageIndex, debouncedTerm, navigate, status]);

  const isOfflineData = source === "cache";
  const isOfflineUnavailable = status === "missing-offline";
  const lastUpdatedLabel = cacheTimestamp
    ? new Date(cacheTimestamp).toLocaleString()
    : null;

  return (
    <div className="space-y-4">
      {isOfflineUnavailable && (
        <div className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-md text-sm">
          Impossible de récupérer d'autres ingrédients hors connexion. Réessaye
          une fois la connexion rétablie.
        </div>
      )}
      {isOfflineData && (
        <div className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-md text-sm">
          Données consultées hors connexion
          {lastUpdatedLabel && ` — mise à jour le ${lastUpdatedLabel}`}.
        </div>
      )}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-md bg-background p-4 rounded shadow-lg w-11/12 flex gap-2">
        <Input
          type="text"
          placeholder="Search for ingredients..."
          variant="khp-default"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex gap-x-2">
          <Button variant="khp-default" asChild className="!h-auto">
            <Link to="/scan/$scanType" params={{ scanType: "add-product" }}>
              <ScanBarcode size={32} />
            </Link>
          </Button>
        </div>
      </div>

      {allItems.map(
        (
          ingredient: GetCompanyProductsQuery["ingredients"]["data"][number],
          index: number
        ) => (
          <InventoryRow
            key={index + ingredient.id + "_" + ingredient.name}
            productDetails={ingredient}
          />
        )
      )}
      {pageInfo.hasMorePages ? (
        <div ref={sentinelRef} className="h-8" />
      ) : (
        <div className="h-24" />
      )}
    </div>
  );
}

export default InventoryPage;
