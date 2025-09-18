"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { DataTable } from "@/components/meals/meals-data-table";
import { columns } from "@/components/meals/meals-column";
import { GetMenusDocument } from "@/graphql/generated/graphql";
import type { GetMenusQuery } from "@/graphql/generated/graphql";

export default function MenusPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, loading, error, fetchMore } = useQuery(GetMenusDocument, {
    variables: {
      page: 1,
      first: 10,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const menus: GetMenusQuery["menus"]["data"] = useMemo(
    () => data?.menus?.data ?? [],
    [data?.menus?.data]
  );

  const pageInfo = data?.menus?.paginatorInfo;
  const hasMorePages = pageInfo?.hasMorePages ?? false;

  // Infinite scroll logic
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMorePages || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);

          fetchMore({
            variables: {
              page: nextPage,
              first: 10,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) return prev;

              return {
                ...fetchMoreResult,
                menus: {
                  ...fetchMoreResult.menus,
                  data: [...prev.menus.data, ...fetchMoreResult.menus.data],
                },
              };
            },
          });
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMorePages, currentPage, loading, fetchMore]);

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={menus}
        loading={loading}
        hasMorePages={hasMorePages}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
