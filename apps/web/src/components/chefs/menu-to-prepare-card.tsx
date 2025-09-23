import { ChefsOrderStepsQuery } from "@/graphql/generated/graphql";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";
import { getUrgencyColor, getWaitingTime } from "@workspace/ui/lib/order";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { httpClient } from "@/lib/httpClient";

type MenuToPrepareCardProps = {
  menuItem: ChefsOrderStepsQuery["orderSteps"]["data"][0]["stepMenus"][0];
  orderItem: ChefsOrderStepsQuery["orderSteps"]["data"][0]["order"];
  onStatusChange?: () => void | Promise<unknown>;
};

function MenuToPrepareCard({
  menuItem,
  orderItem,
  onStatusChange,
}: MenuToPrepareCardProps) {
  const menu = menuItem?.menu;
  const table = orderItem?.table;

  const [tick, setTick] = useState(0);
  const [isMarkingReady, setIsMarkingReady] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const waitingTime = useMemo(() => {
    void tick;
    return getWaitingTime(menuItem.created_at);
  }, [menuItem.created_at, tick]);

  const urgencyColor = useMemo(() => {
    void tick;
    return getUrgencyColor(menuItem.created_at);
  }, [menuItem.created_at, tick]);

  const isInPreparation = menuItem.status === "IN_PREP";

  const handleMarkReady = useCallback(async () => {
    if (!isInPreparation || isMarkingReady) {
      return;
    }

    try {
      setIsMarkingReady(true);
      await httpClient.post(
        `/api/orders/${orderItem.id}/step-menus/${menuItem.id}/ready`,
      );
      toast.success("Menu marked as ready to serve.");
      await onStatusChange?.();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to mark this menu as ready.";
      toast.error(message);
    } finally {
      setIsMarkingReady(false);
    }
  }, [
    isInPreparation,
    isMarkingReady,
    menuItem.id,
    onStatusChange,
    orderItem.id,
  ]);

  const cardStateClasses = isInPreparation
    ? "cursor-pointer hover:shadow-lg active:scale-95 border-l-4 border-l-orange-500"
    : "border-l-4 border-l-green-500 bg-green-50/50";

  const cardInteractionClasses = isMarkingReady
    ? "pointer-events-none opacity-90"
    : "";

  if (!menu || !table) return null;

  return (
    <Card
      className={`khp-card overflow-hidden transition-all duration-200 min-h-[200px] ${cardStateClasses} ${cardInteractionClasses}`}
      onClick={isInPreparation ? handleMarkReady : undefined}
    >
      <CardContent className="p-0 h-full flex flex-col">
        <div className="flex gap-4 p-6 flex-1">
          {menu.image_url && (
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src={menu.image_url}
                alt={menu.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                  {menu.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-600">
                    Table {table.label} • {table.room.name}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                Qty: {menuItem.quantity}
              </Badge>
            </div>

            {menuItem.note && (
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <span className="font-medium text-gray-800">Note:</span>
                <span className="text-gray-700 ml-1">{menuItem.note}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-sm font-medium ${urgencyColor}`}>
                  {waitingTime}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {menuItem.menu.price.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {menuItem.status === "IN_PREP" ? (
          <div className="bg-orange-50 border-t border-orange-100 p-4 text-center mt-auto">
            <div className="flex items-center justify-center gap-2 text-orange-700 font-medium">
              {isMarkingReady ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>
                {isMarkingReady ? "Marking as ready..." : "Tap to mark ready"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border-t border-green-100 p-4 text-center mt-auto">
            <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Ready to serve, waiter!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MenuToPrepareCard;
