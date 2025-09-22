import { Badge } from "@workspace/ui/components/badge";
import { MenuType, getMenuTypeLabel } from "@workspace/ui/lib/order";

function PreparationStatusBadge({ status }: { status: MenuType }) {
  return (
    <Badge
      className={`text-xs px-2 py-1 ${status === "PREP" ? "bg-orange-100 text-orange-800 border-orange-300" : "bg-green-100 text-green-800 border-green-300"}`}
    >
      {getMenuTypeLabel(status)}
    </Badge>
  );
}

export default PreparationStatusBadge;
