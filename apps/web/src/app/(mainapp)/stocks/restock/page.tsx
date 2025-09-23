"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  RestockTable,
  type RestockTableHandle,
} from "@/components/stocks/restock-table";

export default function RestockPage() {
  const tableRef = React.useRef<RestockTableHandle>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!tableRef.current) return;
    const rows = tableRef.current.getRows();

    if (!rows.length) {
      toast.error("Select at least one ingredient.");
      return;
    }

    setLoading(true);

    try {
      console.info("[stocks/add/low-stock] payload", rows);
      toast.success("Quantities ready to be sent.");
      tableRef.current.clear();
    } catch (error) {
      console.error("[stocks/add/low-stock] error", error);
      toast.error("Failed to prepare quantities.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <RestockTable
        ref={tableRef}
        onSubmit={handleSubmit}
        isSubmitting={loading}
      />
    </div>
  );
}
