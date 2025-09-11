"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import { httpClient } from "@/lib/httpClient";
import { LoginForm, LoginFormValues } from "@/components/login-form";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "KHP";

export default function Login() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: LoginFormValues) {
    setErrors({});
    setIsLoading(true);

    try {
      await httpClient.post("/api/login", values);
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      setErrors({
        auth: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-lg font-bold">{APP_NAME}</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              handleSubmit={handleSubmit}
              errors={errors}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      <div className="bg-khp-primary relative hidden lg:block"></div>
    </div>
  );
}
