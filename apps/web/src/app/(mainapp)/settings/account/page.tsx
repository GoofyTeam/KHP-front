"use client";

import { ProfileSection } from "@/components/account/profile-section";
import { PasswordSection } from "@/components/account/password-section";
import { LogoutSection } from "@/components/account/logout-section";

export default function Account() {
  return (
    <div className="space-y-8 w-full">
      <ProfileSection />
      <PasswordSection />
      <LogoutSection />
    </div>
  );
}
