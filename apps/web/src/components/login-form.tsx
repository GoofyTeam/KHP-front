"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

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
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
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

  useEffect(() => {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
    const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value;
    if (email || password) {
      form.reset({ email, password });
    }
  }, [form]);

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
                <Input placeholder="Email" {...field} />
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
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Mot de passe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </Form>
  );
}
