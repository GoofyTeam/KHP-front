"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { StockStatus } from "@workspace/ui/components/stock-status";

interface InventoryItem {
  id: number;
  productName: string;
  qty: number;
  unit: string;
  category: string;
  expiryDate: string;
  status: "in-stock" | "out-of-stock" | "low-stock" | "expired";
}

const fakeData: InventoryItem[] = [
  {
    id: 1,
    productName: "Chicken Breast",
    qty: 8.0,
    unit: "pcs",
    category: "Meat",
    expiryDate: "2025-06-24",
    status: "in-stock",
  },
  {
    id: 2,
    productName: "Chicken Breast",
    qty: 8.0,
    unit: "pcs",
    category: "Meat",
    expiryDate: "2025-06-24",
    status: "out-of-stock",
  },
  {
    id: 3,
    productName: "Chicken Breast",
    qty: 8.0,
    unit: "pcs",
    category: "Meat",
    expiryDate: "2025-06-24",
    status: "low-stock",
  },
  {
    id: 4,
    productName: "Chicken Jokey",
    qty: 8.0,
    unit: "pcs",
    category: "Meat",
    expiryDate: "2025-06-24",
    status: "expired",
  },
];

export function InventoryTable() {
  const [openMenuFor, setOpenMenuFor] = React.useState<number | null>(null);

  const toggleMenu = (id: number) => {
    setOpenMenuFor((prev) => (prev === id ? null : id));
  };

  const handleAction = (action: string, item: InventoryItem) => {
    console.log({ action, item });
    setOpenMenuFor(null);
  };

  return (
    <Table variant="inventory">
      <TableHeader>
        <TableHead>Product Name</TableHead>
        <TableHead>Qty</TableHead>
        <TableHead>Unit</TableHead>
        <TableHead>Category</TableHead>
        <TableHead>Expiry date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-center text-foreground h-10 align-middle font-medium whitespace-nowrap">
          Actions
        </TableHead>
      </TableHeader>

      <TableBody>
        {fakeData.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.productName}</TableCell>
            <TableCell>{item.qty.toFixed(1)}</TableCell>
            <TableCell>{item.unit}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.expiryDate}</TableCell>
            <TableCell>
              <StockStatus variant={item.status} />
            </TableCell>
            <TableCell className="relative text-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="h-8 w-8 p-0 rounded hover:bg-muted/50 mx-auto flex items-center justify-center"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>

                {openMenuFor === item.id && (
                  <DropdownMenuContent align="end" className="z-10">
                    <DropdownMenuItem
                      onClick={() => handleAction("edit", item)}
                    >
                      Edit product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
