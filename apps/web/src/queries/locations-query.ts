import { query } from "@/lib/ApolloClient";
import { GetLocationsDocument } from "@/graphql/generated/graphql";
import type { Location } from "@/types/stocks";

/**
 * Fetch all available locations
 */
export async function fetchLocations(): Promise<Location[]> {
  try {
    const { data, error } = await query({
      query: GetLocationsDocument,
      variables: {},
    });

    if (error) {
      console.error("GraphQL error:", error);
      throw error;
    }

    return data?.locations?.data || [];
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}
