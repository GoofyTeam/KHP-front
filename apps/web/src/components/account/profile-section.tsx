"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApolloClient } from "@apollo/client";
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
import { CheckCircleIcon, Loader2Icon, User } from "lucide-react";
import { updateUserInfoAction } from "@/app/(mainapp)/settings/account/actions";
import { GetMeDocument, type GetMeQuery } from "@/graphql/generated/graphql";

// Schéma de validation Zod
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must not be longer than 50 characters.",
    }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSectionProps {
  user: GetMeQuery["me"];
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const apolloClient = useApolloClient();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

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
            const updatedUser = res.data.user as GetMeQuery["me"];

            const nameUpdated =
              !changedFields.name || updatedUser.name === changedFields.name;
            const emailUpdated =
              !changedFields.email || updatedUser.email === changedFields.email;
            const timestampChanged = true;

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
            profileForm.reset({
              name: updatedUser.name || "",
              email: updatedUser.email || "",
            });
          } else {
            profileForm.reset({
              name: user?.name || "",
              email: user?.email || "",
            });
          }

          setSaved(true);
          setTimeout(() => setSaved(false), 3000);

          // Invalider le cache Apollo pour mettre à jour la sidebar
          apolloClient.refetchQueries({
            include: [GetMeDocument],
          });
        }
      } catch {
        setSaveError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
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

      <Form {...profileForm}>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="p-6 space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      disabled={isLoading || isPending}
                      className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-khp-error text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      disabled={isLoading || isPending}
                      className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-md focus:border-khp-primary focus:bg-khp-primary/5 transition-all duration-200 px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-khp-error text-sm" />
                </FormItem>
              )}
            />
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
      </Form>
    </div>
  );
}
