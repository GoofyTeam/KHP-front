"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getStepStatusIcon, OrderStepStatus } from "@workspace/ui/lib/order";
import { cn } from "@workspace/ui/lib/utils";
import type { TakinOrdersQueryQuery } from "@workspace/graphql";

type OrderStep = NonNullable<TakinOrdersQueryQuery["order"]>["steps"][number];

interface OrderStepsDisplayProps {
  steps: OrderStep[];
}

export function OrderStepsDisplay({ steps }: OrderStepsDisplayProps) {
  const getStepIcon = (status: string) => {
    const IconComponent = getStepStatusIcon(status as OrderStepStatus);
    const colorClass =
      status === "SERVED"
        ? "text-khp-primary"
        : status === "READY"
          ? "text-khp-info"
          : status === "IN_PREP"
            ? "text-khp-warning"
            : "text-khp-text-secondary";

    return <IconComponent className={cn("h-5 w-5", colorClass)} />;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case "SERVED":
        return cn("bg-khp-primary/10 text-khp-primary border-khp-primary/20");
      case "READY":
        return cn("bg-khp-info/10 text-khp-info border-khp-info/20");
      case "IN_PREP":
        return cn("bg-khp-warning/10 text-khp-warning border-khp-warning/20");
      default:
        return cn(
          "bg-khp-background-secondary text-khp-text-secondary border-khp-border"
        );
    }
  };

  const getMenuStatusColor = (status: string) => {
    switch (status) {
      case "SERVED":
        return cn("bg-khp-primary/10 text-khp-primary border-khp-primary/20");
      case "READY":
        return cn("bg-khp-info/10 text-khp-info border-khp-info/20");
      case "IN_PREP":
        return cn("bg-khp-warning/10 text-khp-warning border-khp-warning/20");
      default:
        return cn(
          "bg-khp-background-secondary text-khp-text-secondary border-khp-border"
        );
    }
  };

  const sortedSteps = [...steps].sort((a, b) => b.position - a.position);

  return (
    <div className="space-y-4">
      {sortedSteps.map((step) => (
        <Card key={step.id} className="border-l-4 border-l-khp-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStepIcon(step.status)}
                <span>Step {step.position}</span>
              </div>
              <Badge className={getStepStatusColor(step.status)}>
                {step.status.replace("_", " ")}
              </Badge>
            </CardTitle>
            <div className="text-sm text-khp-text-secondary">
              Created:{" "}
              {format(new Date(step.created_at), "dd/MM/yyyy HH:mm", {
                locale: fr,
              })}
              {step.served_at && (
                <span className="ml-4">
                  Served:{" "}
                  {format(new Date(step.served_at), "dd/MM/yyyy HH:mm", {
                    locale: fr,
                  })}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {step.stepMenus.map((stepMenu) => (
              <div
                key={stepMenu.id}
                className="flex items-center justify-between p-3 bg-khp-background-secondary rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{stepMenu.menu.name}</span>
                    <Badge
                      className={getMenuStatusColor(stepMenu.status)}
                      variant="outline"
                    >
                      {stepMenu.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="text-sm text-khp-text-secondary">
                    Quantity: {stepMenu.quantity} • €
                    {stepMenu.menu.price.toFixed(2)} each
                  </div>

                  {stepMenu.note && (
                    <div className="text-sm text-khp-text-secondary mt-1 italic">
                      Note: {stepMenu.note}
                    </div>
                  )}

                  <div className="text-xs text-khp-text-secondary mt-1">
                    Created:{" "}
                    {format(new Date(stepMenu.created_at), "HH:mm", {
                      locale: fr,
                    })}
                    {stepMenu.served_at && (
                      <span className="ml-2">
                        Served:{" "}
                        {format(new Date(stepMenu.served_at), "HH:mm", {
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium">
                    €{(stepMenu.menu.price * stepMenu.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            {step.stepMenus.length === 0 && (
              <p className="text-center text-khp-text-secondary py-4">
                No items in this step
              </p>
            )}
          </CardContent>
        </Card>
      ))}

      {sortedSteps.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-khp-text-secondary">
              No steps found for this order
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
