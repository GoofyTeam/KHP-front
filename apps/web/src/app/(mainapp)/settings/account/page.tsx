import { AccountForm } from "@/components/account/account-form";
import { getUserAction } from "./actions";
import { redirect } from "next/navigation";

export default async function Account() {
  const result = await getUserAction();

  if (!result.success || !result.data) {
    console.error(
      "Failed to fetch user:",
      !result.success ? result.error : "No user data"
    );
    redirect("/login");
  }

  return (
    <div className="h-full flex items-center justify-center lg:p-4">
      <div className="w-full">
        <div className="lg:p-8">
          <AccountForm user={result.data} />
        </div>
      </div>
    </div>
  );
}
