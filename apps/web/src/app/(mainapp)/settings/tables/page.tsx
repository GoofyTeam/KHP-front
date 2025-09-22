import RoomsSettingsForm from "@/components/rooms/rooms-settings-form";
import { Separator } from "@workspace/ui/components/separator";
import { Building } from "lucide-react";

function TableSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Building className="h-7 w-7 text-khp-primary" />
              Table Settings
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Configure your restaurant&apos;s tables
            </p>
          </div>
        </div>
      </div>
      <Separator />
      <RoomsSettingsForm />
    </div>
  );
}

export default TableSettingsPage;
