import { CompanySettingsSection } from "@/components/company/company-settings-section";
import PublicMenusSettingsSection from "@/components/company/public-menus-settings-section";
import { GetPublicMenusSettingsDocument } from "@/graphql/generated/graphql";
import { query } from "@/lib/ApolloClient";

export default async function Company() {
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
      <CompanySettingsSection />
      <PublicMenusSettingsSection companySettings={companySettings} />
    </div>
  );
}
