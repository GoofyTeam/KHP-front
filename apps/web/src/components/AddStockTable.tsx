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

function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      const fullHeight = window.innerHeight;
      const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      const diff = fullHeight - viewportHeight;
      setKeyboardHeight(diff > 0 ? diff : 0);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
    }

    handleResize();

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return keyboardHeight;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return isMobile;
}

type Unit = "pcs" | "kg" | "l";
const UNIT_OPTIONS: Unit[] = ["pcs", "kg", "l"];
const CATEGORY_OPTIONS = ["Meat", "Dairy", "Vegetable", "Fruit"];

type FieldKey = "productName" | "qtyunit" | "category" | "expiryMonthYear";

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
  const keyboardHeight = useKeyboardHeight();
  const isMobile = useIsMobile();

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [fixedKeyboardHeight, setFixedKeyboardHeight] = React.useState(0);
  const [initialScrollTop, setInitialScrollTop] = React.useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [scrollOffset, setScrollOffset] = React.useState(0);

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
  const [activeSelect, setActiveSelect] = React.useState<{
    type: "unit" | "category" | "day" | "month" | "year";
    options: string[];
    value: string;
    onSelect: (value: string) => void;
  } | null>(null);

  const keyboardKeeperRef = React.useRef<HTMLInputElement>(null);
  const visibleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (keyboardHeight > 0 && !fixedKeyboardHeight) {
      setFixedKeyboardHeight(keyboardHeight);
      setIsKeyboardOpen(true);
      setViewportHeight(window.visualViewport?.height || window.innerHeight);
    } else if (keyboardHeight === 0 && fixedKeyboardHeight > 0) {
      setIsKeyboardOpen(false);
      setViewportHeight(window.innerHeight);
    } else if (!fixedKeyboardHeight) {
      setFixedKeyboardHeight(300);
    }
  }, [keyboardHeight, fixedKeyboardHeight]);

  React.useEffect(() => {
    if (isEditMode && keyboardKeeperRef.current) {
      keyboardKeeperRef.current.focus({ preventScroll: true });
    }
  }, [isEditMode, focusedField, activeSelect]);

  React.useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const newKeyboardHeight =
          window.innerHeight - window.visualViewport.height;
        if (newKeyboardHeight > 100) {
          setFixedKeyboardHeight(newKeyboardHeight);
          setIsKeyboardOpen(true);
          setViewportHeight(window.visualViewport.height);
        } else {
          setIsKeyboardOpen(false);
          setViewportHeight(window.innerHeight);
          if (!fixedKeyboardHeight) {
            setFixedKeyboardHeight(300);
          }
        }
      }
    };

    const handleViewportScroll = () => {
      if (isEditMode && window.visualViewport) {
        setScrollOffset(window.visualViewport.offsetTop || 0);
        setViewportHeight(window.visualViewport.height);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      window.visualViewport.addEventListener("scroll", handleViewportScroll);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleViewportScroll
        );
      }
    };
  }, [fixedKeyboardHeight, isEditMode]);

  const startEditing = (field: FieldKey) => {
    if (!isMobile) {
      return;
    }

    setIsEditMode(true);
    setFocusedField(field);
    setActiveSelect(null);

    setTimeout(() => {
      if (field === "productName" || field === "qtyunit") {
        setTimeout(() => {
          if (visibleInputRef.current) {
            visibleInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
      } else if (field === "category") {
        handleSelectClick("category", CATEGORY_OPTIONS, draft.category, (v) =>
          setDraft((d) => ({ ...d, category: v }))
        );
      } else if (field === "expiryMonthYear") {
        handleSelectClick(
          "day",
          Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")),
          draft.expiryDay,
          (d) => setDraft((dft) => ({ ...dft, expiryDay: d }))
        );
      }
    }, 100);
  };

  const stopEditing = () => {
    setIsEditMode(false);
    setFocusedField(null);
    setActiveSelect(null);
    setFixedKeyboardHeight(0);

    if (keyboardKeeperRef.current) {
      keyboardKeeperRef.current.blur();
    }
    if (visibleInputRef.current) {
      visibleInputRef.current.blur();
    }
  };

  const focusNext = () => {
    if (!focusedField) return;

    if (activeSelect) {
      setActiveSelect(null);
    }

    switch (focusedField) {
      case "productName":
        setFocusedField("qtyunit");
        setTimeout(() => {
          if (visibleInputRef.current) {
            visibleInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
        break;
      case "qtyunit":
        if (draft.qty && !activeSelect) {
          handleSelectClick(
            "unit",
            UNIT_OPTIONS.map((u) => u.toUpperCase()),
            draft.unit.toUpperCase(),
            (v) => setDraft((d) => ({ ...d, unit: v.toLowerCase() as Unit }))
          );
        } else {
          setFocusedField("category");
          setTimeout(() => {
            handleSelectClick(
              "category",
              CATEGORY_OPTIONS,
              draft.category,
              (v) => setDraft((d) => ({ ...d, category: v }))
            );
          }, 100);
        }
        break;
      case "category":
        setFocusedField("expiryMonthYear");
        setTimeout(() => {
          setDraft((currentDraft) => {
            handleSelectClick(
              "day",
              Array.from({ length: 31 }, (_, i) =>
                String(i + 1).padStart(2, "0")
              ),
              currentDraft.expiryDay,
              (d) => setDraft((dft) => ({ ...dft, expiryDay: d }))
            );
            return currentDraft;
          });
        }, 100);
        break;
      case "expiryMonthYear":
        stopEditing();
        break;
    }
  };

  const focusPrev = () => {
    if (!focusedField) return;

    if (activeSelect) {
      setActiveSelect(null);
    }

    switch (focusedField) {
      case "qtyunit":
        setFocusedField("productName");
        setTimeout(() => {
          if (visibleInputRef.current) {
            visibleInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
        break;
      case "productName":
        setFocusedField("expiryMonthYear");
        setTimeout(() => {
          setDraft((currentDraft) => {
            handleSelectClick(
              "day",
              Array.from({ length: 31 }, (_, i) =>
                String(i + 1).padStart(2, "0")
              ),
              currentDraft.expiryDay,
              (d) => setDraft((dft) => ({ ...dft, expiryDay: d }))
            );
            return currentDraft;
          });
        }, 100);
        break;
      case "category":
        setFocusedField("qtyunit");
        setTimeout(() => {
          if (visibleInputRef.current) {
            visibleInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
        break;
      case "expiryMonthYear":
        setFocusedField("category");
        setTimeout(() => {
          handleSelectClick("category", CATEGORY_OPTIONS, draft.category, (v) =>
            setDraft((d) => ({ ...d, category: v }))
          );
        }, 100);
        break;
    }
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
    setActiveSelect(null);
    setTimeout(() => {
      if (visibleInputRef.current) {
        visibleInputRef.current.focus({ preventScroll: true });
      }
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const handleSelectClick = (
    type: "unit" | "category" | "day" | "month" | "year",
    options: string[],
    value: string,
    onSelect: (value: string) => void
  ) => {
    setActiveSelect({
      type,
      options,
      value,
      onSelect,
    });
  };

  const handleSelectOption = (value: string) => {
    if (activeSelect) {
      const selectType = activeSelect.type;
      activeSelect.onSelect(value);
      setActiveSelect(null);

      setTimeout(() => {
        if (selectType === "unit") {
          setFocusedField("category");
          setTimeout(() => {
            setDraft((currentDraft) => {
              handleSelectClick(
                "category",
                CATEGORY_OPTIONS,
                currentDraft.category,
                (v) => setDraft((d) => ({ ...d, category: v }))
              );
              return currentDraft;
            });
          }, 100);
        } else if (selectType === "category") {
          setFocusedField("expiryMonthYear");
          setTimeout(() => {
            setDraft((currentDraft) => {
              handleSelectClick(
                "day",
                Array.from({ length: 31 }, (_, i) =>
                  String(i + 1).padStart(2, "0")
                ),
                currentDraft.expiryDay,
                (d) => setDraft((dft) => ({ ...dft, expiryDay: d }))
              );
              return currentDraft;
            });
          }, 100);
        } else if (selectType === "day") {
          setDraft((currentDraft) => {
            handleSelectClick(
              "month",
              Array.from({ length: 12 }, (_, i) =>
                String(i + 1).padStart(2, "0")
              ),
              currentDraft.expiryMonth,
              (m) => setDraft((d) => ({ ...d, expiryMonth: m }))
            );
            return currentDraft;
          });
        } else if (selectType === "month") {
          setDraft((currentDraft) => {
            handleSelectClick(
              "year",
              Array.from({ length: 10 }, (_, i) =>
                String(now.getFullYear() + i)
              ),
              currentDraft.expiryYear,
              (y) => setDraft((d) => ({ ...d, expiryYear: y }))
            );
            return currentDraft;
          });
        } else if (selectType === "year") {
          setTimeout(() => {
            stopEditing();
          }, 100);
        }
      }, 100);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const target = e.target as Element;
    if (target.closest('[data-select-options="true"]')) {
      return;
    }
  };

  const CustomSelectButton = ({
    value,
    placeholder,
    className,
    onClick,
  }: {
    value: string;
    placeholder: string;
    className?: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
    >
      <span className={value ? "" : "text-muted-foreground"}>
        {value || placeholder}
      </span>
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );

  const renderField = () => {
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
            ref={visibleInputRef}
            placeholder="Product name"
            value={draft.productName}
            onChange={(e) =>
              setDraft((d) => ({ ...d, productName: e.target.value }))
            }
            onFocus={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.target.scrollIntoView) {
                e.target.scrollIntoView = () => {};
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                if (isEditMode && keyboardKeeperRef.current) {
                  keyboardKeeperRef.current.focus({ preventScroll: true });
                }
              }, 50);
            }}
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
        );

      case "qtyunit":
        return (
          <div className="flex space-x-2">
            <Input
              {...common}
              ref={visibleInputRef}
              type="number"
              placeholder="Quantity"
              value={draft.qty}
              onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
              onClick={() => {
                if (activeSelect) {
                  setActiveSelect(null);
                }
              }}
              onFocus={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.target.scrollIntoView) {
                  e.target.scrollIntoView = () => {};
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (isEditMode && keyboardKeeperRef.current) {
                    keyboardKeeperRef.current.focus({ preventScroll: true });
                  }
                }, 50);
              }}
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            />
            <CustomSelectButton
              value={draft.unit.toUpperCase()}
              placeholder="Unit"
              className="w-24"
              onClick={() =>
                handleSelectClick(
                  "unit",
                  UNIT_OPTIONS.map((u) => u.toUpperCase()),
                  draft.unit.toUpperCase(),
                  (v) =>
                    setDraft((d) => ({ ...d, unit: v.toLowerCase() as Unit }))
                )
              }
            />
          </div>
        );

      case "category":
        return (
          <CustomSelectButton
            value={draft.category}
            placeholder="Select category"
            onClick={() =>
              handleSelectClick(
                "category",
                CATEGORY_OPTIONS,
                draft.category,
                (v) => setDraft((d) => ({ ...d, category: v }))
              )
            }
          />
        );

      case "expiryMonthYear":
        return (
          <div className="flex space-x-2">
            <CustomSelectButton
              value={draft.expiryDay}
              placeholder="DD"
              className="w-20"
              onClick={() =>
                handleSelectClick(
                  "day",
                  Array.from({ length: 31 }, (_, i) =>
                    String(i + 1).padStart(2, "0")
                  ),
                  draft.expiryDay,
                  (d) => setDraft((dft) => ({ ...dft, expiryDay: d }))
                )
              }
            />
            <CustomSelectButton
              value={draft.expiryMonth}
              placeholder="MM"
              className="w-20"
              onClick={() =>
                handleSelectClick(
                  "month",
                  Array.from({ length: 12 }, (_, i) =>
                    String(i + 1).padStart(2, "0")
                  ),
                  draft.expiryMonth,
                  (m) => setDraft((d) => ({ ...d, expiryMonth: m }))
                )
              }
            />
            <CustomSelectButton
              value={draft.expiryYear}
              placeholder="YYYY"
              className="w-24"
              onClick={() =>
                handleSelectClick(
                  "year",
                  Array.from({ length: 10 }, (_, i) =>
                    String(now.getFullYear() + i)
                  ),
                  draft.expiryYear,
                  (y) => setDraft((d) => ({ ...d, expiryYear: y }))
                )
              }
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <input
        ref={keyboardKeeperRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        style={{
          left: -9999,
          top: -9999,
          height: 0,
          width: 0,
          border: "none",
          background: "transparent",
          outline: "none",
          resize: "none",
        }}
        tabIndex={-1}
        aria-hidden="true"
        readOnly
      />

      <form onSubmit={handleSubmit} autoComplete="off">
        <Table variant="add-stock" className="table-fixed">
          <TableHeader>
            <TableHead className="w-[25%] px-4 py-4 text-left">
              Product
            </TableHead>
            <TableHead className="w-[15%] px-2 text-left">Qty</TableHead>
            <TableHead className="w-[10%] px-2 text-left">Unit</TableHead>
            <TableHead className="w-[20%] px-2 text-left">Category</TableHead>
            <TableHead className="w-[20%] px-2 text-left">Date</TableHead>
            <TableHead className="w-auto px-4">Actions</TableHead>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="px-2 cursor-text">
                {!isMobile ? (
                  <Input
                    variant="khp-product"
                    value={draft.productName}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, productName: e.target.value }))
                    }
                    placeholder="Product name"
                  />
                ) : (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEditing("productName");
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {draft.productName || (
                      <span className="text-muted-foreground">add product</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-2 cursor-text">
                {!isMobile ? (
                  <Input
                    variant="khp-product"
                    type="number"
                    value={draft.qty}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, qty: e.target.value }))
                    }
                    placeholder="Quantity"
                  />
                ) : (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEditing("qtyunit");
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {draft.qty || "0.0"}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-2 cursor-pointer">
                {!isMobile ? (
                  <Select
                    value={draft.unit}
                    onValueChange={(v) => {
                      setDraft((d) => ({ ...d, unit: v as Unit }));
                    }}
                  >
                    <SelectTrigger variant="khp-product" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentScrollTop =
                        window.pageYOffset ||
                        document.documentElement.scrollTop;
                      setTimeout(() => {
                        window.scrollTo(0, currentScrollTop);
                      }, 0);
                      startEditing("qtyunit");
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-text"
                  >
                    {draft.unit.toUpperCase()}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-2 cursor-pointer">
                {!isMobile ? (
                  <Select
                    value={draft.category}
                    onValueChange={(v) => {
                      setDraft((d) => ({ ...d, category: v }));
                    }}
                  >
                    <SelectTrigger variant="khp-product" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEditing("category");
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-text"
                  >
                    {draft.category || (
                      <span className="text-muted-foreground">
                        select category
                      </span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-2 cursor-pointer">
                {!isMobile ? (
                  <div className="flex space-x-1">
                    <Select
                      value={draft.expiryDay}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, expiryDay: v }))
                      }
                    >
                      <SelectTrigger variant="khp-product">
                        <SelectValue placeholder="DD" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={String(i + 1).padStart(2, "0")}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={draft.expiryMonth}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, expiryMonth: v }))
                      }
                    >
                      <SelectTrigger variant="khp-product">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={String(i + 1).padStart(2, "0")}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={draft.expiryYear}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, expiryYear: v }))
                      }
                    >
                      <SelectTrigger variant="khp-product">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem
                            key={now.getFullYear() + i}
                            value={String(now.getFullYear() + i)}
                          >
                            {now.getFullYear() + i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startEditing("expiryMonthYear");
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                    }}
                    onFocus={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="cursor-text"
                  >
                    {draft.expiryDay ? (
                      `${draft.expiryDay}/${draft.expiryMonth}/${draft.expiryYear}`
                    ) : (
                      <span className="text-muted-foreground">DD/MM/YYYY</span>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-2 cursor-pointer">
                <div className="flex justify-center">
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
                </div>
              </TableCell>
            </TableRow>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.productName}</TableCell>
                <TableCell>{r.qty}</TableCell>
                <TableCell>{r.unit.toUpperCase()}</TableCell>
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

      {isEditMode && !activeSelect && (
        <div
          className="fixed inset-0 z-40"
          style={{
            bottom: "80px",
            left: "0",
            right: "0",
            top: "0",
            position: "fixed",
          }}
          onClick={stopEditing}
        />
      )}

      {activeSelect && (
        <div
          className="fixed inset-0 z-40"
          style={{
            bottom: isKeyboardOpen
              ? `${fixedKeyboardHeight || 300}px`
              : `${(fixedKeyboardHeight || 300) + 80}px`,
            left: "0",
            right: "0",
            top: "0",
            position: "fixed",
          }}
          onClick={() => setActiveSelect(null)}
        />
      )}

      {isEditMode && (
        <div
          className="fixed inset-x-0 bg-white border-t p-4 flex items-center z-50 transition-none"
          style={{
            bottom: (() => {
              if (activeSelect && !isKeyboardOpen) {
                return `${fixedKeyboardHeight || 300}px`;
              }

              if (isKeyboardOpen && window.visualViewport) {
                const keyboardHeight =
                  window.innerHeight - window.visualViewport.height;
                return `${keyboardHeight}px`;
              }

              return "0px";
            })(),
            left: "0",
            right: "0",
            position: "fixed",
            zIndex: 9999,
          }}
        >
          <div className="flex-1">{renderField()}</div>

          <div className="flex space-x-2 ml-4">
            <button
              type="button"
              onClick={focusPrev}
              className="p-2 rounded hover:bg-muted/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {focusedField === "expiryMonthYear" ? (
              <button
                type="button"
                onClick={stopEditing}
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
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {activeSelect && (
        <div
          className="fixed inset-x-0 bg-white border-l border-r border-gray-300 z-50"
          data-select-options="true"
          style={{
            top: (() => {
              if (isKeyboardOpen && window.visualViewport) {
                const viewportTop = window.visualViewport.offsetTop || 0;
                const barHeight = 80;
                return `${viewportTop + barHeight}px`;
              }
              return `calc(100vh - ${fixedKeyboardHeight || 300}px - 80px)`;
            })(),
            bottom: "auto",
            left: "0",
            right: "0",
            position: "fixed",
            height: (() => {
              if (isKeyboardOpen && window.visualViewport) {
                const viewportTop = window.visualViewport.offsetTop || 0;
                const barHeight = 80;
                const availableHeight =
                  window.visualViewport.height - barHeight;
                return `${Math.max(availableHeight, 150)}px`;
              }
              return `${fixedKeyboardHeight || 300}px`;
            })(),
            marginTop: "80px",
            borderTop: "none",
            zIndex: 9998,
            overflowY: "auto",
          }}
        >
          <div className="h-full" data-select-options="true">
            {activeSelect.options.map((option, index) => (
              <button
                key={option}
                type="button"
                data-select-options="true"
                className={`w-full px-4 py-3 text-left text-base font-medium transition-all duration-200 ${
                  index !== activeSelect.options.length - 1
                    ? "border-b border-gray-200"
                    : ""
                } ${
                  activeSelect.value === option
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200"
                }`}
                onClick={() => handleSelectOption(option)}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {activeSelect.value === option && (
                    <div className="flex items-center justify-center w-5 h-5 bg-white rounded-full">
                      <svg
                        className="h-3 w-3 text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
