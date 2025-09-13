"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useApolloClient, useQuery } from "@apollo/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
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
import {
  Settings,
  RotateCcw,
  Save,
  AlertTriangle,
  Loader2,
  Plus,
  Notebook,
  Check,
  Calendar,
  Minus,
} from "lucide-react";
import { GetQuickAccessesDocument } from "@/graphql/generated/graphql";
import React from "react";
import { updateQuickAccessAction, resetQuickAccessAction } from "./actions";

type PageFormData = {
  quickAccesses: Array<{
    id: number;
    name: string;
    icon: string;
    icon_color: "primary" | "warning" | "error" | "info";
    url_key: string;
  }>;
  showResetDialog: boolean;
  isResetting: boolean;
  resetError: string | null;
};

const iconOptions = [
  { value: "Plus", label: "Plus", icon: Plus },
  { value: "Notebook", label: "Notebook", icon: Notebook },
  { value: "Check", label: "Check", icon: Check },
  { value: "Calendar", label: "Calendar", icon: Calendar },
  { value: "Minus", label: "Minus", icon: Minus },
];

const colorOptions = [
  { value: "primary", label: "Primary", color: "text-khp-primary" },
  { value: "warning", label: "Warning", color: "text-yellow-600" },
  { value: "error", label: "Error", color: "text-red-600" },
  { value: "info", label: "Info", color: "text-blue-600" },
];

export default function QuickAccessPage() {
  const apolloClient = useApolloClient();

  const { data, loading, refetch } = useQuery(GetQuickAccessesDocument);

  const form = useForm<PageFormData>({
    defaultValues: {
      quickAccesses: [],
      showResetDialog: false,
      isResetting: false,
      resetError: null,
    },
    mode: "onChange",
  });

  const { handleSubmit, watch, setValue, formState } = form;
  const quickAccesses = watch("quickAccesses");
  const showResetDialog = watch("showResetDialog");
  const isResetting = watch("isResetting");
  const resetError = watch("resetError");

  // Update form when data loads
  React.useEffect(() => {
    if (data?.quickAccesses) {
      setValue(
        "quickAccesses",
        data.quickAccesses.map((qa) => ({
          id: parseInt(qa.id),
          name: qa.name,
          icon: qa.icon,
          icon_color: qa.icon_color as "primary" | "warning" | "error" | "info",
          url_key: qa.url_key,
        }))
      );
    }
  }, [data?.quickAccesses, setValue]);

  const onSubmit = handleSubmit(async (formData) => {
    try {
      const result = await updateQuickAccessAction({
        quick_accesses: formData.quickAccesses,
      });

      if (result.success) {
        await refetch();
      } else {
        form.setError("root", {
          message: result.error || "Error updating quick access buttons",
        });
      }
    } catch (error) {
      console.error("Error updating quick access:", error);
      form.setError("root", {
        message: "Error updating quick access buttons",
      });
    }
  });

  const handleReset = async () => {
    setValue("isResetting", true);
    setValue("resetError", null);

    try {
      const result = await resetQuickAccessAction();
      if (result.success) {
        await refetch();
        setValue("showResetDialog", false);
      } else {
        setValue(
          "resetError",
          result.error || "Error resetting quick access buttons"
        );
      }
    } catch (error) {
      console.error("Error resetting quick access:", error);
      setValue("resetError", "Error resetting quick access buttons");
    } finally {
      setValue("isResetting", false);
    }
  };

  const handleCancelReset = () => {
    setValue("showResetDialog", false);
    setValue("resetError", null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-khp-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary flex items-center gap-3">
              <Settings className="h-7 w-7 text-khp-primary" />
              Quick Access Management
            </h1>
            <p className="text-khp-text-secondary mt-2 text-base">
              Configure your quick access buttons for faster navigation
            </p>
          </div>
          <Button
            onClick={() => setValue("showResetDialog", true)}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
          >
            <RotateCcw className="h-5 w-5" />
            Reset to Default
          </Button>
        </div>
      </div>

      <Card className="bg-khp-surface border-khp-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-khp-text-primary">
            Quick Access Buttons Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              {quickAccesses.map((_, index) => {
                const IconComponent =
                  iconOptions.find(
                    (opt) => opt.value === quickAccesses[index]?.icon
                  )?.icon || Settings;

                return (
                  <Card key={index} className="border border-khp-border">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        Button {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`quickAccesses.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Button name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`quickAccesses.${index}.url_key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Key</FormLabel>
                              <FormControl>
                                <Input placeholder="URL key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {index !== 4 ? (
                          <FormField
                            control={form.control}
                            name={`quickAccesses.${index}.icon`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Icon</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select an icon" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {iconOptions.map((option) => {
                                      const Icon = option.icon;
                                      return (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            {option.label}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500 text-sm">
                              No icon for this button
                            </p>
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name={`quickAccesses.${index}.icon_color`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon Color</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorOptions.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-3 h-3 rounded-full ${option.color.replace("text-", "bg-")}`}
                                        />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {formState.errors.root?.message && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800 leading-relaxed">
                      {formState.errors.root.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 text-base font-semibold"
                  variant="khp-default"
                >
                  {formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <AlertDialog
        open={showResetDialog}
        onOpenChange={(open) => !open && handleCancelReset()}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl text-gray-900">
                  Reset Quick Access
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  This will restore default settings
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Are you sure you want to reset all quick access buttons to their
              default values? This action will overwrite your current
              configuration.
            </p>

            {resetError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 leading-relaxed">
                    {resetError}
                  </p>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelReset}
              disabled={isResetting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isResetting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting...
                </div>
              ) : (
                "Reset to Default"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
