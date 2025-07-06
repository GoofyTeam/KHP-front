"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { httpClient } from "@/lib/httpClient";
import {
  LoginForm,
  LoginFormValues,
} from "@workspace/ui/components/login-form";

export default function Login() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
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
            GoofyTeam
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
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          width={800}
          height={600}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
