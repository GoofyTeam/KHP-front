import { AccountForm } from "@/components/account-form";

export default function Account() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-khp-surface rounded-lg shadow-sm border border-khp-border p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-khp-text-primary">
              Account Settings
            </h1>
            <p className="text-sm text-khp-text-secondary mt-2">
              Update your personal information
            </p>
          </div>

          <AccountForm />
        </div>
      </div>
    </div>
  );
}
