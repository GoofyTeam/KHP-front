"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useApolloClient } from "@apollo/client";
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
import { CheckCircle2, Loader2 } from "lucide-react";

import {
  createMenuTypeAction,
  type CreateMenuTypeInput,
} from "@/app/(mainapp)/settings/menu-types/actions";
import {
  GetMenuTypesDocument,
  type MenuType,
} from "@workspace/graphql";

const menuTypeSchema = z.object({
  name: z
    .string()
    .min(2, "Menu type name must be at least 2 characters")
    .max(50, "Menu type name must be less than 50 characters")
    .trim(),
  public_index: z.coerce
    .number({ invalid_type_error: "Public index must be a number" })
    .int("Public index must be an integer")
    .min(0, "Public index cannot be negative"),
});

type MenuTypeFormValues = z.infer<typeof menuTypeSchema>;

interface MenuTypeAddFormProps {
  onMenuTypeAdded?: (menuType?: MenuType) => void;
}

export function MenuTypeAddForm({ onMenuTypeAdded }: MenuTypeAddFormProps) {
  const [saved, setSaved] = useState(false);
  const apolloClient = useApolloClient();

  const form = useForm<MenuTypeFormValues>({
    resolver: zodResolver(menuTypeSchema),
    defaultValues: {
      name: "",
      public_index: 0,
    },
    mode: "onChange",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSaved(false);
      form.clearErrors();

      const payload: CreateMenuTypeInput = {
        name: values.name,
        public_index: values.public_index,
      };

      const result = await createMenuTypeAction(payload);

      if (result.success) {
        setSaved(true);
        form.reset({ name: "", public_index: 0 });

        await apolloClient.refetchQueries({
          include: [GetMenuTypesDocument],
        });

        onMenuTypeAdded?.(result.data);
        setTimeout(() => setSaved(false), 3000);
      } else {
        form.setError("root", {
          message: result.error || "Unable to create menu type",
        });
      }
    } catch (error) {
      console.error("Error creating menu type:", error);
      form.setError("root", {
        message: "Unable to create menu type. Please try again.",
      });
    }
  });

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-khp-text-primary">
                  Menu Type Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter menu type name"
                    disabled={form.formState.isSubmitting}
                    className="h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="public_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-khp-text-primary">
                  Public Index
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    disabled={form.formState.isSubmitting}
                    className="h-12 text-base"
                    {...field}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            {saved ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Menu type created successfully
                </span>
              </div>
            ) : form.formState.errors.root ? (
              <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                {form.formState.errors.root.message}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isValid
                }
                variant="khp-default"
                className="w-full h-12 text-base font-semibold"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating menu type...
                  </>
                ) : (
                  "Create Menu Type"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
