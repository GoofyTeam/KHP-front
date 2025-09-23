import { CompanyOptionsSection } from "@/components/company/company-options-section";
import { BusinessHoursSection } from "@/components/company/business-hours-section";
import { CompanyLogoSection } from "@/components/company/company-logo-section";
import { ContactInformationSection } from "@/components/company/contact-information-section";

export default function CompanySettings() {
  return (
    <div className="space-y-8 w-full">
      <CompanyOptionsSection />
      <BusinessHoursSection />
      <CompanyLogoSection />
      <ContactInformationSection />
    </div>
  );
}
