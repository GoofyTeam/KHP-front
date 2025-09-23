"use client";

import { useEffect, useState, useTransition } from "react";
import { useApolloClient } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { PrefixInput } from "@workspace/ui/components/prefix-input";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "sonner";
import {
  GetPublicMenusSettingsDocument,
  GetPublicMenusSettingsQuery,
} from "@workspace/graphql";
import {
  updatePublicMenusSettingsAction,
  type UpdatePublicMenusSettingsInput,
} from "@/app/(mainapp)/settings/public-menus/actions";

const buildPublicMenusBaseUrl = (origin?: string | null) => {
  const trimmedOrigin = origin?.trim();

  if (!trimmedOrigin) {
    return "https://dash.goofykhp.fr/public-menus/";
  }

  const sanitizedOrigin = trimmedOrigin.replace(/\/+$/, "");

  return `${sanitizedOrigin}/public-menus/`;
};

const DEFAULT_PUBLIC_MENUS_BASE_URL = buildPublicMenusBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "production" ? "https://dash.goofykhp.fr" : null)
);

const publicMenusSchema = z.object({
  public_menu_card_url: z
    .string()
    .trim()
    .min(10, "Public menu URL is required")
    .max(255),
  show_out_of_stock_menus_on_card: z.boolean(),
  show_menu_images: z.boolean(),
});

function PublicMenusSettingsSection({
  companySettings,
}: {
  companySettings: GetPublicMenusSettingsQuery["me"]["company"];
}) {
  const apolloClient = useApolloClient();
  const publicMenuSettings = companySettings?.public_menu_settings;
  const [isPending, startTransition] = useTransition();
  const [publicMenusBaseUrl, setPublicMenusBaseUrl] = useState(
    DEFAULT_PUBLIC_MENUS_BASE_URL
  );

  const form = useForm<z.infer<typeof publicMenusSchema>>({
    resolver: zodResolver(publicMenusSchema),
    defaultValues: {
      public_menu_card_url: publicMenuSettings?.public_menu_card_url ?? "",
      show_out_of_stock_menus_on_card:
        publicMenuSettings?.show_out_of_stock_menus_on_card ?? false,
      show_menu_images: publicMenuSettings?.show_menu_images ?? true,
    },
  });
  const { isLoading, isSubmitting } = form.formState;
  const isBusy = isLoading || isSubmitting || isPending;

  useEffect(() => {
    setPublicMenusBaseUrl(buildPublicMenusBaseUrl(window.location.origin));

    if (!publicMenuSettings) return;

    form.reset({
      public_menu_card_url: publicMenuSettings.public_menu_card_url ?? "",
      show_out_of_stock_menus_on_card:
        publicMenuSettings.show_out_of_stock_menus_on_card ?? false,
      show_menu_images: publicMenuSettings.show_menu_images ?? true,
    });
  }, [form, publicMenuSettings]);

  function onSubmit(values: z.infer<typeof publicMenusSchema>) {
    startTransition(async () => {
      try {
        form.clearErrors();

        const payload: UpdatePublicMenusSettingsInput = {
          public_menu_card_url: values.public_menu_card_url,
          show_out_of_stock_menus_on_card:
            values.show_out_of_stock_menus_on_card,
          show_menu_images: values.show_menu_images,
        };

        const result = await updatePublicMenusSettingsAction(payload);

        if (result.success) {
          const responseData = result.data?.data;

          if (responseData) {
            form.reset({
              public_menu_card_url:
                responseData.public_menu_card_url ??
                values.public_menu_card_url,
              show_out_of_stock_menus_on_card:
                responseData.show_out_of_stock_menus_on_card ??
                values.show_out_of_stock_menus_on_card,
              show_menu_images:
                responseData.show_menu_images ?? values.show_menu_images,
            });
          }

          toast.success(
            result.data?.message || "Public menu settings updated successfully."
          );

          try {
            await apolloClient.refetchQueries({
              include: [GetPublicMenusSettingsDocument],
              updateCache(cache) {
                cache.evict({ fieldName: "me" });
              },
            });
          } catch (refetchError) {
            console.error(
              "Failed to refetch public menu settings",
              refetchError
            );
          }
        } else {
          const errorMessage =
            result.error || "An error occurred while updating the settings.";

          const lowerError = errorMessage.toLowerCase();

          if (lowerError.includes("slug") || lowerError.includes("url")) {
            form.setError("public_menu_card_url", {
              type: "server",
              message: errorMessage,
            });
          }

          toast.error(errorMessage);
        }
      } catch (error) {
        console.error("Failed to update public menu settings", error);
        toast.error(
          "An unexpected error occurred while updating the settings."
        );
      }
    });
  }

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Public Menus Options
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Set up your public menus preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="public_menu_card_url"
            render={({ field }) => (
              <FormItem className="space-y-0.5 border p-3 shadow-sm border-khp-primary/50 rounded-md">
                <div className="flex flex-col gap-1">
                  <FormLabel className="text-khp-text">
                    Your public menu card URL
                  </FormLabel>
                  <FormDescription>
                    With this URL, your customers will be able to access your
                    menu card.
                  </FormDescription>
                </div>
                <FormControl>
                  <PrefixInput
                    prefix={publicMenusBaseUrl}
                    value={field.value ?? ""}
                    onChange={(value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    disabled={isBusy}
                    showCopyButton
                    className="w-full bg-khp-surface border-khp-primary/25"
                    prefixClassName="bg-khp-primary/15 text-khp-text/70 border-khp-primary/25"
                    copyButtonClassName="border-khp-primary/25 text-khp-text/70 hover:bg-khp-primary/5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="show_menu_images"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-sm border-khp-primary/50">
                  <div className="space-y-0.5">
                    <FormLabel>Show menu images</FormLabel>
                    <FormDescription>
                      Display images of your menu items on the public menu card.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      className="data-[state=checked]:bg-khp-primary"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isBusy}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="show_out_of_stock_menus_on_card"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-md border p-3 shadow-sm border-khp-primary/50">
                  <div className="space-y-0.5">
                    <FormLabel>Show out-of-stock menus</FormLabel>
                    <FormDescription>
                      Allow customers to see out-of-stock menu items on the
                      public menu card.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      className="data-[state=checked]:bg-khp-primary"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isBusy}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 border-t border-khp-primary/10">
            <Button
              type="submit"
              disabled={isBusy || !form.formState.isDirty}
              className="w-full bg-khp-primary hover:bg-khp-primary/90 text-white"
            >
              {isLoading
                ? "Loading..."
                : isPending || isSubmitting
                  ? "Saving..."
                  : "Save public menu settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default PublicMenusSettingsSection;
