"use client";

import ErrorPage from "@/components/error-page";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function IngredientError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      defaultMessage="An error occurred while loading the ingredient page."
      backHref="/dashboard"
      backLabel="Go to Dashboard"
    />
  );
}
