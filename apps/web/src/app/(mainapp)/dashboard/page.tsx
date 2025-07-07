import { QuickAccessButton } from "@workspace/ui/components/quick-access-button";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex h-full w-full flex-col">
      <h1 className="text-2xl font-bold text-center mt-4">Dashboard</h1>
      <QuickAccessButton asChild title="Quick Access" icon="plus" color="green">
        <Link href="/stock" />
      </QuickAccessButton>
    </div>
  );
}
