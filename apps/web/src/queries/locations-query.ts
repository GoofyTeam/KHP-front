import { query } from "@/lib/ApolloClient";
import {
  GetLocationsDocument,
  type GetLocationsQuery,
} from "@/graphql/generated/graphql";

/**
 * Fetch all available locations
 */
export type LocationRow = GetLocationsQuery["locations"]["data"][number];

export async function fetchLocations(): Promise<LocationRow[]> {
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
