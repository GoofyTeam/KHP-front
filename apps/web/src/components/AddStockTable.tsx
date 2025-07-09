"use client";

import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
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
import { StockStatus } from "@workspace/ui/components/stock-status";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Unit = "pcs" | "kg" | "l";
const UNIT_OPTIONS: Unit[] = ["pcs", "kg", "l"];
const CATEGORY_OPTIONS = ["Meat", "Dairy", "Vegetable", "Fruit"];

type FieldKey = "productName" | "qtyunit" | "category" | "expiryMonthYear";
const FIELD_ORDER: FieldKey[] = [
  "productName",
  "qtyunit",
  "category",
  "expiryMonthYear",
];

interface RowData {
  productName: string;
  qty: string;
  unit: Unit;
  category: string;
  expiryMonth: string;
  expiryYear: string;
  expiryDay: string;
}

export function AddStockTable() {
  const now = new Date();
  const [rows, setRows] = React.useState<RowData[]>([]);
  const [draft, setDraft] = React.useState<RowData>({
    productName: "",
    qty: "",
    unit: "pcs",
    category: "",
    expiryMonth: format(now, "MM"),
    expiryYear: format(now, "yyyy"),
    expiryDay: "",
  });
  const [focusedField, setFocusedField] = React.useState<FieldKey | null>(null);

  const barRef = React.useRef<HTMLDivElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const refs = {
    productName: React.useRef<HTMLInputElement>(null),
    qty: React.useRef<HTMLInputElement>(null),
    expiryDay: React.useRef<HTMLInputElement>(null),
    hidden: React.useRef<HTMLInputElement>(null),
  };

  const handlePreventBlur = (e: React.SyntheticEvent) => {
    e.preventDefault();
    refs.hidden.current?.focus({ preventScroll: true });
  };

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const vp = window.visualViewport;
    if (!vp) return;
    const adjust = () => {
      const keyboardHeight = window.innerHeight - vp.height;
      if (barRef.current) barRef.current.style.bottom = `${keyboardHeight}px`;
    };
    adjust();
    vp.addEventListener("resize", adjust);
    vp.addEventListener("scroll", adjust);
    return () => {
      vp.removeEventListener("resize", adjust);
      vp.removeEventListener("scroll", adjust);
    };
  }, []);

  React.useEffect(() => {
    if (!focusedField) return;

    if (focusedField === "qtyunit") {
      refs.qty.current?.focus({ preventScroll: true });
      return;
    }

    if (focusedField === "category" || focusedField === "expiryMonthYear") {
      refs.hidden.current?.focus({ preventScroll: true });
      return;
    }
    const target =
      focusedField === "productName" ? refs.productName : refs.expiryDay;
    target.current?.focus({ preventScroll: true });
  }, [focusedField]);

  const focusPrev = () => {
    if (!focusedField) return;
    const idx = FIELD_ORDER.indexOf(focusedField);
    setFocusedField(
      FIELD_ORDER[(idx - 1 + FIELD_ORDER.length) % FIELD_ORDER.length]
    );
  };
  const focusNext = () => {
    if (!focusedField) return;
    const idx = FIELD_ORDER.indexOf(focusedField);
    setFocusedField(FIELD_ORDER[(idx + 1) % FIELD_ORDER.length]);
  };

  const handleAdd = () => {
    setRows((r) => [...r, draft]);
    setDraft({
      productName: "",
      qty: "",
      unit: "pcs",
      category: "",
      expiryMonth: format(now, "MM"),
      expiryYear: format(now, "yyyy"),
      expiryDay: "",
    });
    setFocusedField("productName");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    // fetch("/api/add-stock", { method: "POST", body: fd });
    handleAdd();
  };

  function renderField() {
    const common = {
      autoComplete: "off",
      autoCorrect: "off",
      autoCapitalize: "none",
      spellCheck: false,
    } as const;
    switch (focusedField) {
      case "productName":
        return (
          <Input
            {...common}
            ref={refs.productName}
            name="product"
            placeholder="Product"
            value={draft.productName}
            onPointerDown={(e) => e.preventDefault()}
            onClick={() => setFocusedField("productName")}
            onChange={(e) =>
              setDraft((d) => ({ ...d, productName: e.target.value }))
            }
          />
        );
      case "qtyunit":
        return (
          <div className="flex space-x-2">
            <Input
              {...common}
              ref={refs.qty}
              name="qty"
              type="number"
              placeholder="Qty"
              value={draft.qty}
              //   onPointerDown={(e) => e.preventDefault()}
              onClick={() => setFocusedField("qtyunit")}
              onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
            />
            <Select
              name="unit"
              value={draft.unit}
              onValueChange={(v) =>
                setDraft((d) => ({ ...d, unit: v as Unit }))
              }
            >
              <SelectTrigger
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
                className="w-24"
              >
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
              >
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "category":
        return (
          <Select
            name="category"
            value={draft.category}
            onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
          >
            <SelectTrigger
              onPointerDown={handlePreventBlur}
              onTouchStart={handlePreventBlur}
              className="w-40"
            >
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent
              onPointerDown={handlePreventBlur}
              onTouchStart={handlePreventBlur}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "expiryMonthYear":
        return (
          <div className="flex space-x-2">
            <Select
              name="expiryDay"
              value={draft.expiryDay}
              onValueChange={(d) =>
                setDraft((dft) => ({ ...dft, expiryDay: d }))
              }
            >
              <SelectTrigger
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
                className="w-20"
              >
                <SelectValue placeholder="DD" />
              </SelectTrigger>
              <SelectContent
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
              >
                {Array.from({ length: 31 }, (_, i) => {
                  const day = String(i + 1).padStart(2, "0");
                  return (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select
              name="expiryMonth"
              value={draft.expiryMonth}
              onValueChange={(m) => setDraft((d) => ({ ...d, expiryMonth: m }))}
            >
              <SelectTrigger
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
                className="w-20"
              >
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
              >
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
              name="expiryYear"
              value={draft.expiryYear}
              onValueChange={(y) => setDraft((d) => ({ ...d, expiryYear: y }))}
            >
              <SelectTrigger
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
                className="w-24"
              >
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent
                onPointerDown={handlePreventBlur}
                onTouchStart={handlePreventBlur}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const yr = String(now.getFullYear() + i);
                  return (
                    <SelectItem key={yr} value={yr}>
                      {yr}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="relative">
      <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
        <Table variant="inventory">
          <TableHeader>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                onClick={() => setFocusedField("productName")}
                className="cursor-text"
              >
                {draft.productName || (
                  <span className="text-muted-foreground">add product</span>
                )}
              </TableCell>
              <TableCell
                onClick={() => setFocusedField("qtyunit")}
                className="cursor-text"
              >
                {draft.qty || "0.0"}
              </TableCell>
              <TableCell
                onClick={() => setFocusedField("qtyunit")}
                className="cursor-text"
              >
                {draft.unit}
              </TableCell>
              <TableCell
                onClick={() => setFocusedField("category")}
                className="cursor-text"
              >
                {draft.category || (
                  <span className="text-muted-foreground">select category</span>
                )}
              </TableCell>
              <TableCell
                onClick={() => setFocusedField("expiryMonthYear")}
                className="cursor-text"
              >
                {draft.expiryDay ? (
                  `${draft.expiryDay}/${draft.expiryMonth}/${draft.expiryYear}`
                ) : (
                  <span className="text-muted-foreground">DD/MM/YYYY</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={
                    !draft.productName ||
                    !draft.qty ||
                    !draft.category ||
                    !draft.expiryDay
                  }
                >
                  Add
                </Button>
              </TableCell>
            </TableRow>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.productName}</TableCell>
                <TableCell>{r.qty}</TableCell>
                <TableCell>{r.unit}</TableCell>
                <TableCell>{r.category}</TableCell>
                <TableCell>{`${r.expiryDay}/${r.expiryMonth}/${r.expiryYear}`}</TableCell>
                <TableCell>
                  <StockStatus
                    variant={
                      `${r.expiryYear}-${r.expiryMonth}-${r.expiryDay}` <
                      format(now, "yyyy-MM-dd")
                        ? "expired"
                        : parseFloat(r.qty) > 0
                          ? "in-stock"
                          : "out-of-stock"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
      {focusedField && (
        <div
          ref={barRef}
          className="fixed inset-x-0 bottom-0 bg-white border-t p-4 flex items-center safe-area-inset-bottom z-50"
        >
          <input
            type="text"
            ref={refs.hidden}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: "none",
            }}
            tabIndex={-1}
          />
          <div className="flex-1">{renderField()}</div>
          <div className="flex space-x-2 ml-4">
            <button
              type="button"
              onClick={focusPrev}
              className="p-2 rounded hover:bg-muted/50"
            >
              <ChevronLeft />
            </button>
            {focusedField === "expiryMonthYear" ? (
              <button
                type="button"
                onClick={() => setFocusedField(null)}
                className="p-2 rounded hover:bg-muted/50"
              >
                OK
              </button>
            ) : (
              <button
                type="button"
                onClick={focusNext}
                className="p-2 rounded hover:bg-muted/50"
              >
                <ChevronRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
