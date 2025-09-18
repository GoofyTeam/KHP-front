import { query } from "@/lib/ApolloClient";
import { DataTable } from "@/components/meals/meals-data-table";
import { columns } from "@/components/meals/meals-column";
import { GetMenusDocument } from "@/graphql/generated/graphql";

export default async function MenusPage() {
  const { data, error } = await query({
    query: GetMenusDocument,
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  return (
    <div>
      <DataTable columns={columns} data={data.menus?.data || []} />
    </div>
  );
}
