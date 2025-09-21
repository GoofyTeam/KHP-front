"use client";

import { TakinOrdersQueryQuery } from "@/graphql/generated/graphql";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Edit3, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import PreparationStatusBadge from "@workspace/ui/components/preparation-type-badge";
import { AllegernsBadge } from "@workspace/ui/components/allergens-badge";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { getPreparationLabel } from "@workspace/ui/lib/order";
import { useRouter } from "next/navigation";
import type {
  AddStepMenuAction,
  AddStepMenuInput,
  CancelOrderAction,
  CancelStepMenuAction,
  CancelStepMenuInput,
  CreateOrderStepAction,
  CreateOrderStepInput,
  MarkStepMenuServedAction,
  PayOrderAction,
  StepMenuPayload,
} from "@/app/(mainapp)/waiters/table/[orderId]/actions";

type OrderData = NonNullable<TakinOrdersQueryQuery["order"]>;
type OrderStep = OrderData["steps"][number];

type ExistingStepMenu = {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  status: OrderStep["stepMenus"][number]["status"];
  price: number;
};

type StepMenuDraft = {
  menuId: string;
  name: string;
  quantity: number;
  note?: string;
  price: number;
};

function TakinOrders({
  availableMenus,
  tableCurrentOrder,
  actions,
  initialStepId,
  onRefresh,
}: {
  availableMenus: TakinOrdersQueryQuery["menus"]["data"];
  tableCurrentOrder: TakinOrdersQueryQuery["order"];
  actions: {
    createStep: CreateOrderStepAction;
    addMenuToStep: AddStepMenuAction;
    cancelStepMenu: CancelStepMenuAction;
    markStepMenuServed: MarkStepMenuServedAction;
    cancelOrder: CancelOrderAction;
    payOrder: PayOrderAction;
  };
  initialStepId?: string | null;
  onRefresh?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState("all");
  const initialSelection = initialStepId ?? "new";
  const [currentStep, setCurrentStep] = useState(initialSelection);
  const [draftStepMenus, setDraftStepMenus] = useState<StepMenuDraft[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingMenuId, setPendingMenuId] = useState<string | null>(null);
  const [pendingMenuAction, setPendingMenuAction] = useState<
    "serve" | "cancel" | null
  >(null);

  const menusData = useMemo(() => availableMenus ?? [], [availableMenus]);

  const { createStep, addMenuToStep, cancelStepMenu, markStepMenuServed } =
    actions;

  const hasOrder = Boolean(tableCurrentOrder);

  useEffect(() => {
    const next = initialStepId ?? "new";
    setCurrentStep((prev) => (prev === next ? prev : next));
  }, [initialStepId]);

  const orderSteps = useMemo<OrderStep[]>(() => {
    if (!tableCurrentOrder) {
      return [];
    }
    return [...tableCurrentOrder.steps].sort((a, b) => a.position - b.position);
  }, [tableCurrentOrder]);

  const currentStepDetails = useMemo<OrderStep | null>(() => {
    if (currentStep === "new") {
      return null;
    }
    return orderSteps.find((step) => step.id === currentStep) ?? null;
  }, [currentStep, orderSteps]);

  const existingStepMenus = useMemo<ExistingStepMenu[]>(() => {
    if (!currentStepDetails) {
      return [];
    }

    return currentStepDetails.stepMenus.map((menu) => ({
      id: menu.id,
      name: menu.menu.name,
      quantity: menu.quantity,
      note: menu.note ?? null,
      status: menu.status,
      price: menu.menu.price,
    }));
  }, [currentStepDetails]);

  const existingStepTotal = useMemo(() => {
    return existingStepMenus.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [existingStepMenus]);

  const draftStepTotal = useMemo(() => {
    return draftStepMenus.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [draftStepMenus]);

  useEffect(() => {
    setDraftStepMenus([]);
    setActionError(null);
  }, [currentStep]);

  useEffect(() => {
    if (!hasOrder && currentStep !== "new") {
      setCurrentStep("new");
    }
  }, [hasOrder, currentStep]);

  useEffect(() => {
    if (currentStep === "new") {
      return;
    }

    if (!currentStepDetails) {
      setCurrentStep("new");
    }
  }, [currentStep, currentStepDetails]);

  const availableTypes = useMemo(() => {
    return Array.from(
      new Set(
        (menusData ?? [])
          .map((m) => m.menu_type?.name)
          .filter((v): v is string => !!v)
      )
    ).sort();
  }, [menusData]);

  const filteredMenuItems = useMemo(() => {
    if (selectedType === "all") {
      return menusData;
    }
    return menusData.filter((m) => m.menu_type?.name === selectedType);
  }, [menusData, selectedType]);

  const addMenuToDraft = useCallback(
    (menu: TakinOrdersQueryQuery["menus"]["data"][number]) => {
      setDraftStepMenus((prev) => {
        const existingIndex = prev.findIndex((item) => item.menuId === menu.id);

        if (existingIndex === -1) {
          return [
            ...prev,
            {
              menuId: menu.id,
              name: menu.name,
              quantity: 1,
              note: "",
              price: menu.price,
            },
          ];
        }

        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };

        return next;
      });
    },
    []
  );

  const updateDraftQuantity = useCallback(
    (menuId: string, quantity: number) => {
      setDraftStepMenus((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.menuId !== menuId);
        }

        return prev.map((item) =>
          item.menuId === menuId ? { ...item, quantity } : item
        );
      });
    },
    []
  );

  const updateDraftNote = useCallback((menuId: string, note: string) => {
    setDraftStepMenus((prev) =>
      prev.map((item) => (item.menuId === menuId ? { ...item, note } : item))
    );
  }, []);

  const removeDraftMenu = useCallback((menuId: string) => {
    setDraftStepMenus((prev) => prev.filter((item) => item.menuId !== menuId));
  }, []);

  const handleSelectNewStep = useCallback(() => {
    setCurrentStep("new");
    setDraftStepMenus([]);
    setActionError(null);
  }, []);

  const handleSubmitStep = useCallback(() => {
    if (!tableCurrentOrder) {
      setActionError("No order selected");
      return;
    }

    if (draftStepMenus.length === 0) {
      setActionError("Select at least one menu to add");
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    const payloadMenus = draftStepMenus.map((menu) => {
      const note = menu.note?.trim();

      return {
        menu_id: Number(menu.menuId),
        quantity: menu.quantity,
        ...(note ? { note } : {}),
      } satisfies StepMenuPayload;
    });

    startTransition(async () => {
      let result:
        | Awaited<ReturnType<CreateOrderStepAction>>
        | { success: true } = { success: true };

      if (currentStep === "new") {
        const request: CreateOrderStepInput = { menus: payloadMenus };
        result = await createStep(request);
      } else {
        for (const menuPayload of payloadMenus) {
          const addPayload: AddStepMenuInput = menuPayload;
          const stepResult = await addMenuToStep(currentStep, addPayload);

          if (!stepResult.success) {
            result = stepResult;
            break;
          }
        }
      }

      if (!result.success) {
        setActionError(result.error);
        setIsSubmitting(false);
        return;
      }

      setDraftStepMenus([]);
      setIsSubmitting(false);
      await onRefresh?.();
      router.refresh();
    });
  }, [
    addMenuToStep,
    createStep,
    currentStep,
    draftStepMenus,
    onRefresh,
    router,
    startTransition,
    tableCurrentOrder,
  ]);

  const handleServeStepMenu = useCallback(
    (stepMenuId: string) => {
      setActionError(null);
      setPendingMenuId(stepMenuId);
      setPendingMenuAction("serve");

      startTransition(async () => {
        const result = await markStepMenuServed(stepMenuId);

        if (!result.success) {
          setActionError(result.error);
        } else {
          await onRefresh?.();
          router.refresh();
        }

        setPendingMenuId(null);
        setPendingMenuAction(null);
      });
    },
    [markStepMenuServed, onRefresh, router, startTransition]
  );

  const handleCancelStepMenu = useCallback(
    (stepMenuId: string, input?: CancelStepMenuInput) => {
      setActionError(null);
      setPendingMenuId(stepMenuId);
      setPendingMenuAction("cancel");

      startTransition(async () => {
        const result = await cancelStepMenu(stepMenuId, input);

        if (!result.success) {
          setActionError(result.error);
        } else {
          await onRefresh?.();
          router.refresh();
        }

        setPendingMenuId(null);
        setPendingMenuAction(null);
      });
    },
    [cancelStepMenu, onRefresh, router, startTransition]
  );

  console.log({ draftStepMenus });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={"all" === selectedType ? "khp-default" : "outline"}
                onClick={() => setSelectedType("all")}
              >
                All
              </Button>
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  variant={type === selectedType ? "khp-default" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredMenuItems.length === 0 && (
            <p className="text-gray-600">No menu items available.</p>
          )}

          {filteredMenuItems.map((item) => (
            <Card
              key={item.id}
              className="khp-card cursor-pointer hover:shadow-md khp-table-row"
              onClick={() => addMenuToDraft(item)}
            >
              <CardContent className="p-4">
                {item.image_url && (
                  <div className="flex justify-between items-start mb-2">
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <PreparationStatusBadge status={item.service_type} />
                </div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-gray-600 text-sm">Allergens: </p>
                  <div className="flex flex-wrap gap-1">
                    {item.allergens && item.allergens.length > 0 ? (
                      item.allergens.map((allergen) => (
                        <AllegernsBadge
                          key={allergen}
                          allergens={allergen}
                          variant="outline"
                        />
                      ))
                    ) : (
                      <span>No allergens</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    {item.price.toFixed(2)}€
                  </span>
                  <Button
                    size="lg"
                    className="touch-target"
                    variant="khp-default"
                    onClick={(event) => {
                      event.stopPropagation();
                      addMenuToDraft(item);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-khp-primary" />
                <Select
                  value={currentStep}
                  onValueChange={(value) => {
                    setCurrentStep(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hasOrder &&
                      orderSteps.map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.position} - {getPreparationLabel(step.status)}
                        </SelectItem>
                      ))}
                    <SelectItem value="new">New step</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end w-full sm:w-auto">
                <Button
                  variant="khp-default"
                  className="w-full sm:w-auto"
                  onClick={handleSelectNewStep}
                  disabled={isPending}
                >
                  New step
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepDetails && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Menus already in this step
                  </span>
                  <span className="text-sm text-gray-500">
                    Total: {existingStepTotal.toFixed(2)}€
                  </span>
                </div>
                {existingStepMenus.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No menu recorded for this step.
                  </p>
                ) : (
                  existingStepMenus.map((item) => (
                    <div
                      key={item.id}
                      className="space-y-2 p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.price.toFixed(2)}€ × {item.quantity} ={" "}
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          {getPreparationLabel(item.status) ?? item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Note:{" "}
                        {item.note && item.note.length > 0 ? item.note : "—"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.status !== "SERVED" && (
                          <Button
                            size="sm"
                            variant="khp-default"
                            className={
                              item.status === "READY"
                                ? ""
                                : "pointer-events-none opacity-60"
                            }
                            disabled={
                              item.status !== "READY" ||
                              (pendingMenuId === item.id &&
                                pendingMenuAction === "serve")
                            }
                            onClick={() => handleServeStepMenu(item.id)}
                          >
                            {pendingMenuId === item.id &&
                            pendingMenuAction === "serve"
                              ? "Serving..."
                              : "Mark as served"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="khp-destructive"
                          disabled={
                            pendingMenuId === item.id &&
                            pendingMenuAction === "cancel"
                          }
                          onClick={() => handleCancelStepMenu(item.id)}
                          className="text-white bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
                        >
                          {pendingMenuId === item.id &&
                          pendingMenuAction === "cancel"
                            ? "Cancelling..."
                            : "Cancel menu"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {currentStep === "new" ? "New step" : "Menus to add"}
                </span>
                <span className="text-sm text-gray-500">
                  Total: {draftStepTotal.toFixed(2)}€
                </span>
              </div>
              {draftStepMenus.length === 0 ? (
                <p className="text-gray-500 text-center py-6 text-sm">
                  Select menus to{" "}
                  {currentStep === "new" ? "create" : "complete"} this step.
                </p>
              ) : (
                <>
                  {draftStepMenus.map((item) => (
                    <div
                      key={item.menuId}
                      className="space-y-3 p-3 rounded-lg border bg-white"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.price.toFixed(2)}€ × {item.quantity} ={" "}
                            {(item.price * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDraftMenu(item.menuId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateDraftQuantity(item.menuId, item.quantity - 1)
                          }
                          className="touch-target"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateDraftQuantity(item.menuId, item.quantity + 1)
                          }
                          className="touch-target"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Note:</span>
                        </div>
                        <Textarea
                          placeholder="Special instructions..."
                          value={item.note ?? ""}
                          onChange={(e) =>
                            updateDraftNote(item.menuId, e.target.value)
                          }
                          className="min-h-[60px] text-sm"
                          maxLength={1000}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Draft total:</span>
                      <span className="text-blue-600">
                        {draftStepTotal.toFixed(2)}€
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full touch-target"
                        size="lg"
                        onClick={handleSubmitStep}
                        disabled={isSubmitting || isPending}
                        variant="khp-default"
                      >
                        {isSubmitting ? "Submitting..." : "Send to kitchen"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full touch-target bg-transparent"
                        onClick={() => {
                          setDraftStepMenus([]);
                          setActionError(null);
                        }}
                        disabled={isSubmitting || isPending}
                      >
                        Reset selection
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {actionError && (
              <p className="text-sm text-red-600">{actionError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TakinOrders;
