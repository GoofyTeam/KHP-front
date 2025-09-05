import { AccountForm } from "@/components/account-form";
import { query } from "@/lib/ApolloClient";
import { GetUserDocument } from "@/graphql/generated/graphql";

type AccountFormUser = {
  id?: number;
  name?: string;
  email?: string;
  company_id?: number;
  updated_at?: string;
};

async function getUser(): Promise<AccountFormUser | null> {
  try {
    const { data } = await query({
      query: GetUserDocument,
      errorPolicy: "all",
    });

    if (!data?.user) return null;

    return {
      id: parseInt(data.user.id),
      name: data.user.name,
      email: data.user.email,
      company_id: data.user.company
        ? parseInt(data.user.company.id)
        : undefined,
    };
  } catch {
    return null;
  }
}

export default async function Account() {
  const user = await getUser();

  return (
    <div className="h-full flex items-center justify-center lg:p-4">
      <div className="w-full">
        <div className="lg:p-8">
          <AccountForm user={user ?? { name: "", email: "" }} />
        </div>
      </div>
    </div>
  );
}
