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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  GetLocationsDocument,
  GetCategoriesDocument,
  GetUnitDocument,
} from "@/graphql/generated/graphql";
import { useQuery } from "@apollo/client";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Camera,
  X as CloseIcon,
} from "lucide-react";

// hooks mobile
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

// Types
type Unit = string;
type FieldKey =
  | "productName"
  | "qtyunit"
  | "baseqtyunit"
  | "category"
  | "location";

type LocationOpt = { id: number; name: string };
type UnitOpt = { value: string; label: string };
type CategoryOpt = { id: number; name: string };

export interface RowData {
  productName: string;
  qty: string;
  unit: Unit;
  base_quantity: number;
  base_unit: Unit;
  category: number | "";
  location: string;
  image?: File | null;
}

export type AddStockTableHandle = {
  getRows: () => RowData[];
  clear: () => void;
  getFormDataPayload: () => Array<{
    name: string;
    unit: string;
    base_unit: string;
    category_id: number;
    quantities: Array<{ location_id: number; quantity: number }>;
    base_quantity: number;
    image: File;
  }>;
  categoryNameById: (id?: number | "") => string;
};

// Camera capture
function useCamera() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const start = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      try {
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        const basicConstraints: MediaStreamConstraints = {
          video: true,
          audio: false,
        };
        const stream =
          await navigator.mediaDevices.getUserMedia(basicConstraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const takePhoto = async (
    fileName = `image-${Date.now()}.jpg`,
    mime = "image/jpeg",
    quality = 1
  ): Promise<File> => {
    const video = videoRef.current;
    if (!video) throw new Error("Camera not ready");

    const canvas = document.createElement("canvas");
    const videoWidth = video.videoWidth || 1080;
    const videoHeight = video.videoHeight || 1080;

    const squareSize = Math.min(videoWidth, videoHeight);

    canvas.width = squareSize;
    canvas.height = squareSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");
    const sx = (videoWidth - squareSize) / 2;
    const sy = (videoHeight - squareSize) / 2;
    ctx.drawImage(
      video,
      sx,
      sy,
      squareSize,
      squareSize,
      0,
      0,
      squareSize,
      squareSize
    );
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error("Failed to create image blob from canvas"));
          }
        },
        mime,
        quality
      )
    );
    return new File([blob], fileName, { type: mime });
  };

  return { videoRef, start, stop, takePhoto };
}

function CameraModal({
  open,
  onClose,
  onCapture,
  defaultFilename,
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  defaultFilename?: string;
}) {
  const { videoRef, start, stop, takePhoto } = useCamera();

  React.useEffect(() => {
    let mounted = true;
    if (open) {
      start().catch((e) => {
        console.error("Camera start error:", e);
        onClose();
      });
    }
    return () => {
      if (mounted) {
        stop();
      }
      mounted = false;
    };
  }, [open, onClose, start, stop]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[min(90vw,90vh)] p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Take a photo</h3>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-muted/50"
            aria-label="Close camera"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="relative rounded overflow-hidden bg-transparent">
          <div className="relative aspect-square w-full max-w-[min(80vw,70vh)] mx-auto">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                const file = await takePhoto(
                  defaultFilename || `capture-${Date.now()}.jpg`
                );
                onCapture(file);
                onClose();
              } catch (e) {
                console.error("Capture error:", e);
              }
            }}
          >
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
}

// composant
export const AddStockTable = React.forwardRef<AddStockTableHandle>((_, ref) => {
  const keyboardHeight = useKeyboardHeight();
  const isMobile = useIsMobile();

  const [isEditMode, setIsEditMode] = React.useState(false);
  const [fixedKeyboardHeight, setFixedKeyboardHeight] = React.useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = React.useState(false);
  const [, setViewportHeight] = React.useState(0);
  const [, setScrollOffset] = React.useState(0);

  const [rows, setRows] = React.useState<RowData[]>([]);
  const [locations, setLocations] = React.useState<LocationOpt[]>([]);
  const [categories, setCategories] = React.useState<CategoryOpt[]>([]);
  const [units, setUnits] = React.useState<UnitOpt[]>([]);
  const [draft, setDraft] = React.useState<RowData>({
    productName: "",
    qty: "",
    unit: "",
    base_quantity: 0,
    base_unit: "",
    category: "",
    location: "",
    image: null,
  });

  const [focusedField, setFocusedField] = React.useState<FieldKey | null>(null);
  const [activeSelect, setActiveSelect] = React.useState<{
    type: "unit" | "base_unit" | "category" | "location";
    options: string[];
    value: string;
    onSelect: (value: string) => void;
  } | null>(null);

  const [cameraOpen, setCameraOpen] = React.useState(false);

  const keyboardKeeperRef = React.useRef<HTMLInputElement>(null);
  const visibleInputRef = React.useRef<HTMLInputElement>(null);

  // GraphQL GET
  const { data: locationsData, loading: locationsLoading } =
    useQuery(GetLocationsDocument);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GetCategoriesDocument
  );
  const { data: unitsData, loading: unitsLoading } = useQuery(GetUnitDocument);

  React.useEffect(() => {
    if (locationsLoading) return;
    const list =
      locationsData?.locations?.data
        ?.filter(Boolean)
        .map((l: unknown) => {
          const obj = l as { id?: string | number; name?: string };
          return {
            id: Number(obj?.id),
            name: String(obj?.name ?? "").trim(),
          } as LocationOpt;
        })
        .filter((l: LocationOpt) => l.id && l.name) ?? [];
    setLocations(list);
  }, [locationsData, locationsLoading]);

  React.useEffect(() => {
    if (categoriesLoading) return;
    const list =
      categoriesData?.categories?.data
        ?.filter(Boolean)
        .map((c: unknown) => {
          const obj = c as { id?: string | number; name?: string };
          return {
            id: Number(obj?.id),
            name: String(obj?.name ?? "").trim(),
          } as CategoryOpt;
        })
        .filter((c: CategoryOpt) => c.id && c.name) ?? [];
    setCategories(list);
  }, [categoriesData, categoriesLoading]);

  React.useEffect(() => {
    if (unitsLoading) return;
    const list =
      unitsData?.measurementUnits
        ?.filter(Boolean)
        .map((u: unknown) => {
          const obj = u as { value?: string; label?: string };
          const value = String(obj?.value ?? obj?.label ?? "").toLowerCase();
          const label = String(obj?.label ?? obj?.value ?? "");
          return { value, label } as UnitOpt;
        })
        .filter((u: UnitOpt) => !!u.value) ?? [];
    setUnits(list);
  }, [unitsData, unitsLoading]);

  // mobile viewport
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

  // edition flow
  const startEditing = (field: FieldKey) => {
    if (!isMobile) return;
    setIsEditMode(true);
    setFocusedField(field);
    setActiveSelect(null);

    setTimeout(() => {
      if (
        field === "productName" ||
        field === "qtyunit" ||
        field === "baseqtyunit"
      ) {
        setTimeout(() => {
          if (visibleInputRef.current) {
            visibleInputRef.current.focus({ preventScroll: true });
          }
        }, 50);
      } else if (field === "category") {
        handleSelectClick(
          "category",
          categories.map((c) => String(c.id)),
          draft.category ? String(draft.category) : "",
          (v) => setDraft((d) => ({ ...d, category: Number(v) }))
        );
      } else if (field === "location") {
        handleSelectClick(
          "location",
          locations.map((l) => l.name),
          draft.location,
          (v) => setDraft((d) => ({ ...d, location: v }))
        );
      }
    }, 100);
  };

  const stopEditing = () => {
    setIsEditMode(false);
    setFocusedField(null);
    setActiveSelect(null);
    setFixedKeyboardHeight(0);
    keyboardKeeperRef.current?.blur();
    visibleInputRef.current?.blur();
  };

  const focusNext = () => {
    if (!focusedField) return;
    if (activeSelect) setActiveSelect(null);
    switch (focusedField) {
      case "productName":
        setFocusedField("qtyunit");
        setTimeout(
          () => visibleInputRef.current?.focus({ preventScroll: true }),
          50
        );
        break;
      case "qtyunit":
        if (draft.qty && !activeSelect) {
          handleSelectClick(
            "unit",
            units.map((u) => u.value),
            draft.unit,
            (v) => setDraft((d) => ({ ...d, unit: v as Unit }))
          );
        } else {
          setFocusedField("baseqtyunit");
          setTimeout(
            () => visibleInputRef.current?.focus({ preventScroll: true }),
            50
          );
        }
        break;
      case "baseqtyunit":
        if (draft.base_quantity && !activeSelect) {
          handleSelectClick(
            "base_unit",
            units.map((u) => u.value),
            draft.base_unit,
            (v) => setDraft((d) => ({ ...d, base_unit: v as Unit }))
          );
        } else {
          setFocusedField("category");
          setTimeout(() => {
            handleSelectClick(
              "category",
              categories.map((c) => String(c.id)),
              draft.category ? String(draft.category) : "",
              (v) => setDraft((d) => ({ ...d, category: Number(v) }))
            );
          }, 100);
        }
        break;
      case "category":
        setFocusedField("location");
        setTimeout(() => {
          handleSelectClick(
            "location",
            locations.map((l) => l.name),
            draft.location,
            (v) => setDraft((d) => ({ ...d, location: v }))
          );
        }, 100);
        break;
      case "location":
        stopEditing();
        break;
    }
  };

  const focusPrev = () => {
    if (!focusedField) return;
    if (activeSelect) setActiveSelect(null);
    switch (focusedField) {
      case "qtyunit":
        setFocusedField("productName");
        setTimeout(
          () => visibleInputRef.current?.focus({ preventScroll: true }),
          50
        );
        break;
      case "baseqtyunit":
        setFocusedField("qtyunit");
        setTimeout(
          () => visibleInputRef.current?.focus({ preventScroll: true }),
          50
        );
        break;
      case "productName":
        setFocusedField("location");
        setTimeout(() => {
          handleSelectClick(
            "location",
            locations.map((l) => l.name),
            draft.location,
            (v) => setDraft((d) => ({ ...d, location: v }))
          );
        }, 100);
        break;
      case "category":
        setFocusedField("baseqtyunit");
        setTimeout(
          () => visibleInputRef.current?.focus({ preventScroll: true }),
          50
        );
        break;
      case "location":
        setFocusedField("category");
        setTimeout(() => {
          handleSelectClick(
            "category",
            categories.map((c) => String(c.id)),
            draft.category ? String(draft.category) : "",
            (v) => setDraft((d) => ({ ...d, category: Number(v) }))
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
      unit: units.length > 0 ? (units[0].value as Unit) : "",
      base_quantity: 0,
      base_unit: units.length > 0 ? (units[0].value as Unit) : "",
      category: "",
      location: "",
      image: null,
    });
    setFocusedField("productName");
    setActiveSelect(null);
    setTimeout(
      () => visibleInputRef.current?.focus({ preventScroll: true }),
      50
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const handleSelectClick = (
    type: "unit" | "base_unit" | "category" | "location",
    options: string[],
    value: string,
    onSelect: (value: string) => void
  ) => {
    setActiveSelect({ type, options, value, onSelect });
  };

  const handleSelectOption = (value: string) => {
    if (!activeSelect) return;
    const selectType = activeSelect.type;
    activeSelect.onSelect(value);
    setActiveSelect(null);
    setTimeout(() => {
      if (selectType === "unit") {
        setFocusedField("baseqtyunit");
        setTimeout(
          () => visibleInputRef.current?.focus({ preventScroll: true }),
          50
        );
      } else if (selectType === "base_unit") {
        setFocusedField("category");
        setTimeout(() => {
          handleSelectClick(
            "category",
            categories.map((c) => String(c.id)),
            draft.category ? String(draft.category) : "",
            (v) => setDraft((d) => ({ ...d, category: Number(v) }))
          );
        }, 100);
      } else if (selectType === "category") {
        setFocusedField("location");
        setTimeout(() => {
          handleSelectClick(
            "location",
            locations.map((l) => l.name),
            draft.location,
            (v) => setDraft((d) => ({ ...d, location: v }))
          );
        }, 100);
      } else if (selectType === "location") {
        setTimeout(() => stopEditing(), 100);
      }
    }, 100);
  };

  const categoryNameById = (id?: number | "") =>
    id ? (categories.find((c) => c.id === id)?.name ?? "") : "";

  // imperatif handle
  React.useImperativeHandle(ref, () => ({
    getRows: () => rows,
    clear: () => setRows([]),
    categoryNameById: (id?: number | "") => categoryNameById(id),

    getFormDataPayload: () => {
      const nameToId = new Map<string, number>(
        locations.map((l) => [l.name, l.id])
      );

      type Acc = {
        name: string;
        unit: string;
        base_unit: string;
        base_quantity: number;
        category_id: number | null;
        quantitiesMap: Map<number, number>;
        image?: File;
      };

      const byName = new Map<string, Acc>();

      for (const r of rows) {
        const name = r.productName?.trim();
        const unit = r.unit?.trim();
        const base_unit = r.base_unit?.trim();
        const base_quantity = r.base_quantity;
        const locId = nameToId.get(r.location);
        const qtyNum = Number(r.qty);

        if (
          !name ||
          !unit ||
          !base_unit ||
          !locId ||
          !Number.isFinite(qtyNum) ||
          qtyNum < 0 ||
          !Number.isFinite(base_quantity) ||
          base_quantity <= 0
        )
          continue;

        const key = name.toLowerCase();
        if (!byName.has(key)) {
          byName.set(key, {
            name,
            unit,
            base_unit,
            base_quantity,
            category_id: typeof r.category === "number" ? r.category : null,
            quantitiesMap: new Map<number, number>(),
            image: r.image ?? undefined,
          });
        }

        const acc = byName.get(key)!;

        if (acc.category_id == null && typeof r.category === "number") {
          acc.category_id = r.category;
        }

        if (!acc.image && r.image) {
          acc.image = r.image;
        }

        acc.quantitiesMap.set(
          locId,
          (acc.quantitiesMap.get(locId) ?? 0) + qtyNum
        );
      }

      const ingredients = Array.from(byName.values())
        .map((acc) => {
          if (acc.category_id == null) return null;
          if (!acc.image) return null;
          return {
            name: acc.name,
            unit: acc.unit,
            base_unit: acc.base_unit,
            category_id: acc.category_id,
            quantities: Array.from(acc.quantitiesMap.entries()).map(
              ([location_id, quantity]) => ({ location_id, quantity })
            ),
            base_quantity: acc.base_quantity,
            image: acc.image,
          };
        })
        .filter(Boolean) as Array<{
        name: string;
        unit: string;
        base_unit: string;
        category_id: number;
        quantities: Array<{ location_id: number; quantity: number }>;
        base_quantity: number;
        image: File;
      }>;

      return ingredients;
    },
  }));

  // UI

  return (
    <>
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => setDraft((d) => ({ ...d, image: file }))}
        defaultFilename={
          draft.productName
            ? `${draft.productName.replace(/\s+/g, "-").toLowerCase()}`
            : undefined
        }
      />

      <div className="relative max-w-full overflow-x-hidden">
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
          <Table variant="add-stock" className="table-fixed w-full min-w-0">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 text-left md:w-[25%]">
                  Product
                </TableHead>
                <TableHead className="px-2 text-left md:w-[10%]">Qty</TableHead>
                <TableHead className="px-2 text-left md:w-[15%]">
                  Unit
                </TableHead>
                <TableHead className="px-2 text-left md:w-[10%]">
                  Base Qty
                </TableHead>
                <TableHead className="px-2 text-left md:w-[15%]">
                  Base Unit
                </TableHead>
                <TableHead className="px-2 text-left md:w-[20%]">
                  Category
                </TableHead>
                <TableHead className="px-2 text-left md:w-[20%]">
                  Location
                </TableHead>
                <TableHead className="px-2 text-center md:w-[10%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="px-2 cursor-text">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex-shrink-0">
                      {draft.image ? (
                        <div className="relative">
                          <img
                            src={URL.createObjectURL(draft.image)}
                            alt="Product preview"
                            className="w-8 h-8 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCameraOpen(true)}
                            className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-white border rounded-full"
                            title="Retake photo"
                          >
                            <Camera className="h-2 w-2" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCameraOpen(true)}
                          className="w-8 h-8 p-0"
                          title="Take photo"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {!isMobile ? (
                        <Input
                          variant="khp-product"
                          className="truncate"
                          value={draft.productName}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              productName: e.target.value,
                            }))
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
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {draft.productName || (
                            <span className="text-muted-foreground">
                              Add product
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-2 cursor-text">
                  {!isMobile ? (
                    <Input
                      variant="khp-product"
                      className="truncate"
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
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      {draft.base_unit ? (
                        draft.base_unit.toUpperCase()
                      ) : (
                        <span className="text-muted-foreground">Quantity</span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-2 cursor-pointer">
                  {!isMobile ? (
                    <Select
                      value={draft.unit}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, unit: v as Unit }))
                      }
                      disabled={unitsLoading}
                    >
                      <SelectTrigger
                        variant="khp-product"
                        className="truncate w-full"
                      >
                        <SelectValue placeholder="Select unit">
                          {draft.unit
                            ? draft.unit.toUpperCase()
                            : "Select unit"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem
                            key={u.value}
                            value={u.value}
                            className="truncate"
                          >
                            {u.label}
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
                        setTimeout(
                          () => window.scrollTo(0, currentScrollTop),
                          0
                        );
                        startEditing("qtyunit");
                      }}
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-text truncate"
                    >
                      {draft.unit ? (
                        draft.unit.toUpperCase()
                      ) : (
                        <span className="text-muted-foreground">
                          Select unit
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-2 cursor-text">
                  {!isMobile ? (
                    <Input
                      variant="khp-product"
                      className="truncate"
                      type="number"
                      value={draft.base_quantity || ""}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          base_quantity: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="Base quantity"
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditing("baseqtyunit");
                      }}
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      {draft.base_quantity > 0 ? (
                        draft.base_quantity
                      ) : (
                        <span className="text-muted-foreground">
                          Base quantity
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-2 cursor-pointer">
                  {!isMobile ? (
                    <Select
                      value={draft.base_unit}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, base_unit: v as Unit }))
                      }
                      disabled={unitsLoading}
                    >
                      <SelectTrigger
                        variant="khp-product"
                        className="truncate w-full"
                      >
                        <SelectValue placeholder="Select base unit">
                          {draft.base_unit
                            ? draft.base_unit.toUpperCase()
                            : "Select base unit"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem
                            key={u.value}
                            value={u.value}
                            className="truncate"
                          >
                            {u.label}
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
                        setTimeout(
                          () => window.scrollTo(0, currentScrollTop),
                          0
                        );
                        startEditing("baseqtyunit");
                      }}
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-text truncate"
                    >
                      {draft.base_unit ? (
                        draft.base_unit.toUpperCase()
                      ) : (
                        <span className="text-muted-foreground">
                          Select base unit
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-2 cursor-pointer">
                  {!isMobile ? (
                    <Select
                      value={draft.category ? String(draft.category) : ""}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, category: Number(v) }))
                      }
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger
                        variant="khp-product"
                        className="truncate w-full"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={String(c.id)}
                            className="truncate"
                          >
                            {c.name}
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
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-text truncate"
                    >
                      {draft.category ? (
                        categories.find((c) => c.id === draft.category)?.name
                      ) : (
                        <span className="text-muted-foreground">
                          Select category
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="px-2 cursor-pointer">
                  {!isMobile ? (
                    <Select
                      value={draft.location}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, location: v }))
                      }
                      disabled={locationsLoading}
                    >
                      <SelectTrigger
                        variant="khp-product"
                        className="truncate w-full"
                      >
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem
                            key={loc.id}
                            value={loc.name}
                            className="truncate"
                          >
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditing("location");
                      }}
                      onFocus={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="cursor-text truncate"
                    >
                      {draft.location || (
                        <span className="text-muted-foreground">
                          Select location
                        </span>
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
                        !draft.location ||
                        !draft.unit ||
                        !draft.image ||
                        locationsLoading ||
                        categoriesLoading ||
                        unitsLoading
                      }
                    >
                      Add
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {rows.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="px-2 truncate">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex-shrink-0">
                        {r.image ? (
                          <img
                            src={URL.createObjectURL(r.image)}
                            alt="Product"
                            className="w-8 h-8 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center">
                            <Camera className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <span className="truncate">{r.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2">{r.qty}</TableCell>
                  <TableCell className="px-2 truncate">
                    {r.unit.toUpperCase()}
                  </TableCell>
                  <TableCell className="px-2">{r.base_quantity}</TableCell>
                  <TableCell className="px-2 truncate">
                    {r.base_unit.toUpperCase()}
                  </TableCell>
                  <TableCell className="px-2 truncate">
                    {categories.find((c) => c.id === r.category)?.name ?? ""}
                  </TableCell>
                  <TableCell className="px-2 truncate">{r.location}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div
                          className="flex items-center justify-center"
                          aria-label="Open row actions menu"
                        >
                          <EllipsisVertical />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-auto" align="start">
                        <DropdownMenuItem
                          className="text-khp-error"
                          onClick={() =>
                            setRows((prevRows) =>
                              prevRows.filter((_, j) => j !== i)
                            )
                          }
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                if (activeSelect && !isKeyboardOpen)
                  return `${fixedKeyboardHeight || 300}px`;
                if (isKeyboardOpen && window.visualViewport) {
                  const kh = window.innerHeight - window.visualViewport.height;
                  return `${kh}px`;
                }
                return "0px";
              })(),
              left: "0",
              right: "0",
              position: "fixed",
              zIndex: 9999,
            }}
          >
            <div className="flex-1">
              {(() => {
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
                          setDraft((d) => ({
                            ...d,
                            productName: e.target.value,
                          }))
                        }
                        onFocus={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.target.scrollIntoView)
                            e.target.scrollIntoView = () => {};
                        }}
                        onBlur={() => {
                          setTimeout(
                            () =>
                              keyboardKeeperRef.current?.focus({
                                preventScroll: true,
                              }),
                            50
                          );
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
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, qty: e.target.value }))
                          }
                          onClick={() => activeSelect && setActiveSelect(null)}
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.target.scrollIntoView)
                              e.target.scrollIntoView = () => {};
                          }}
                          onBlur={() => {
                            setTimeout(
                              () =>
                                keyboardKeeperRef.current?.focus({
                                  preventScroll: true,
                                }),
                              50
                            );
                          }}
                          style={{
                            transform: "translateZ(0)",
                            backfaceVisibility: "hidden",
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted"
                          onClick={() =>
                            handleSelectClick(
                              "unit",
                              units.map((u) => u.value),
                              draft.unit,
                              (v) =>
                                setDraft((d) => ({ ...d, unit: v as Unit }))
                            )
                          }
                        >
                          <span className="truncate max-w-[5rem]">
                            {draft.unit ? draft.unit.toUpperCase() : "Unit"}
                          </span>
                        </button>
                      </div>
                    );

                  case "baseqtyunit":
                    return (
                      <div className="flex space-x-2">
                        <Input
                          {...common}
                          ref={visibleInputRef}
                          type="number"
                          placeholder="Base quantity"
                          value={draft.base_quantity || ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              base_quantity: parseFloat(e.target.value) || 0,
                            }))
                          }
                          onClick={() => activeSelect && setActiveSelect(null)}
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.target.scrollIntoView)
                              e.target.scrollIntoView = () => {};
                          }}
                          onBlur={() => {
                            setTimeout(
                              () =>
                                keyboardKeeperRef.current?.focus({
                                  preventScroll: true,
                                }),
                              50
                            );
                          }}
                          style={{
                            transform: "translateZ(0)",
                            backfaceVisibility: "hidden",
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted"
                          onClick={() =>
                            handleSelectClick(
                              "base_unit",
                              units.map((u) => u.value),
                              draft.base_unit,
                              (v) =>
                                setDraft((d) => ({
                                  ...d,
                                  base_unit: v as Unit,
                                }))
                            )
                          }
                        >
                          <span className="truncate max-w-[5rem]">
                            {draft.base_unit
                              ? draft.base_unit.toUpperCase()
                              : "Base Unit"}
                          </span>
                        </button>
                      </div>
                    );

                  case "category":
                    return (
                      <button
                        type="button"
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted"
                        onClick={() =>
                          handleSelectClick(
                            "category",
                            categories.map((c) => String(c.id)),
                            draft.category ? String(draft.category) : "",
                            (v) =>
                              setDraft((d) => ({ ...d, category: Number(v) }))
                          )
                        }
                      >
                        <span className="truncate max-w-[14rem]">
                          {categoryNameById(draft.category) ||
                            "Select category"}
                        </span>
                      </button>
                    );

                  case "location":
                    return (
                      <button
                        type="button"
                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 text-sm hover:bg-muted"
                        onClick={() =>
                          handleSelectClick(
                            "location",
                            locations.map((l) => l.name),
                            draft.location,
                            (v) => setDraft((d) => ({ ...d, location: v }))
                          )
                        }
                      >
                        <span className="truncate max-w-[14rem]">
                          {draft.location || "Select location"}
                        </span>
                      </button>
                    );

                  default:
                    return null;
                }
              })()}
            </div>

            <div className="flex space-x-2 ml-4">
              <button
                type="button"
                onClick={focusPrev}
                className="p-2 rounded hover:bg-muted/50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {focusedField === "location" ? (
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
                    <span className="truncate">
                      {activeSelect.type === "category"
                        ? (categories.find((c) => String(c.id) === option)
                            ?.name ?? option)
                        : option}
                    </span>
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
    </>
  );
});

AddStockTable.displayName = "AddStockTable";
