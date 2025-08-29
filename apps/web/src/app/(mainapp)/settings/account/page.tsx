import { AccountForm } from "@/components/account-form";

export default function Account() {
  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full">
        <div className=" p-8">
          <AccountForm />
        </div>
      </div>
    </div>
  );
}
