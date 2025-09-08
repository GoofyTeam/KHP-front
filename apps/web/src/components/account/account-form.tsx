"use client";

import { ProfileSection } from "./profile-section";
import { PasswordSection } from "./password-section";
import { LogoutSection } from "./logout-section";
import type { GetMeQuery } from "@/graphql/generated/graphql";

interface AccountFormProps {
  user: GetMeQuery["me"];
}

export function AccountForm({ user }: AccountFormProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8 w-full">
      <ProfileSection user={user} />
      <PasswordSection />
      <LogoutSection />
    </div>
  );
}
