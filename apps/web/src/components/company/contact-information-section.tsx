"use client";

import React, { useTransition, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { updateCompanyContactAction } from "@/app/(mainapp)/settings/company/actions";
import { GetCompanyOptionsDocument } from "@workspace/graphql";

const contactSchema = z.object({
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  address_line: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactInformationSection() {
  const apolloClient = useApolloClient();
  const { data } = useQuery(GetCompanyOptionsDocument, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: true,
  });
  const [isPending, startTransition] = useTransition();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address_line: "",
      postal_code: "",
      city: "",
      country: "",
    },
  });

  useEffect(() => {
    if (data?.me?.company) {
      const company = data.me.company;
      form.reset({
        contact_name: company.contact_name || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        address_line: company.address_line || "",
        postal_code: company.postal_code || "",
        city: company.city || "",
        country: company.country || "",
      });
    }
  }, [data, form]);

  const onSubmit = async (values: ContactFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCompanyContactAction(values);

        if (result.success) {
          toast.success("Contact information updated successfully");
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
          Contact Information
        </h2>
        <p className="text-sm text-khp-text/70 mt-1">
          Contact information displayed on the public menu card
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@restaurant.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+33 6 00 00 00 00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="12 rue des Saveurs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder="75001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Paris" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 border-t border-khp-primary/10">
            <Button
              type="submit"
              disabled={isPending || form.formState.isSubmitting}
              className="w-full bg-khp-primary hover:bg-khp-primary/90 text-white"
            >
              {isPending || form.formState.isSubmitting
                ? "Saving..."
                : "Save Contact Information"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

