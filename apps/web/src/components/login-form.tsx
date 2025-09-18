"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  handleSubmit: (values: LoginFormValues) => void;
  errors?: Record<string, string>;
  isLoading?: boolean;
}

export function LoginForm({
  handleSubmit,
  errors = {},
  isLoading = false,
}: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={"flex flex-col gap-6"}
      >
        {errors.auth && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {errors.auth}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example@goofykhp.com"
                  {...field}
                  className="border-khp-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  {...field}
                  className="border-khp-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="khp-default" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in...
            </span>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </Form>
  );
}
