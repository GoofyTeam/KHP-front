"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { httpClient } from "@/lib/httpClient";
import { LoginForm } from "@workspace/ui/components/login-form";

// Interface pour les erreurs de validation
interface ValidationErrors {
  [key: string]: string[];
}

// Interface pour la réponse d'erreur de l'API
interface ErrorResponse {
  errors?: ValidationErrors;
  message?: string;
}

// Interface pour la réponse de l'API lors de la connexion
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
        const errorData: ErrorResponse = JSON.parse(
          errorObj.message.replace("Erreur HTTP 422: ", ""),
        );

        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setGeneralError(
            errorData.message || "Identifiants incorrects ou erreur de serveur",
          );
        }
      } catch (parseError) {
        setGeneralError("Identifiants incorrects ou erreur de serveur");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function translateError(error: string): string {
    switch (error) {
      case "validation.required":
        return "Ce champ est requis";
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Connexion</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Entrez vos identifiants pour vous connecter
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemple@email.com"
                    required
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${errors.email ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {translateError(errors.email[0])}
                    </p>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <label htmlFor="password">Mot de passe</label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Mot de passe oublié?
                    </a>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className={`flex h-10 w-full rounded-md border ${errors.password ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {translateError(errors.password[0])}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </button>
              </div>
            </form>
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
