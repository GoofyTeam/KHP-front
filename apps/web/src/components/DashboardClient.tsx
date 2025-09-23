"use client";

import { useQuery } from "@apollo/client";
import { GetQuickAccessButtonDocument } from "@workspace/graphql";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import {
  getQuickAccessUrl,
  getQuickAccessBgClass,
} from "@workspace/ui/lib/quick-access-utils";
import { LowStock } from "@/components/LowStock";
import { Orders } from "@/components/Orders";
import { Perishable } from "@/components/Perishable";
import { LiveWelcomePanel } from "@/components/LiveWelcomePanel";
import Link from "next/link";

export default function DashboardClient() {
  const {
    data: quickAccessData,
    loading: quickAccessLoading,
    error: quickAccessError,
  } = useQuery(GetQuickAccessButtonDocument);

  if (quickAccessLoading) return <div>Loading...</div>;
  if (quickAccessError) return <div>Error: {quickAccessError.message}</div>;
  if (!quickAccessData) return <div>No data</div>;

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <LiveWelcomePanel className="col-span-12 h-32" />

      <div className="col-span-12 grid grid-cols-12 gap-4 h-[calc(100vh-11rem)]">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <Orders className="md:col-span-6 md:h-full" />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <Perishable className="md:col-span-6 md:h-full" />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <LowStock className="md:col-span-6 md:h-full" />
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3 grid grid-cols-3 gap-4 h-full">
          {quickAccessData?.quickAccesses?.map((button: any, index: number) => (
            <Link
              key={button.id}
              href={getQuickAccessUrl(button.url_key)}
              className={`h-full text-white text-center p-4 hover:bg-opacity-80 rounded-lg transition-colors ${getQuickAccessBgClass(
                button.url_key
              )} ${
                index >= 3 ? "col-span-1" : "col-span-1"
              } flex items-center justify-center text-xs font-medium`}
            >
              <QuickAccessButton
                title={button.name}
                icon={button.icon}
                color={button.icon_color}
                asChild
              >
                <span />
              </QuickAccessButton>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
