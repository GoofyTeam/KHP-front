import { GetLocationsDocument } from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import Link from "next/link";

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

  console.log("Dashboard error:", error);
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

  console.log("Dashboard data:", data);

  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="text-2xl font-bold text-center mt-4">Dashboard</h1>
      <QuickAccessButton asChild title="Quick Access" icon="plus" color="green">
        <Link href="/stock" />
      </QuickAccessButton>
    </div>
  );
}
