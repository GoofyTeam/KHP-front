import { query } from "@/lib/ApolloClient";
import { GetPreparationsDocument } from "@/graphql/generated/graphql";
import { PreparationsTable } from "@/components/preparation/preparation-columns";

export default async function PreparationPage() {
  const { data, error } = await query({
    query: GetPreparationsDocument,
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  return (
    <div>
      <PreparationsTable data={data.preparations.data || []} />
    </div>
  );
}
