import { GetLocationsDocument } from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import { ListPanel } from "@/components/ListPanel";
import OrderLoss from "@/components/OrderLoss";
import UsedItems from "@/components/UsedItems";
import Link from "next/link";

// Avoid static generation rendering for this page
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  const { data, loading, error } = await query({
    query: GetLocationsDocument,
  });

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p>Please wait while we fetch the dashboard data.</p>
      </div>
    );
  }

  if (error) {
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

  return (
    <main className="md:h-dvh h-auto md:overflow-y-clip overflow-auto box-border md:-m-4">
      <div className="flex h-full flex-col box-border p-8 pb-0">
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-3 md:[grid-template-rows:0.8fr_1fr]">
          <OrderLoss
            className="md:col-span-3 md:h-full"
            lossCount={9}
            lossHref="/loss"
            ordersCount={14}
            ordersHref="/orders"
          />

          <UsedItems images="disabled" className="md:col-span-3 md:h-full" />

          <ListPanel
            type="activity"
            primaryActionLabel="More details"
            primaryActionHref="/recent-activity"
            className="md:col-span-6 md:h-full"
          />

          <ListPanel
            type="critical"
            className="md:col-span-4 md:row-start-2 md:h-full"
            primaryActionLabel="More details"
            primaryActionHref="/critical"
          />

          <ListPanel
            type="low-stock"
            className="md:col-span-4 md:row-start-2 md:h-full"
            addHref="/add-items"
          />

          <section className="md:col-span-4 md:row-start-2 md:h-full flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-h-0">
              <QuickAccessButton
                asChild
                title="Add to stock"
                icon="plus"
                color="green"
                size="sm"
                stretch
              >
                <Link href="/stock/add">
                  <span />
                </Link>
              </QuickAccessButton>
              <QuickAccessButton
                asChild
                title="Add a loss"
                icon="plus"
                color="red"
                size="sm"
                stretch
              >
                <Link href="/loss/add">
                  <span />
                </Link>
              </QuickAccessButton>
              <QuickAccessButton
                asChild
                title="Another quick action"
                icon="plus"
                color="green"
                size="sm"
                stretch
              >
                <Link href="/actions/other">
                  <span />
                </Link>
              </QuickAccessButton>
              <QuickAccessButton
                asChild
                title="Take Order"
                icon="note"
                color="green"
                size="sm"
                stretch
              >
                <Link href="/orders/new">
                  <span />
                </Link>
              </QuickAccessButton>
            </div>

            <div className="mt-auto">
              <Link
                href="/actions"
                className="block rounded-md bg-khp-primary px-4 py-4 text-center font-semibold text-white"
              >
                Another quick action
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
