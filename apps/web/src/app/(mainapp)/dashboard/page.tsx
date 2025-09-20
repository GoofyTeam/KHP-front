import {
  GetQuickAccessButtonDocument,
  GetThresholdDocument,
  GetOrdersDocument,
  GetPerishableDocument,
} from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import {
  getQuickAccessUrl,
  getQuickAccessBgClass,
} from "@workspace/ui/lib/quick-access-utils";
import { LowStock } from "@/components/LowStock";
import { Orders } from "@/components/Orders";
import { Perishable } from "@/components/Perishable";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function WelcomePanel({ className }: { className?: string }) {
  const now = new Date();
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      className={`rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0 ${className}`}
      aria-label="Welcome"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-khp-text-primary mb-4">
          Welcome
        </h2>
        <div className="text-center">
          <p className="text-lg text-khp-text-secondary mb-2">{currentDate}</p>
          <p className="text-xl font-semibold text-khp-primary">
            {currentTime}
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function Dashboard() {
  const { data, error } = await query({
    query: GetQuickAccessButtonDocument,
  });

  const { data: thresholdData, error: thresholdError } = await query({
    query: GetThresholdDocument,
  });

  const { data: ordersData, error: ordersError } = await query({
    query: GetOrdersDocument,
  });

  const { data: perishableData, error: perishableError } = await query({
    query: GetPerishableDocument,
  });

  if (error || thresholdError || ordersError || perishableError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-red-500">
          An error occurred while fetching the dashboard data. Please try again
          later.
        </p>
      </div>
    );
  }

  const sortedAccesses = (data?.quickAccesses ?? [])
    .slice()
    .sort((a, b) => Number(a.id) - Number(b.id));

  const quickAccesses = sortedAccesses.slice(0, 4);
  const extraAccess = sortedAccesses[4];

  return (
    <main className="md:h-dvh h-auto md:overflow-y-clip overflow-auto box-border md:-m-4">
      <div className="flex h-full flex-col box-border p-8 pb-0">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:[grid-template-rows:0.8fr_1fr]">
          <WelcomePanel className="md:col-span-6 md:h-full" />

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
              <Link
                href={getQuickAccessUrl(extraAccess.url_key)}
                className={`block rounded-md px-4 py-4 text-center font-semibold text-white ${getQuickAccessBgClass(
                  extraAccess.icon_color
                )}`}
              >
                {extraAccess.name}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
