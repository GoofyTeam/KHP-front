"use client";

import { useState, useTransition, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient, gql } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  CheckCircleIcon,
  Loader2Icon,
  Eye,
  EyeOff,
  LogOut,
  User,
  Lock,
} from "lucide-react";
import {
  logoutAction,
  updatePasswordAction,
  updateUserInfoAction,
} from "@/app/(mainapp)/settings/account/actions";

const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      company {
        id
        name
      }
    }
  }
`;

type User = {
  id?: number;
  name?: string;
  email?: string;
  company_id?: number;
  updated_at?: string;
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
  const formId = useId();
  const apolloClient = useApolloClient();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [logoutLoading, setLogoutLoading] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true); // Par défaut, rester connecté

  const [isPending, startTransition] = useTransition();

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

  // Pré-remplir les champs quand les données utilisateur arrivent
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user, profileForm]);

  // Charger la préférence "Keep signed in" depuis localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem("keepSignedIn");
    if (savedPreference !== null) {
      setKeepSignedIn(savedPreference === "true");
    }
  }, []);

  // Sauvegarder la préférence "Keep signed in" dans localStorage
  useEffect(() => {
    localStorage.setItem("keepSignedIn", keepSignedIn.toString());
  }, [keepSignedIn]);

  const onProfileSubmit = (values: ProfileFormValues) => {
    setIsLoading(true);
    setSaved(false);
    setSaveError(null);

    startTransition(async () => {
      try {
        const changedFields: { name?: string; email?: string } = {};

        if (values.name !== user?.name) {
          changedFields.name = values.name;
        }

        if (values.email !== user?.email) {
          changedFields.email = values.email;
        }
        if (Object.keys(changedFields).length === 0) {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
          return;
        }

        const res = await updateUserInfoAction(changedFields);

        if (!res.success) {
          setSaveError(res.error || "Unable to update profile.");
        } else {
          if (
            res.data &&
            typeof res.data === "object" &&
            "user" in res.data &&
            res.data.user
          ) {
            const updatedUser = res.data.user as User;

            const nameUpdated =
              !changedFields.name || updatedUser.name === changedFields.name;
            const emailUpdated =
              !changedFields.email || updatedUser.email === changedFields.email;
            const timestampChanged =
              updatedUser.updated_at !== user?.updated_at;

            if (!nameUpdated || !emailUpdated || !timestampChanged) {
              const errors = [];
              if (!nameUpdated)
                errors.push(
                  `Name: expected "${changedFields.name}", got "${updatedUser.name}"`
                );
              if (!emailUpdated)
                errors.push(
                  `Email: expected "${changedFields.email}", got "${updatedUser.email}"`
                );
              if (!timestampChanged)
                errors.push("No timestamp change detected");

              setSaveError(`Update failed: ${errors.join(", ")}`);
              return;
            }
            // Utilisateur mis à jour avec succès
            profileForm.reset({
              name: updatedUser.name || "",
              email: updatedUser.email || "",
            });
          } else {
            // Si pas de données utilisateur dans la réponse, on garde les valeurs actuelles
            profileForm.reset({
              name: user?.name || "",
              email: user?.email || "",
            });
          }

          setSaved(true);
          setTimeout(() => setSaved(false), 3000);

          // Refetch user data to update nav-user.tsx
          apolloClient.refetchQueries({
            include: [GET_ME],
          });
        }
      } catch {
        setSaveError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
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

  const onLogout = () => {
    setLogoutLoading(true);

    startTransition(async () => {
      try {
        // Seulement forcer la déconnexion si l'utilisateur ne veut pas rester connecté
        const res = await logoutAction(!keepSignedIn);
        if (res.success) {
          window.location.href = "/login";
        } else {
          console.error("Logout failed:", res.error);
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setLogoutLoading(false);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 w-full">
      <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
        <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
          <h3 className="text-lg font-semibold text-khp-text-primary flex items-center gap-3">
            <div className="w-8 h-8 bg-khp-primary/20 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-khp-primary" />
            </div>
            Profile Information
          </h3>
          <p className="text-sm text-khp-text-secondary mt-1">
            Update your account details and personal information
          </p>
        </div>

        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="p-6 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <Label
                htmlFor={`${formId}-name`}
                className="block text-sm font-semibold text-khp-text-primary mb-3"
              >
                Full name
              </Label>
              <Input
                id={`${formId}-name`}
                type="text"
                disabled={isLoading || isPending}
                className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                placeholder="Enter your full name"
                {...profileForm.register("name")}
              />
            </div>

            <div>
              <Label
                htmlFor={`${formId}-email`}
                className="block text-sm font-semibold text-khp-text-primary mb-3"
              >
                Email address
              </Label>
              <Input
                id={`${formId}-email`}
                type="email"
                disabled={isLoading || isPending}
                className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                placeholder="Enter your email address"
                {...profileForm.register("email")}
              />
            </div>
          </div>

          <div className="pt-4">
            {saved ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-700 text-sm font-semibold">
                  Changes saved successfully
                </span>
              </div>
            ) : saveError ? (
              <div className="p-4 text-center border-2 border-red-200 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                {saveError}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || isPending}
                variant="khp-default"
                size="xl-full"
              >
                {isLoading || isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="animate-spin h-4 w-4" />
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

      <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-amber-200/50">
          <h3 className="text-lg font-semibold text-khp-text-primary flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-200/50 rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            Security Settings
          </h3>
          <p className="text-sm text-khp-text-secondary mt-1">
            Change your password to keep your account secure
          </p>
        </div>

        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="p-6 space-y-6"
        >
          <div className="space-y-4">
            <div>
              <Label
                htmlFor={`${formId}-current-password`}
                className="block text-sm font-semibold text-khp-text-primary mb-3"
              >
                Current password
              </Label>
              <div className="relative">
                <Input
                  id={`${formId}-current-password`}
                  type={showCurrent ? "text" : "password"}
                  disabled={pwdLoading || isPending}
                  className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                  placeholder="Enter current password"
                  {...passwordForm.register("current_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-khp-primary/20"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label
                htmlFor={`${formId}-new-password`}
                className="block text-sm font-semibold text-khp-text-primary mb-3"
              >
                New password
              </Label>
              <div className="relative">
                <Input
                  id={`${formId}-new-password`}
                  type={showNew ? "text" : "password"}
                  disabled={pwdLoading || isPending}
                  className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                  placeholder="Enter new password"
                  {...passwordForm.register("new_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-khp-primary/10"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label
                htmlFor={`${formId}-confirm-password`}
                className="block text-sm font-semibold text-khp-text-primary mb-3"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id={`${formId}-confirm-password`}
                  type={showConfirm ? "text" : "password"}
                  disabled={pwdLoading || isPending}
                  className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                  placeholder="Confirm new password"
                  {...passwordForm.register("new_password_confirmation")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-khp-primary/10"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {pwdSaved ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-700 text-sm font-semibold">
                  Password updated successfully
                </span>
              </div>
            ) : pwdError ? (
              <div className="p-4 text-center border-2 border-red-200 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                {pwdError}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={pwdLoading || isPending}
                variant="khp-default"
                size="xl-full"
              >
                {pwdLoading || isPending ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="animate-spin h-4 w-4" />
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

      <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/10 overflow-hidden">
        <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/10">
          <h3 className="text-lg font-semibold text-khp-text-primary flex items-center gap-3">
            <div className="w-8 h-8 bg-khp-error/20 rounded-full flex items-center justify-center">
              <LogOut className="w-4 h-4 text-khp-error" />
            </div>
            Logout
          </h3>
          <p className="text-sm text-khp-text-secondary mt-1">
            Disconnect from your account and end your session
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="keep-signed-in"
              checked={keepSignedIn}
              onCheckedChange={(checked) => setKeepSignedIn(checked as boolean)}
            />
            <Label
              htmlFor="keep-signed-in"
              className="text-sm text-khp-text-secondary"
            >
              Keep me signed in (stay logged in after closing browser)
            </Label>
          </div>

          <Button
            onClick={onLogout}
            disabled={logoutLoading || isPending}
            variant="khp-destructive"
            size="xl-full"
          >
            {logoutLoading || isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2Icon className="animate-spin h-4 w-4" />
                Logging out...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
