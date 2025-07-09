"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@workspace/ui/components/table";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@workspace/ui/components/dropdown-menu";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { MoreVertical } from "lucide-react";
import { format } from "date-fns";

type Unit = "pcs" | "kg" | "l";
const UNIT_OPTIONS: Unit[] = ["pcs", "kg", "l"];
const CATEGORY_OPTIONS = ["Meat", "Dairy", "Vegetable", "Fruit"];

interface RowData {
  id: string;
  productName: string;
  qty: string;
  unit: Unit;
  category: string;
  expiryDay: string;
  expiryMonth: string;
  expiryYear: string;
}

export function StockTable() {
  const now = new Date();
  const defaultDraft: Omit<RowData, "id"> = {
    productName: "",
    qty: "",
    unit: "pcs",
    category: "",
    expiryDay: "",
    expiryMonth: format(now, "MM"),
    expiryYear: format(now, "yyyy"),
  };

  const [rows, setRows] = React.useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"add" | "edit">("add");
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Omit<RowData, "id">>(defaultDraft);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(
    null
  );
  const [isBulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const openAddDialog = () => {
    setFormMode("add");
    setCurrentId(null);
    setDraft(defaultDraft);
    setIsFormOpen(true);
  };

  const openEditDialog = (row: RowData) => {
    setFormMode("edit");
    setCurrentId(row.id);
    setDraft({
      productName: row.productName,
      qty: row.qty,
      unit: row.unit,
      category: row.category,
      expiryDay: row.expiryDay,
      expiryMonth: row.expiryMonth,
      expiryYear: row.expiryYear,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      const newRow: RowData = { id: Date.now().toString(), ...draft };
      setRows((prev) => [...prev, newRow]);
    } else if (formMode === "edit" && currentId) {
      setRows((prev) =>
        prev.map((r) => (r.id === currentId ? { id: currentId, ...draft } : r))
      );
    }
    setIsFormOpen(false);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (deleteTargetId) {
      setRows((prev) => prev.filter((r) => r.id !== deleteTargetId));
      setSelectedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(deleteTargetId);
        return copy;
      });
    }
    setDeleteConfirmOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (checked) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const openBulkDeleteConfirm = () => {
    setBulkDeleteOpen(true);
  };

  const handleBulkDelete = () => {
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  return (
    <div className="relative">
      {selectedIds.size > 0 && (
        <AlertDialog open={isBulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mb-4">
              Delete selected ({selectedIds.size})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete the selected products?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Table variant="add-stock">
        <TableHeader>
          <TableHead className="w-10">
            <Checkbox
              checked={selectedIds.size === rows.length && rows.length > 0}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
            />
          </TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="w-10 text-center">
                <Checkbox
                  checked={selectedIds.has(row.id)}
                  onCheckedChange={(checked) =>
                    toggleSelect(row.id, checked === true)
                  }
                />
              </TableCell>
              <TableCell>{row.productName}</TableCell>
              <TableCell>{row.qty}</TableCell>
              <TableCell>{row.unit}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{`${row.expiryDay}/${row.expiryMonth}/${row.expiryYear}`}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => openEditDialog(row)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => openDeleteConfirm(row.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-4">
              <AlertDialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="khp-default" onClick={openAddDialog}>
                    Add a product
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {formMode === "add" ? "Add Product" : "Edit Product"}
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Product Name"
                      value={draft.productName}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, productName: e.target.value }))
                      }
                    />
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Quantity"
                        type="number"
                        value={draft.qty}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, qty: e.target.value }))
                        }
                      />
                      <Select
                        value={draft.unit}
                        onValueChange={(v) =>
                          setDraft((d) => ({ ...d, unit: v as Unit }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Select
                      value={draft.category}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, category: v }))
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex space-x-2">
                      <Select
                        value={draft.expiryDay}
                        onValueChange={(v) =>
                          setDraft((d) => ({ ...d, expiryDay: v }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="DD" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => {
                            const d = String(i + 1).padStart(2, "0");
                            return (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        value={draft.expiryMonth}
                        onValueChange={(v) =>
                          setDraft((d) => ({ ...d, expiryMonth: v }))
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const m = String(i + 1).padStart(2, "0");
                            return (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        value={draft.expiryYear}
                        onValueChange={(v) =>
                          setDraft((d) => ({ ...d, expiryYear: v }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const y = String(now.getFullYear() + i);
                            return (
                              <SelectItem key={y} value={y}>
                                {y}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFormSubmit}>
                      {formMode === "add" ? "Add product" : "Save changes"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
