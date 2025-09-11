"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ImageAdd } from "@workspace/ui/components/image-placeholder";
import { Input } from "@workspace/ui/components/input";
import { useState } from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { IngredientPickerField } from "@/components/meals/IngredientPickerField";
import { Button } from "@workspace/ui/components/button";

/* import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select"; */

// ✅ Aligne Zod avec ton union littérale
const menuItemsSchema = z.object({
  entity_id: z.string().nonempty("Entity ID is required"),
  entity_type: z.enum(["ingredient", "preparation"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().nonempty("Unit is required"),
  location_id: z.string().nonempty("Location ID is required"),
});

const createMenuSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number"),
    is_a_la_carte: z.boolean(),
    items: z.array(menuItemsSchema),
  })
  .superRefine((data, ctx) => {
    if (data.items && data.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one item is required",
      });
    }
  });

type CreateMenuFormValues = z.infer<typeof createMenuSchema>;

export default function CreateMenusPage() {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const form = useForm<CreateMenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      is_a_la_carte: false,
      items: [],
    },
  });

  function onMenusCreateSubmit(values: CreateMenuFormValues) {
    console.log(values);
  }

  return (
    <div className="flex flex-col h-full justify-center items-center w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onMenusCreateSubmit)}
          className="flex flex-col md:flex-row justify-around gap-8 w-full"
        >
          <div className="flex flex-col justify-center items-center gap-y-4 w-full md:w-5/12">
            <ImageAdd />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Menu name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} variant="khp-default" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Menu description</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="border-khp-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 w-full gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Price <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      {/* Astuce: si tu veux un vrai number dans RHF */}
                      <Input
                        {...field}
                        variant="khp-default"
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_a_la_carte"
                render={({ field }) => (
                  <FormItem className="flex flex-col lg:flex-row w-full items-center border rounded-sm border-khp-primary justify-between px-2 py-4">
                    <FormLabel>Available &quot;à la carte&quot;</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button variant="khp-default" type="submit" className="w-full mt-4">
              Create Menu
            </Button>
          </div>

          {/* 👉 Le container devient plug&play */}
          <IngredientPickerField form={form} />
        </form>
      </Form>
    </div>
  );
}
