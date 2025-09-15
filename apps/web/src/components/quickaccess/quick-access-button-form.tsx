"use client";

import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import {
  Settings,
  Save,
  Loader2,
  Plus,
  Notebook,
  Check,
  Calendar,
  Minus,
} from "lucide-react";
import { updateQuickAccessAction } from "@/app/(mainapp)/settings/quick-access/actions";

type QuickAccessButtonData = {
  id: number;
  name: string;
  icon: string;
  icon_color: "primary" | "warning" | "error" | "info";
  url_key: string;
};

interface QuickAccessButtonProps {
  index: number;
  data: QuickAccessButtonData;
  onUpdate: () => void;
}

const iconOptions = [
  { value: "Plus", label: "Plus", icon: Plus },
  { value: "Notebook", label: "Notebook", icon: Notebook },
  { value: "Check", label: "Check", icon: Check },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  { value: "Minus", label: "Minus", icon: Minus },
];

const urlKeyOptions = [
  { value: "add_to_stock", label: "Add to Stock" },
  { value: "menu_card", label: "Menu Card" },
  { value: "stock", label: "Stock" },
  { value: "take_order", label: "Take Order" },
  { value: "move_quantity", label: "Move Quantity" },
];

const colorOptions = [
  { value: "primary", label: "Primary", color: "bg-khp-primary" },
  { value: "warning", label: "Warning", color: "bg-khp-warning" },
  { value: "error", label: "Error", color: "bg-khp-error" },
  { value: "info", label: "Info", color: "bg-khp-info" },
];

export default function QuickAccessButtonForm({
  index,
  data,
  onUpdate,
}: QuickAccessButtonProps) {
  const form = useForm<QuickAccessButtonData>({
    defaultValues: data,
    mode: "onChange",
  });

  const { handleSubmit, formState } = form;

  const IconComponent =
    iconOptions.find((opt) => opt.value === form.watch("icon"))?.icon ||
    Settings;

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const result = await updateQuickAccessAction({
        quick_accesses: [formData],
      });

      if (result.success) {
        onUpdate();
      } else {
        form.setError("root", {
          message: result.error || "Error updating quick access button",
        });
      }
    } catch {
      form.setError("root", {
        message: "Error updating quick access button",
      });
    }
  });

  return (
    <Card className="border border-khp-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Button {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-khp-text-primary">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Button name"
                        disabled={formState.isSubmitting}
                        className="w-full h-12 text-base border-2 border-khp-primary/20 rounded-lg focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 focus:bg-khp-primary/5 transition-all duration-200 px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary shadow-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-khp-error text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-khp-text-primary">
                      URL Key
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full !h-12 text-base border-2 border-khp-primary/20 rounded-lg focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 focus:bg-khp-primary/5 transition-all duration-200">
                          <SelectValue placeholder="Select URL key" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        {urlKeyOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                          >
                            <span className="font-medium text-khp-text-primary">
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-khp-error text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {index !== 4 ? (
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-khp-text-primary">
                        Icon
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={formState.isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full !h-12 text-base border-2 border-khp-primary/20 rounded-lg focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 focus:bg-khp-primary/5 transition-all duration-200">
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-72">
                          {iconOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 text-khp-primary" />
                                  <span className="font-medium text-khp-text-primary">
                                    {option.label}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-khp-error text-sm" />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="flex items-center justify-center p-4 border-2 border-dashed border-khp-primary/30 bg-khp-primary/5 rounded-lg">
                  <p className="text-khp-text-secondary text-sm font-medium">
                    No icon for this button
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="icon_color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-khp-text-primary">
                      Icon Color
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full !h-12 text-base border-2 border-khp-primary/20 rounded-lg focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 focus:bg-khp-primary/5 transition-all duration-200">
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        {colorOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full ${option.color} shadow-sm`}
                              />
                              <span className="font-medium text-khp-text-primary">
                                {option.label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-khp-error text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {formState.errors.root?.message && (
              <div className="p-4 bg-khp-error/10 border border-khp-error/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-khp-error rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm text-khp-error font-medium leading-relaxed">
                    {formState.errors.root.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={formState.isSubmitting}
                className="flex items-center gap-2 h-12 px-6 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                variant="khp-default"
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
