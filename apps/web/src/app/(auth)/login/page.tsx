"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { httpClient } from "@/lib/httpClient";
import { LoginForm } from "@workspace/ui/components/login-form";

interface ValidationErrors {
  [key: string]: string[];
}

interface ErrorResponse {
  errors?: ValidationErrors;
  message?: string;
}
interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  token?: string;
}

export default function Login() {
  const router = useRouter();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setGeneralError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await httpClient.post<LoginResponse>("/api/login", {
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      try {
        const errorObj = error as Error;

        if (errorObj.message.startsWith("HTTP error 422: ")) {
          const errorData: ErrorResponse = JSON.parse(
            errorObj.message.replace("HTTP error 422: ", ""),
          );

          if (errorData.errors) {
            setErrors(errorData.errors);
          } else {
            setGeneralError(
              errorData.message || "Mismatched credentials or server error",
            );
          }
        } else {
          setGeneralError("Mismatched credentials or server error");
        }
      } catch {
        setGeneralError("Mismatched credentials or server error");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function translateError(error: string): string {
    switch (error) {
      case "validation.required":
        return "This field is required.";
      default:
        return error;
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
            KHP
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {generalError && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded border border-red-200">
                {generalError}
              </div>
            )}

            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />

            {errors.email && (
              <div className="mt-2 text-red-500 text-sm">
                Email: {translateError(errors.email[0])}
              </div>
            )}
            {errors.password && (
              <div className="mt-2 text-red-500 text-sm">
                Mot de passe: {translateError(errors.password[0])}
              </div>
            )}
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
