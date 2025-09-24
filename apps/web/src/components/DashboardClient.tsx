"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@apollo/client";
import {
  GetQuickAccessButtonDocument,
  GetThresholdDocument,
  GetOrdersDocument,
  GetPerishableDocument,
  GetBusinessHoursDocument,
} from "@workspace/graphql";
import { useBusinessHoursCountdown } from "@/hooks/use-business-hours-countdown";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import {
  getQuickAccessUrl,
  getQuickAccessBgClass,
} from "@workspace/ui/lib/quick-access-utils";
import { LowStock } from "@/components/LowStock";
import { Orders } from "@/components/Orders";
import { Perishable } from "@/components/Perishable";
import { cn } from "@workspace/ui/lib/utils";
import { LiveWelcomePanel } from "@/components/LiveWelcomePanel";
import Link from "next/link";

export function DashboardClient() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lowStockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: quickAccessData } = useQuery(GetQuickAccessButtonDocument, {
    notifyOnNetworkStatusChange: true,
    errorPolicy: "all",
  });

  const { data: thresholdData, refetch: refetchThreshold } = useQuery(
    GetThresholdDocument,
    {
      notifyOnNetworkStatusChange: true,
      errorPolicy: "all",
    }
  );

  const { data: ordersData, refetch: refetchOrders } = useQuery(
    GetOrdersDocument,
    {
      notifyOnNetworkStatusChange: true,
      errorPolicy: "all",
    }
  );

  const { data: perishableData, refetch: refetchPerishable } = useQuery(
    GetPerishableDocument,
    {
      notifyOnNetworkStatusChange: true,
      errorPolicy: "all",
    }
  );

  const { data: businessHoursData, refetch: refetchBusinessHours } = useQuery(
    GetBusinessHoursDocument,
    {
      notifyOnNetworkStatusChange: true,
      errorPolicy: "all",
    }
  );

  const { isOpen } = useBusinessHoursCountdown(
    businessHoursData?.me?.company?.businessHours
  );

  useEffect(() => {
    if (!businessHoursData?.me?.company?.businessHours) {
      return;
    }

    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      const refreshInterval = isOpen ? 15000 : 300000;

      intervalRef.current = setInterval(async () => {
        try {
          await Promise.all([
            refetchOrders(),
            refetchPerishable(),
            ...(Math.random() < 0.1 ? [refetchBusinessHours()] : []),
          ]);
        } catch (error) {
          console.error("Error refreshing dashboard data:", error);
        }
      }, refreshInterval);
    };

    setupInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isOpen,
    businessHoursData,
    refetchOrders,
    refetchPerishable,
    refetchBusinessHours,
  ]);

  useEffect(() => {
    lowStockIntervalRef.current = setInterval(async () => {
      try {
        await refetchThreshold();
      } catch (error) {
        console.error("Error refreshing low stock data:", error);
      }
    }, 60000);

    return () => {
      if (lowStockIntervalRef.current) {
        clearInterval(lowStockIntervalRef.current);
      }
    };
  }, [refetchThreshold]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (lowStockIntervalRef.current) {
        clearInterval(lowStockIntervalRef.current);
      }
    };
  }, []);

  const sortedAccesses = (quickAccessData?.quickAccesses ?? [])
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id));

  const quickAccesses = sortedAccesses.slice(0, 4);
  const extraAccess = sortedAccesses[4];

  if (
    !quickAccessData ||
    !thresholdData ||
    !ordersData ||
    !perishableData ||
    !businessHoursData
  ) {
    return (
      <main className="md:h-dvh h-auto md:overflow-y-clip overflow-auto box-border md:-m-4">
        <div className="flex h-full flex-col box-border p-8 pb-0">
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-khp-primary mx-auto mb-4"></div>
              <p className="text-khp-text-secondary">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="md:h-dvh h-auto md:overflow-y-clip overflow-auto box-border md:-m-4">
      <div className="flex h-full flex-col box-border p-8 pb-0">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:[grid-template-rows:0.8fr_1fr]">
          <LiveWelcomePanel
            className="md:col-span-6 md:h-full"
            businessHours={businessHoursData?.me?.company?.businessHours}
          />

          <Orders data={ordersData} className="md:col-span-6 md:h-full" />

          <Perishable
            data={perishableData}
            className="md:col-span-4 md:row-start-2 md:h-full"
          />

          <LowStock
            thresholdData={thresholdData}
            className="md:col-span-4 md:row-start-2 md:h-full"
          />

          <section className="md:col-span-4 md:row-start-2 md:h-full flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-h-0">
              {quickAccesses.map((qa) => (
                <QuickAccessButton
                  key={qa.id}
                  asChild
                  title={qa.name}
                  icon={qa.icon}
                  color={qa.icon_color}
                  size="sm"
                  stretch
                >
                  <Link href={getQuickAccessUrl(qa.url_key)}>
                    <span />
                  </Link>
                </QuickAccessButton>
              ))}
            </div>

            <div className="mt-auto">
              {extraAccess && (
                <Link
                  href={getQuickAccessUrl(extraAccess.url_key)}
                  className={cn(
                    "block rounded-md px-4 py-4 text-center font-semibold text-white",
                    getQuickAccessBgClass(extraAccess.icon_color)
                  )}
                >
                  {extraAccess.name}
                </Link>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
