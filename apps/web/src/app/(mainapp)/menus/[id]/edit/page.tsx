"use client";

import { z } from "zod";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
import { Textarea } from "@workspace/ui/components/textarea";
import { Switch } from "@workspace/ui/components/switch";
import { IngredientPickerField } from "@/components/meals/IngredientPickerField";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, ChefHat, Package, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Tabs, TabsContent } from "@workspace/ui/components/tabs";

import { updateMenuAction } from "@/app/(mainapp)/menus/add/action";
import { useQuery, useApolloClient } from "@apollo/client";
import {
  GetMenuByIdDocument,
  GetMenuCategoriesDocument,
  GetMenuCategoriesQuery,
} from "@/graphql/generated/graphql";

const menuItemsSchema = z.object({
  entity_id: z.string().nonempty("Entity ID is required"),
  entity_image_url: z.string().optional(),
  entity_type: z.enum(["ingredient", "preparation"]),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().nonempty("Unit is required"),
  location_id: z.string().nonempty("Location ID is required"),
  // UI-only: fixed storage unit for display in location select
  storage_unit: z.string().optional(),
});

const imageFileSchema = z
  .instanceof(File, {
    message: "Menu image is required",
  })
  .refine((file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSizeInBytes = 1 * 1024 * 1024; // 1MB
    return validTypes.includes(file.type) && file.size <= maxSizeInBytes;
  }, "Image must be a JPEG or PNG file and less than 1MB");

const updateMenuSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    image: z
      .union([
        imageFileSchema,
        z.string().min(1, "Menu image is required"),
        z.undefined(),
      ])
      .optional(),
    description: z.string().optional(),
    price: z.number().min(1, "Price must be a positive number"),
    is_a_la_carte: z.boolean(),
    type: z.string().nonempty("Type is required"),
    category_ids: z
      .array(z.string())
      .min(1, "At least one category is required"),
    // Require at least one item so the array-level error is properly set
    items: z.array(menuItemsSchema).min(1, "At least one item is required"),
  })
  .superRefine((data, ctx) => {
    // Check for every item that quantity is a positive number and a location is selected
    data.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${index + 1}: Quantity must be a positive number`,
          // attach to the specific field for better feedback
          path: ["items", index, "quantity"],
        });
      }
      if (!item.location_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${index + 1}: Location is required`,
          // attach to the specific field for better feedback
          path: ["items", index, "location_id"],
        });
      }
    });
  });

export type UpdateMenuFormValues = z.infer<typeof updateMenuSchema>;

const MENU_INFO_FIELDS = [
  "name",
  "image",
  "description",
  "price",
  "is_a_la_carte",
  "type",
  "category_ids",
] as const;

export default function UpdateMenusPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const apolloClient = useApolloClient();

  const { data, error } = useQuery(GetMenuByIdDocument, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network", // Toujours essayer de récupérer les données fraîches
    notifyOnNetworkStatusChange: true,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [priceInput, setPriceInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("details");

  const { data: menuCategories } = useQuery<GetMenuCategoriesQuery>(
    GetMenuCategoriesDocument,
    {
      fetchPolicy: "network-only",
    }
  );

  const menuFetched = data?.menu;

  const form = useForm<UpdateMenuFormValues>({
    resolver: zodResolver(updateMenuSchema),
    mode: "onChange", // Validation en temps réel
    defaultValues: {
      image: menuFetched?.image_url || "",
      name: menuFetched?.name || "",
      description: menuFetched?.description || "",
      price: menuFetched?.price || 0,
      is_a_la_carte: menuFetched?.is_a_la_carte || false,
      category_ids: menuFetched?.categories.map((cat) => cat.id) || [],
      type: menuFetched?.type || "",
      items:
        menuFetched?.items.map((item) => ({
          entity_id: item.entity.id,
          // champs UI pour l'IngredientPickerField
          name: item.entity.name,
          imageUrl: item.entity.image_url || null,
          locations: item.entity.quantities.map((q) => ({
            id: q.location.id,
            name: q.location.name,
            quantityInLocation: q.quantity,
          })),
          entity_type:
            item.entity.__typename === "Ingredient"
              ? "ingredient"
              : "preparation",
          quantity: item.quantity,
          unit: item.unit,
          location_id: item.location.id,
          storage_unit: item.entity.unit,
        })) || [],
    },
  });

  useEffect(() => {
    if (menuFetched) {
      form.reset({
        image: menuFetched.image_url || "",
        name: menuFetched.name || "",
        description: menuFetched.description || "",
        price: menuFetched.price || 0,
        is_a_la_carte: menuFetched.is_a_la_carte || false,
        category_ids: menuFetched.categories.map((cat) => cat.id) || [],
        type: menuFetched.type || "",
        items:
          menuFetched.items.map((item) => ({
            entity_id: item.entity.id,
            // champs UI pour l'IngredientPickerField
            name: item.entity.name,
            imageUrl: item.entity.image_url || null,
            locations: item.entity.quantities.map((q) => ({
              id: q.location.id,
              name: q.location.name,
              quantityInLocation: q.quantity,
            })),
            entity_type:
              item.entity.__typename === "Ingredient"
                ? "ingredient"
                : "preparation",
            quantity: item.quantity,
            unit: item.unit,
            location_id: item.location.id,
            storage_unit: item.entity.unit,
          })) || [],
      });
      setPriceInput(
        menuFetched.price ? menuFetched.price.toFixed(2).replace(".", ",") : ""
      );
    }
  }, [menuFetched, form]);

  const handleRemoveImage = () => {
    setFilePreview(null);
    form.setValue("image", undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleValidationErrors: SubmitErrorHandler<UpdateMenuFormValues> = (
    errors
  ) => {
    const hasMenuInfoErrors = MENU_INFO_FIELDS.some((field) =>
      Boolean(errors[field])
    );

    if (hasMenuInfoErrors) {
      setActiveTab("details");
      return;
    }

    if (errors.items) {
      setActiveTab("ingredients");
    }
  };

  if (error) {
    return <div>Error loading menu: {error.message}</div>;
  }

  const onMenusUpdateSubmit = form.handleSubmit(
    async (values: UpdateMenuFormValues) => {
      try {
        const res = await updateMenuAction(id, values);

        if (res.success) {
          // Invalider le cache Apollo en arrière-plan (sans attendre)
          apolloClient.refetchQueries({
            include: [GetMenuByIdDocument],
          });

          // Redirection immédiate - RHF garde isSubmitting=true jusqu'à la redirection
          router.push(`/menus/${id}`);
        } else {
          // Build a helpful, user-facing error message with potential resolution
          let message = "An error occurred while creating the menu.";
          const detailMessage = (() => {
            try {
              if (res && typeof res === "object") {
                const anyRes = res as unknown as {
                  details?: unknown;
                  error?: string;
                };
                if (
                  anyRes.details &&
                  typeof anyRes.details === "object" &&
                  "message" in (anyRes.details as Record<string, unknown>) &&
                  typeof (anyRes.details as { message?: unknown }).message ===
                    "string"
                ) {
                  return (anyRes.details as { message: string }).message;
                }
                if (typeof anyRes.error === "string" && anyRes.error.trim()) {
                  return anyRes.error;
                }
              }
            } catch {}
            return null;
          })();

          if (detailMessage) {
            message = detailMessage;
          }

          // Add targeted tips based on the error
          const tips: string[] = [];
          const lower = message.toLowerCase();
          if (
            lower.includes("authentication") ||
            lower.includes("unauthorized")
          ) {
            tips.push("You must be authenticated. Please sign in again.");
          }
          if (lower.includes("session expired") || lower.includes("419")) {
            tips.push(
              "Your session has expired. Refresh the page, then try again."
            );
          }
          if (lower.includes("validation") || lower.includes("422")) {
            tips.push("Fix the fields with errors, then submit again.");
          }
          if (tips.length === 0) {
            tips.push(
              "Check required fields, image format/size, and your network connection."
            );
          }

          const combinedMessage = [message, ...tips].join("\n");

          form.setError("root", {
            type: "server",
            message: combinedMessage,
          });
        }
      } catch {
        // Gestion d'erreur globale
        form.setError("root", {
          type: "server",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    },
    handleValidationErrors
  );

  return (
    <div className="w-full p-4 lg:p-6">
      <Form {...form}>
        <form
          onSubmit={onMenusUpdateSubmit}
          className="w-full max-w-6xl mx-auto"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="w-full max-w-4xl mx-auto mb-10">
              <div className="relative bg-gray-50 rounded-2xl p-2 shadow-sm border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    variant={
                      activeTab === "details" ? "khp-solid" : "khp-outline"
                    }
                    className="transition-colors"
                  >
                    <ChefHat className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-semibold">
                      Menu Information
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={
                      activeTab === "ingredients" ? "khp-solid" : "khp-outline"
                    }
                    onClick={() => setActiveTab("ingredients")}
                    className="transition-colors"
                  >
                    <Package className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-semibold">Ingredients</span>
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="details" className="mt-0">
              <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
                <div className="flex-1 space-y-6">
                  {filePreview ||
                  (menuFetched?.image_url &&
                    form.watch("image") !== undefined) ? (
                    <div className="relative max-w-1/2 w-full my-6 mx-auto">
                      <img
                        src={filePreview || menuFetched?.image_url || undefined}
                        alt={"Menu Image"}
                        className="aspect-square object-cover w-full h-full rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => inputRef.current?.click()}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative max-w-1/2 w-full my-6 mx-auto">
                      <ImageAdd
                        className="w-full aspect-square"
                        iconSize={32}
                        onClick={() => inputRef.current?.click()}
                      />
                    </div>
                  )}

                  {form.formState.errors.image && (
                    <div className="w-full text-red-500 text-sm mt-1 text-center">
                      {form.formState.errors.image.message ||
                        "Please select an image."}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { ref, onChange, name } }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input
                            variant="khp-default"
                            type="file"
                            name={name}
                            accept="image/jpeg, image/png, image/jpg"
                            max={1048576}
                            capture="environment"
                            ref={(e: HTMLInputElement | null) => {
                              ref(e);
                              inputRef.current = e;
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFilePreview(reader.result as string);
                                  onChange(file);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                setFilePreview(null);
                                onChange(undefined);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      name="type"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            Type <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <SelectTrigger className="w-full border-khp-primary">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="breakfast">
                                  Breakfast
                                </SelectItem>
                                <SelectItem value="lunch">Lunch</SelectItem>
                                <SelectItem value="dinner">Dinner</SelectItem>
                                <SelectItem value="snack">Snack</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category_ids"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            Categories <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(value ? [value] : [])
                              }
                              value={field.value?.[0] ?? undefined}
                            >
                              <SelectTrigger className="w-full border-khp-primary">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {menuCategories?.menuCategories.data.map(
                                  (category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={String(category.id)}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            {/* Accepte les virgules comme séparateur décimal (ex: 10,90) */}
                            <Input
                              variant="khp-default"
                              type="text"
                              inputMode="decimal"
                              name={field.name}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              value={priceInput}
                              placeholder="Ex: 10,90"
                              onChange={(e) => {
                                const val = e.target.value;
                                setPriceInput(val);
                                const normalized = val
                                  .replace(/\s+/g, "")
                                  .replace(",", ".")
                                  .replace(/[^0-9.]/g, "");
                                const num = normalized
                                  ? Number(normalized)
                                  : NaN;
                                // Met à jour la valeur du formulaire en nombre, 0 si invalide pour déclencher la validation
                                field.onChange(Number.isFinite(num) ? num : 0);
                              }}
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
                          <FormLabel>
                            Available &quot;à la carte&quot;
                          </FormLabel>
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="mt-0">
              <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
                <div className="flex-1">
                  <IngredientPickerField
                    form={form}
                    hasErrors={form.formState.errors.items}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {form.formState.errors.root?.message && (
            <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
              <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {form.formState.errors.root.message
                      .split("\n")
                      .map((line, idx) => (
                        <p
                          key={idx}
                          className={`text-sm ${idx === 0 ? "font-medium" : ""} text-khp-error`}
                        >
                          {line}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto mt-4">
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <Button
                variant="khp-destructive"
                type="button"
                className="flex-1"
                disabled={form.formState.isSubmitting}
                onClick={() => router.push(`/menus/${id}`)}
              >
                Cancel
              </Button>

              <Button
                variant="khp-default"
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Updating..." : "Update Menu"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
