"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { CheckCircleIcon, Loader2Icon, Eye, EyeOff, Lock } from "lucide-react";
import { updatePasswordAction } from "@/app/(mainapp)/settings/account/actions";

// Schéma de validation Zod
const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, {
      message: "Current password is required.",
    }),
    new_password: z.string().min(8, {
      message: "New password must be at least 8 characters.",
    }),
    new_password_confirmation: z.string().min(1, {
      message: "Password confirmation is required.",
    }),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Passwords don't match.",
    path: ["new_password_confirmation"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordSection() {
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const onPasswordSubmit = (values: PasswordFormValues) => {
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

      <Form {...passwordForm}>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="p-6 space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Current password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password"
                        disabled={pwdLoading || isPending}
                        className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((s) => !s)}
                        className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-khp-primary/20"
                        aria-label={
                          showCurrent ? "Hide password" : "Show password"
                        }
                      >
                        {showCurrent ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-khp-error text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    New password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        disabled={pwdLoading || isPending}
                        className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                        {...field}
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
                  </FormControl>
                  <FormMessage className="text-khp-error text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="new_password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Confirm password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        disabled={pwdLoading || isPending}
                        className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 pr-12 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        className="absolute inset-y-0 right-3 flex items-center text-khp-text-secondary hover:text-khp-text-primary transition-colors duration-200 p-1 rounded-lg hover:bg-khp-primary/10"
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-khp-error text-sm" />
                </FormItem>
              )}
            />
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
      </Form>
    </div>
  );
}
