import PublicMenusSettingsSection from "@/components/settings/public-menus/public-menus-settings-section";
import SortMenuTypesSection from "@/components/settings/public-menus/sort-menus-types-section";
import { GetPublicMenusSettingsDocument } from "@workspace/graphql";
import { query } from "@/lib/ApolloClient";

export default async function PublicMenusSettingsPage() {
  const { data, error } = await query({
    query: GetPublicMenusSettingsDocument,
  });

  const companySettings = data?.me?.company;

  if (error) {
    throw new Error(`Error fetching public menu settings: ${error.message}`);
  }

  if (!companySettings) {
    throw new Error("Public menu settings not found");
  }

  return (
    <div className="space-y-8 w-full">
      <PublicMenusSettingsSection companySettings={companySettings} />
      <SortMenuTypesSection />
    </div>
  );
}
