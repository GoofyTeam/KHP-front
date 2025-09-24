import { Badge } from "@workspace/ui/components/badge";
import { MenuType, getMenuTypeLabel } from "@workspace/ui/lib/order";
import { cn } from "@workspace/ui/lib/utils";

function PreparationStatusBadge({ status }: { status: MenuType }) {
  return (
    <Badge
      className={cn(
        `text-xs px-2 py-1 min-w-30 flex justify-center`,
        status === "PREP"
          ? "bg-orange-100 text-orange-800 border-orange-300"
          : "bg-green-100 text-green-800 border-green-300"
      )}
    >
      <p className="text-center">{getMenuTypeLabel(status)}</p>
    </Badge>
  );
}

export default PreparationStatusBadge;
