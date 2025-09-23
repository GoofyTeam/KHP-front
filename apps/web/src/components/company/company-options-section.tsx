"use client";

import React, { useTransition, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui/components/button";
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
import { GetCompanyOptionsDocument } from "@workspace/graphql";

const companyOptionsSchema = z.object({
  open_food_facts_language: z.enum(["fr", "en"]),
});

type CompanyOptionsFormData = z.infer<typeof companyOptionsSchema>;

export function CompanyOptionsSection() {
  const apolloClient = useApolloClient();
  const { data, loading } = useQuery(GetCompanyOptionsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm<CompanyOptionsFormData>({
    resolver: zodResolver(companyOptionsSchema),
    defaultValues: {
      open_food_facts_language: "fr",
    },
  });

  useEffect(() => {
    if (data?.me?.company) {
      const company = data.me.company;

      form.reset({
        open_food_facts_language:
          company.open_food_facts_language === "en" ||
          company.open_food_facts_language === "fr"
            ? company.open_food_facts_language
            : "fr",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: CompanyOptionsFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCompanyOptionsAction(values);

        if (result.success) {
          toast.success("Options updated successfully");
          await apolloClient.refetchQueries({
            include: [GetCompanyOptionsDocument],
            updateCache(cache) {
              cache.evict({ fieldName: "me" });
            },
          });
        } else {
          toast.error(result.error || "An error occurred");
        }
      } catch {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <div className="bg-khp-surface rounded-2xl shadow-lg border border-khp-primary/20 overflow-hidden">
      <div className="bg-gradient-to-r from-khp-primary/5 to-khp-primary/10 px-6 py-5 border-b border-khp-primary/20">
        <h2 className="text-xl font-semibold text-khp-primary">
          Company Options
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Configure your company&apos;s display and menu exposure preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <FormField
            control={form.control}
            name="open_food_facts_language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Open Food Facts Language</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Language used to query Open Food Facts
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 border-t border-khp-primary/10">
            <Button
              type="submit"
              disabled={isPending || form.formState.isSubmitting || loading}
              className="w-full bg-khp-primary hover:bg-khp-primary/90 text-white"
            >
              {isPending || form.formState.isSubmitting
                ? "Saving..."
                : loading
                  ? "Loading..."
                  : "Save Options"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

