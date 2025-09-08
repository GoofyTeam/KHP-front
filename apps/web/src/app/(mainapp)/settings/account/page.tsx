"use client";

import { useQuery, gql } from "@apollo/client";
import { AccountForm } from "@/components/account/account-form";

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      company {
        id
        name
      }
    }
  }
`;

export default function Account() {
  const { data, loading } = useQuery(GET_ME, {
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
  });

  const user = data?.me
    ? {
        id: parseInt(data.me.id),
        name: data.me.name,
        email: data.me.email,
        company_id: data.me.company ? parseInt(data.me.company.id) : undefined,
      }
    : undefined;

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center lg:p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-khp-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center lg:p-4">
      <div className="w-full">
        <div className="lg:p-8">
          <AccountForm user={user} />
        </div>
      </div>
    </div>
  );
}
