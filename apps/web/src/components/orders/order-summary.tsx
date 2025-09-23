"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { AllegernsBadge } from "@workspace/ui/components/allergens-badge";
import type { TakinOrdersQueryQuery } from "@/graphql/generated/graphql";

type Order = NonNullable<TakinOrdersQueryQuery["order"]>;

interface OrderSummaryProps {
  order: Order;
}

export function OrderSummary({ order }: OrderSummaryProps) {
  // Flatten all menu items from all steps
  const allMenuItems = order.steps.flatMap((step) =>
    step.stepMenus.map((stepMenu) => ({
      ...stepMenu,
      stepPosition: step.position,
      stepStatus: step.status,
    }))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Summary</span>
          <Badge variant="outline" className="text-lg font-bold">
            Total: €{order.price.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allMenuItems.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
            {/* Menu Image */}
            <div className="w-16 h-16 flex-shrink-0">
              {item.menu.image_url ? (
                <img
                  src={item.menu.image_url}
                  alt={item.menu.name}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <ImagePlaceholder className="w-full h-full rounded-md" />
              )}
            </div>

            {/* Menu Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-khp-text-primary">
                    {item.menu.name}
                  </h4>
                </div>
                <div className="text-right">
                  <p className="font-medium">€{item.menu.price.toFixed(2)}</p>
                  <p className="text-sm text-khp-text-secondary">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>

              {/* Menu Meta */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="text-xs">
                  Step {item.stepPosition}
                </Badge>

                <Badge
                  variant={item.status === "SERVED" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {item.status}
                </Badge>
              </div>

              {/* Allergens */}
              {item.menu.allergens && item.menu.allergens.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.menu.allergens.map((allergen) => (
                    <AllegernsBadge
                      key={allergen}
                      allergens={allergen}
                      variant="outline"
                    />
                  ))}
                </div>
              )}

              {/* Note */}
              {item.note && (
                <div className="bg-khp-warning/10 border-l-4 border-khp-warning p-2 rounded">
                  <p className="text-sm text-khp-warning">
                    <strong>Note:</strong> {item.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {allMenuItems.length === 0 && (
          <p className="text-center text-khp-text-secondary py-8">
            No items in this order
          </p>
        )}
      </CardContent>
    </Card>
  );
}
