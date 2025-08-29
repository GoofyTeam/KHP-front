"use client";

import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CheckCircleIcon, Loader2Icon, Eye, EyeOff } from "lucide-react";
import { httpClient } from "@/lib/httpClient";
import { useUserStore } from "@/stores/user-store";

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { user, fetchUser, setUser } = useUserStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    companyId: "",
    lastUpdated: "",
  });

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name ?? "",
        email: user.email ?? "",
        companyId: user.company_id ? String(user.company_id) : "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    try {
      await httpClient.put("/api/user/update/info", {
        name: formData.name,
        email: formData.email,
      });

      if (user) {
        setUser({ ...user, name: formData.name, email: formData.email });
      }
      await fetchUser(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating user data:", error);
      setSaveError(
        error instanceof Error ? error.message : "Unable to update profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPwdData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordSubmit = async () => {
    setPwdError(null);
    if (!pwdData.currentPassword || !pwdData.newPassword) {
      setPwdError("Please fill all password fields.");
      return;
    }
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }

    setPwdLoading(true);
    setPwdSaved(false);
    try {
      await httpClient.put("/api/user/update/password", {
        current_password: pwdData.currentPassword,
        new_password: pwdData.newPassword,
        new_password_confirmation: pwdData.confirmPassword,
      });
      setPwdSaved(true);
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPwdError("Unable to update password. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className=" flex gap-8">
      <div className="bg-khp-surface rounded-lg shadow-sm border  p-6 w-1/2">
        <h3 className="text-base font-medium text-khp-text-primary mb-4">
          Profile
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-khp-text-primary mb-2"
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isLoading}
              className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-khp-text-primary mb-2"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isLoading}
              className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
              placeholder="Enter your email address"
            />
          </div>

          <div className="pt-2">
            {saved ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-khp-background-secondary border border-khp-primary rounded-lg">
                <CheckCircleIcon className="h-4 w-4 text-khp-primary" />
                <span className="text-khp-text-primary text-sm font-medium">
                  Changes saved successfully
                </span>
              </div>
            ) : saveError ? (
              <div className="p-3 text-center border border-red-500/50 bg-red-500/10 text-red-600 rounded-md text-sm">
                {saveError}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                variant="khp-default"
                size="xl"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2Icon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving changes...
                  </div>
                ) : (
                  "Save changes"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-khp-surface rounded-lg shadow-sm border  p-6 w-1/2">
        <h3 className="text-base font-medium text-khp-text-primary mb-4">
          Password
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePasswordSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <Label
              htmlFor="current_password"
              className="block text-sm font-medium text-khp-text-primary mb-2"
            >
              Current password
            </Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showCurrent ? "text" : "password"}
                value={pwdData.currentPassword}
                onChange={(e) =>
                  handlePasswordChange("currentPassword", e.target.value)
                }
                disabled={pwdLoading}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="new_password"
              className="block text-sm font-medium text-khp-text-primary mb-2"
            >
              New password
            </Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNew ? "text" : "password"}
                value={pwdData.newPassword}
                onChange={(e) =>
                  handlePasswordChange("newPassword", e.target.value)
                }
                disabled={pwdLoading}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-khp-text-primary mb-2"
            >
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirm ? "text" : "password"}
                value={pwdData.confirmPassword}
                onChange={(e) =>
                  handlePasswordChange("confirmPassword", e.target.value)
                }
                disabled={pwdLoading}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            {pwdSaved ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-khp-background-secondary border border-khp-primary rounded-lg">
                <CheckCircleIcon className="h-4 w-4 text-khp-primary" />
                <span className="text-khp-text-primary text-sm font-medium">
                  Password updated successfully
                </span>
              </div>
            ) : pwdError ? (
              <div className="p-3 text-center border border-red-500/50 bg-red-500/10 text-red-600 rounded-md text-sm">
                {pwdError}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={pwdLoading}
                variant="khp-default"
                size="xl"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwdLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2Icon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Updating password...
                  </div>
                ) : (
                  "Update password"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
