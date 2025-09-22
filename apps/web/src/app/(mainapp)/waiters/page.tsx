import WaitersRoomsTabs from "./waiters-rooms-tabs";
import { createOrderForTableAction } from "./actions";

export default function WaitersPage() {
  return (
    <div className="w-full py-4 px-2">
      <WaitersRoomsTabs createOrderForTable={createOrderForTableAction} />
    </div>
  );
}
