import {
  GetQuickAccessButtonDocument,
  GetThresholdDocument,
  GetOrdersDocument,
  GetPerishableDocument,
} from "@workspace/graphql";
import { query } from "@/lib/ApolloClient";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import {
  getQuickAccessUrl,
  getQuickAccessBgClass,
} from "@workspace/ui/lib/quick-access-utils";
import { LowStock } from "@/components/LowStock";
import { Orders } from "@/components/Orders";
import { Perishable } from "@/components/Perishable";
import { formatTime, formatLongDate } from "@workspace/ui/lib/date-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function WelcomePanel({ className }: { className?: string }) {
  const now = new Date();
  const currentDateString = now.toISOString();
  const currentDate = formatLongDate(currentDateString, "en-US");
  const currentTime = formatTime(currentDateString, "en-US");

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
  const [
    { data, error },
    { data: thresholdData, error: thresholdError },
    { data: ordersData, error: ordersError },
    { data: perishableData, error: perishableError },
  ] = await Promise.all([
    query({ query: GetQuickAccessButtonDocument }),
    query({ query: GetThresholdDocument }),
    query({ query: GetOrdersDocument }),
    query({ query: GetPerishableDocument }),
  ]);

  if (error) {
    throw new Error(`Failed to fetch quick access data: ${error.message}`);
  }
  if (thresholdError) {
    throw new Error(
      `Failed to fetch threshold data: ${thresholdError.message}`
    );
  }
  if (ordersError) {
    throw new Error(`Failed to fetch orders data: ${ordersError.message}`);
  }
  if (perishableError) {
    throw new Error(
      `Failed to fetch perishable data: ${perishableError.message}`
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
