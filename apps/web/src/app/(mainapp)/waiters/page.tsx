import WaitersRoomsTabs from "./waiters-rooms-tabs";
import { GetRoomsDocument } from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";
import { createOrderForTableAction } from "./actions";

export default async function WaitersPage() {
  const { data, error } = await query({
    query: GetRoomsDocument,
    fetchPolicy: "network-only",
  });

  const rooms = data?.rooms?.data ?? [];

  // TODO: handle error display gracefully
  if (error) {
    // TODO: surface error state to the user
  }

  const serializedRooms = JSON.parse(JSON.stringify(rooms));

  return (
    <div className="w-full py-4 px-2">
      <WaitersRoomsTabs
        rooms={serializedRooms}
        createOrderForTable={createOrderForTableAction}
      />
    </div>
  );
}
