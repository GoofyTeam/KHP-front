"use client";

import React, { useTransition, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
import { Switch } from "@workspace/ui/components/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { toast } from "sonner";
import { updateCompanyOptionsAction } from "@/app/(mainapp)/settings/company/actions";
import { GetMeDocument } from "@/graphql/generated/graphql";

const companyOptionsSchema = z.object({
  auto_complete_menu_orders: z.boolean(),
  open_food_facts_language: z.enum(["fr", "en"]),
});

type CompanyOptionsFormData = z.infer<typeof companyOptionsSchema>;

export function CompanySettingsSection() {
  const { data, loading, error, refetch } = useQuery(GetMeDocument);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanyOptionsFormData>({
    resolver: zodResolver(companyOptionsSchema),
    defaultValues: {
      auto_complete_menu_orders: false,
      open_food_facts_language: "fr",
    },
  });

  useEffect(() => {
    if (data?.me?.company) {
      form.reset({
        auto_complete_menu_orders: false,
        open_food_facts_language: "fr",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: CompanyOptionsFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCompanyOptionsAction(values);

        if (result.success) {
          toast.success("Company options updated successfully.");
          await refetch();
        } else {
          toast.error(result.error || "An error occurred while updating.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  if (loading) return null;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden w-full">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Options de l'entreprise
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Configurez les paramètres généraux de votre entreprise
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="auto_complete_menu_orders"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-khp-primary/10 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base text-khp-text">
                    Complétion automatique des commandes
                  </FormLabel>
                  <FormDescription className="text-khp-text/60">
                    Active la complétion automatique des commandes de menu
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending || form.formState.isSubmitting}
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="open_food_facts_language"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-khp-text">
                  Langue Open Food Facts
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending || form.formState.isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-khp-text/60">
                  Langue utilisée pour les données nutritionnelles Open Food
                  Facts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t border-khp-primary/10">
            <Button
              type="submit"
              disabled={isPending || form.formState.isSubmitting}
              className="w-full bg-khp-primary hover:bg-khp-primary/90 text-white"
            >
              {isPending || form.formState.isSubmitting
                ? "Saving..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
