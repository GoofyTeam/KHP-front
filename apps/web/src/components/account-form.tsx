"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { CheckCircleIcon, Loader2Icon, Eye, EyeOff } from "lucide-react";
import {
  updatePasswordAction,
  updateUserInfoAction,
} from "@/app/(mainapp)/settings/account/actions";
import { useUserStore } from "@/stores/user-store";

type User = {
  id?: number;
  name?: string;
  email?: string;
  company_id?: number;
};

type ProfileFormValues = {
  name: string;
  email: string;
};

type PasswordFormValues = {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
};

export function AccountForm({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const { fetchUser } = useUserStore();

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    startTransition(async () => {
      const res = await updateUserInfoAction(values);
      if (!res.success) {
        setSaveError(res.error || "Unable to update profile.");
      } else {
        await fetchUser(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
      setIsLoading(false);
    });
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    if (!values.current_password || !values.new_password) {
      setPwdError("Please fill all password fields.");
      return;
    }
    if (values.new_password !== values.new_password_confirmation) {
      setPwdError("Passwords do not match.");
      return;
    }

    setPwdLoading(true);
    setPwdSaved(false);
    setPwdError(null);

    startTransition(async () => {
      const res = await updatePasswordAction(values);
      if (!res.success) {
        setPwdError(
          res.error || "Unable to update password. Please try again."
        );
      } else {
        setPwdSaved(true);
        passwordForm.reset();
        setTimeout(() => setPwdSaved(false), 3000);
      }
      setPwdLoading(false);
    });
  };

  return (
    <div className=" flex gap-8">
      <div className="bg-khp-surface rounded-lg shadow-sm border  p-6 w-1/2">
        <h3 className="text-base font-medium text-khp-text-primary mb-4">
          Profile
        </h3>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-6"
        >
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
              disabled={isLoading || isPending}
              className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
              placeholder="Enter your full name"
              {...profileForm.register("name")}
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
              disabled={isLoading || isPending}
              className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
              placeholder="Enter your email address"
              {...profileForm.register("email")}
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
                disabled={isLoading || isPending}
                variant="khp-default"
                size="xl"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isPending ? (
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
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
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
                disabled={pwdLoading || isPending}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Enter current password"
                {...passwordForm.register("current_password")}
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
                disabled={pwdLoading || isPending}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Enter new password"
                {...passwordForm.register("new_password")}
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
                disabled={pwdLoading || isPending}
                className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all px-4 pr-10 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary"
                placeholder="Confirm new password"
                {...passwordForm.register("new_password_confirmation")}
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
                disabled={pwdLoading || isPending}
                variant="khp-default"
                size="xl"
                className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwdLoading || isPending ? (
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
