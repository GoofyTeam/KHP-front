import { SettingsSidebar } from "@/components/settings-sidebar";

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
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
