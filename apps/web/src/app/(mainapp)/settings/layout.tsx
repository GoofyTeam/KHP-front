import { SettingsSidebar } from "@/components/settings-sidebar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4 gap-6">
      <div className="flex-shrink-0 md:w-64">
        <SettingsSidebar />
      </div>
      <main className="flex-1 min-w-0 h-full">
        <div className="h-full w-full md:hidden">{children}</div>
        <ScrollArea className="hidden md:block max-h-[calc(100vh-50px)] h-full w-full">
          {children}
        </ScrollArea>
      </main>
    </div>
  );
}
