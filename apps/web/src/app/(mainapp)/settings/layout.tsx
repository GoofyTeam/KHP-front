import { SettingsSidebar } from "@/components/settings-sidebar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full p-4 gap-6">
      <div className="flex-shrink-0">
        <SettingsSidebar />
      </div>
      <main className="flex-1 min-w-0 h-full">
        <ScrollArea className=" max-h-[calc(100vh-100px)] h-full w-full">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}
